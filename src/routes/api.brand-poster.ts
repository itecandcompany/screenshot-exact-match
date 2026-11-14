import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function publicUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
      host.endsWith(".internal") || host === "0.0.0.0" || host === "::1" ||
      /^127\\./.test(host) || /^10\\./.test(host) || /^192\\.168\\./.test(host) ||
      /^169\\.254\\./.test(host) || /^172\\.(1[6-9]|2\\d|3[01])\\./.test(host) ||
      /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host)) return null;
    return url;
  } catch { return null; }
}

async function readPage(url: URL) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "NEXTDOOR-ADS-BrandAudit/1.0", Accept: "text/html" },
  });
  if (!response.ok) throw new Error("We could not read that website.");
  const html = await response.text();
  if (html.length > 1_500_000) throw new Error("That website is too large to process.");
  const raw = [
    ...[...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<img\\b[^>]*>/gi)].map((m) => {
      const tag = m[0];
      return tag.match(/(?:src|data-src)=["']([^"']+)["']/i)?.[1] ||
        tag.match(/srcset=["']([^"']+)["']/i)?.[1]?.split(",")[0]?.trim().split(/\\s+/)[0] || "";
    }),
  ];
  const images = [...new Set(raw.map((value) => {
    try { return new URL(value, url).toString(); } catch { return ""; }
  }).filter((value) => {
    const candidate = publicUrl(value);
    if (!candidate) return false;
    const extension = /\\.(jpe?g|png|webp)(?:[?#]|$)/i.test(candidate.pathname + candidate.search);
    const knownCdn = candidate.hostname === url.hostname ||
      candidate.hostname.endsWith("cloudinary.com") ||
      candidate.hostname.endsWith("imgix.net") ||
      candidate.hostname.endsWith("images.unsplash.com") ||
      candidate.hostname.endsWith("googleusercontent.com");
    return extension || knownCdn;
  }))].slice(0, 8);
  const title = html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || url.hostname;
  const plainText = html.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim().slice(0, 7000);
  return { images, title, plainText, url: url.toString() };
}

async function imagePart(url: string) {
  let current = publicUrl(url);
  if (!current) throw new Error("A website image address was not valid.");
  const response = await fetch(current, {
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "NEXTDOOR-ADS-BrandAudit/1.0", Accept: "image/jpeg,image/png,image/webp" },
  });
  if (!response.ok) throw new Error("A brand image could not be downloaded.");
  const mimeType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) throw new Error("A selected brand asset is not a supported image.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 6_000_000) throw new Error("A brand image is too large to use.");
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { inlineData: { mimeType, data: btoa(binary) } };
}

export const Route = createFileRoute("/api/brand-poster")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return json({ error: "The AI poster service is not configured." }, 503);
        try {
          const body = await request.json();
          const brandUrl = typeof body.brandUrl === "string" ? body.brandUrl.trim() : "";
          const requestedImages = Array.isArray(body.imageUrls) ? body.imageUrls.filter((v: unknown) => typeof v === "string").slice(0, 3) as string[] : [];
          const headline = typeof body.headline === "string" ? body.headline.slice(0, 140) : "";
          const subheadline = typeof body.subheadline === "string" ? body.subheadline.slice(0, 180) : "";
          const cta = typeof body.cta === "string" ? body.cta.slice(0, 60) : "Learn more";
          const pageUrl = publicUrl(brandUrl);
          if (!pageUrl || !requestedImages.length) return json({ error: "Run a brand audit first so we can use its website images." }, 400);
          const page = await readPage(pageUrl);
          const approved = requestedImages.filter((image) => page.images.includes(image));
          if (!approved.length) return json({ error: "Those images were not found on the submitted website. Please run the audit again." }, 400);
          const parts: any[] = [];
          for (const imageUrl of approved.slice(0, 2)) {
            try { parts.push(await imagePart(imageUrl)); } catch { /* Skip unavailable images and continue with other selected assets. */ }
          }
          if (!parts.length) return json({ error: "We could not load the selected website images. Try another brand image." }, 400);
          const prompt = `Create a polished, finished 4:5 social media advertising poster for the business shown in the attached real website photos.
Use the attached website assets as the actual product/brand imagery. Preserve the real product, food, people, packaging and physical details; do not replace them with stock imagery or invent products. Use the website's visual identity: infer its palette, mood and market positioning from this page evidence. Do not invent or redraw a logo; if no logo image is supplied, leave a clean area for the brand logo to be added later.
Poster copy (spell exactly; do not add fake claims):
Headline: ${headline || "A better way to discover this brand"}
Supporting line: ${subheadline || page.title}
Call to action: ${cta}
Brand name/site: ${page.title} / ${page.url}
Website context: ${page.plainText.slice(0, 3500)}
Design it like a professional agency campaign: strong hierarchy, readable typography, deliberate negative space, excellent contrast, premium composition, clear focal product image, brand-consistent colours. Output the poster artwork, not a mockup on a wall or phone. No extra logos, watermarks, prices, phone numbers, addresses or claims unless explicitly present in the supplied copy.`;
          const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            signal: AbortSignal.timeout(60000),
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [...parts, { text: prompt }] }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.7 },
            }),
          });
          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error("Gemini poster generation failed", response.status, errorBody?.error?.status || "unknown");
            return json({ error: response.status === 429 ? "The image service is busy. Please try again shortly." : "We could not generate the poster right now. Please try again." }, response.status === 429 ? 429 : 502);
          }
          const result = await response.json();
          const outputParts = result?.candidates?.[0]?.content?.parts || [];
          const image = outputParts.find((part: any) => part.inlineData?.data);
          if (!image) return json({ error: "The image model did not return a poster. Please try again." }, 502);
          return json({ poster: `data:${image.inlineData.mimeType || "image/png"};base64,${image.inlineData.data}`, mimeType: image.inlineData.mimeType || "image/png" });
        } catch (error) {
          console.error("Brand poster request failed", error instanceof Error ? error.message : "unknown");
          return json({ error: error instanceof Error ? error.message : "We could not generate the poster." }, 400);
        }
      },
    },
  },
});
