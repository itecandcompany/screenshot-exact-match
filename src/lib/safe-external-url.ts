/**
 * Return a normalized HTTP(S) URL suitable for an external link.
 *
 * Opportunity records can predate current intake validation, so every URL
 * crossing into an anchor is checked again at render time.
 */
export function getSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value || value.length > 2048) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
