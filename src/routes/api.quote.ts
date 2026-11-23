import { createFileRoute } from "@tanstack/react-router";
import { quoteSchema } from "@/content/quote";
import { services } from "@/content/services";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map<string, number[]>();

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["RESEND_API_KEY"];
        const recipient = process.env["RESEND_TO_EMAIL"];
        const sender = process.env["RESEND_FROM_EMAIL"] || "NEXTDOOR ADS <onboarding@resend.dev>";

        if (!apiKey || !recipient) {
          return json({ error: "The enquiry email service is not configured yet. Please contact us directly." }, 503);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Please check the form and try again." }, 400);
        }

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          return json({ error: "Please check the form and try again." }, 400);
        }

        const payload = body as Record<string, unknown>;
        const parsed = quoteSchema.safeParse(payload);
        if (!parsed.success) {
          return json({ error: "Some enquiry details are missing or invalid. Please review the form." }, 400);
        }

        const auditReport = typeof payload.auditReport === "string"
          ? payload.auditReport.slice(0, 20000)
          : "";
        const clientIp = request.headers.get("x-real-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown";
        const now = Date.now();
        const recent = (requests.get(clientIp) || []).filter((time) => now - time < WINDOW_MS);
        if (recent.length >= MAX_REQUESTS) {
          return json({ error: "Too many enquiries were submitted from this connection. Please wait a little and try again." }, 429);
        }
        recent.push(now);
        requests.set(clientIp, recent);

        const data = parsed.data;
        const serviceName = services.find((service) => service.slug === data.service)?.title || data.service;
        const subject = `New project enquiry — ${data.business}`;
        const lines = [
          "NEW PROJECT ENQUIRY — NEXTDOOR ADS",
          "",
          `Name: ${data.name}`,
          `Business: ${data.business}`,
          `Email: ${data.email}`,
          `Phone / WhatsApp: ${data.phone}`,
          `Service: ${serviceName}`,
          `Budget: ${data.budget}`,
          `Preferred contact: ${data.contact}`,
          "",
          "PROJECT DETAILS",
          data.description,
          auditReport ? "\n\n" + auditReport : "",
        ];
        const textBody = lines.join("\n");
        const htmlBody = `<h2>New project enquiry — NEXTDOOR ADS</h2><dl>${[
          ["Name", data.name],
          ["Business", data.business],
          ["Email", data.email],
          ["Phone / WhatsApp", data.phone],
          ["Service", serviceName],
          ["Budget", data.budget],
          ["Preferred contact", data.contact],
        ].map(([label, value]) => `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl><h3>Project details</h3><p>${escapeHtml(data.description).replace(/\n/g, "<br>")}</p>${auditReport ? `<h3>AI brand audit</h3><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(auditReport)}</pre>` : ""}`;

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            signal: AbortSignal.timeout(12000),
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: sender,
              to: [recipient],
              reply_to: data.email,
              subject,
              text: textBody,
              html: htmlBody,
            }),
          });

          if (!response.ok) {
            const detail = await response.text().catch(() => "");
            console.error("Resend quote delivery failed", response.status, detail.slice(0, 500));
            return json({ error: "We could not send your enquiry just now. Please try again or contact us directly." }, 502);
          }

          return json({ success: true });
        } catch (error) {
          console.error("Quote email request failed", error instanceof Error ? error.message : "unknown");
          return json({ error: "The email service did not respond. Please try again shortly." }, 502);
        }
      },
    },
  },
});
