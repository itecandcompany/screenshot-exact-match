export function formatOpportunityDate(value: string | null | undefined): string | null {
  if (!value) return null;

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  const hasTime = /T\d{2}:\d{2}/.test(value);
  const options: Intl.DateTimeFormatOptions = hasTime
    ? { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dar_es_Salaam" }
    : { dateStyle: "medium", timeZone: "Africa/Dar_es_Salaam" };

  return new Intl.DateTimeFormat("en-GB", options).format(timestamp);
}
