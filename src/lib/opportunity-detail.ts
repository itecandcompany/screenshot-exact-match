const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isOpportunityId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function getOpportunityDetailHref(
  value: string | null | undefined,
): string | null {
  if (!value || !isOpportunityId(value)) return null;
  return `/plus/opportunities/${value}`;
}
