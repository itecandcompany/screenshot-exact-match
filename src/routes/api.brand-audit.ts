import { createFileRoute } from "@tanstack/react-router";

type AuditInput = { brandUrl?: string };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;
const requests = new Map<string, number[]>();

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isPublicWebUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (
      !host ||
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host === "0.0.0.0" ||
      host === "::1" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchBrandPage(input: string) {
  let current = isPublicWebUrl(input);
  if (!current) throw new Error("Enter a valid public website URL beginning with https://.");

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "NEXTDOOR-ADS-BrandAudit/1.0 (+https://nextdoor-ads.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("The website redirected too many times.");
      const next = isPublicWebUrl(new URL(location, current).toString());
      if (!next) throw new Error("The website redirected to an unsupported address.");
      current = next;
      continue;
    }

    if (!response.ok) throw new Error("We could not read that website. Check that it is public and try again.");
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) throw new Error("That address did not return a readable web page.");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("The website returned an empty response.");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 1_000_000) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const html = new TextDecoder().decode(
      chunks.reduce((all, chunk) => {
        const next = new Uint8Array(all.length + chunk.length);
        next.set(all);
        next.set(chunk, all.length);
        return next;
      }, new Uint8Array()),
    );
    const text = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
      .replace(/<(nav|footer|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "";
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)?.[1] || "";
    const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "";
    const imageAlts = [...html.matchAll(/<img[^>]+alt=["']([^"']+)["']/gi)]
      .slice(0, 12).map((match) => match[1]).filter(Boolean);
    return {
      url: current.toString(),
      title,
      description,
      ogTitle,
      ogDescription,
      imageAlts,
      pageText: text,
    };
  }
  throw new Error("We could not read that website.");
}

export const Route = createFileRoute("/api/brand-audit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return json({ error: "The AI audit service is not configured yet. Please try again later." }, 503);

        let body: AuditInput;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Please enter a valid website address." }, 400);
        }
        const brandUrl = typeof body.brandUrl === "string" ? body.brandUrl.trim() : "";
        if (!brandUrl || brandUrl.length > 500) return json({ error: "Enter a website URL to get started." }, 400);

        const clientIp = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const now = Date.now();
        const recent = (requests.get(clientIp) || []).filter((time) => now - time < WINDOW_MS);
        if (recent.length >= MAX_REQUESTS) return json({ error: "You have reached the quick-audit limit. Please try again in a few minutes." }, 429);
        recent.push(now);
        requests.set(clientIp, recent);

        try {
          const source = await fetchBrandPage(brandUrl);
          const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
          const prompt = `You are NEXTDOOR ADS, a practical advertising strategist serving small and growing businesses in Tanzania and East Africa.
Audit the brand using only the supplied public website evidence. Never invent facts, prices, guarantees, customer numbers, awards, or product features. If evidence is missing, say so.
Return valid JSON only with this exact shape:
{
 "brandName": "string",
 "summary": "string",
 "audience": "string",
 "positioning": "string",
 "score": 0,
 "scores": [{"label":"Hook strength","score":0,"note":"string"},{"label":"Offer clarity","score":0,"note":"string"},{"label":"Audience fit","score":0,"note":"string"},{"label":"Visual direction","score":0,"note":"string"}],
 "opportunities": ["string","string","string"],
 "videoScripts": [{"title":"string","duration":"15-20 seconds","hook":"string","scenes":[{"time":"0-3s","visual":"string","voiceover":"string"},{"time":"3-8s","visual":"string","voiceover":"string"},{"time":"8-15s","visual":"string","voiceover":"string"}],"caption":"string","hashtags":["#tag"]}],
 "staticAds": [{"headline":"string","subheadline":"string","visualDirection":"string","cta":"string"}]
}
Scores must be integers from 0 to 100. Return exactly 4 scores, 3 opportunities, 3 video scripts, and 2 static ads. Write natural, specific, concise copy. Use East African market context only when supported by the page. Keep all generated claims faithful to the source.
WEBSITE EVIDENCE:
URL: ${source.url}
Title: ${source.title}
Meta description: ${source.description}
Open Graph title: ${source.ogTitle}
Open Graph description: ${source.ogDescription}
Image alt text: ${source.imageAlts.join(" | ")}
Extracted page text: ${source.pageText}`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            signal: AbortSignal.timeout(30000),
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.55,
                maxOutputTokens: 5000,
              },
            }),
          });
          if (!response.ok) {
            const providerError = await response.json().catch(() => ({}));
            console.error("Gemini brand audit error", response.status, providerError?.error?.status || "unknown");
            if (response.status === 429) return json({ error: "The AI service is busy right now. Please try again shortly." }, 429);
            return json({ error: "The AI audit could not be completed. Please try again later." }, 502);
          }
          const result = await response.json();
          const output = result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
          if (!output) return json({ error: "The AI returned an empty audit. Please try again." }, 502);
          const audit = JSON.parse(output);
          return json({ audit, source: { url: source.url, title: source.title } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("valid public website") || message.includes("redirected") || message.includes("read that website") || message.includes("readable web page") || message.includes("empty response")) {
            return json({ error: message }, 400);
          }
          if (message.includes("fetch failed") || message.includes("timed out") || message.includes("Timeout")) {
            return json({ error: "The website took too long to respond. Please try another public page." }, 408);
          }
          console.error("Brand audit request failed", message);
          return json({ error: "We could not complete the audit. Please check the URL and try again." }, 500);
        }
      },
    },
  },
});
