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


export type OpportunityDeadlineStatus =
  | "no_deadline"
  | "upcoming"
  | "closing_soon"
  | "expired"
  | "invalid";

export type OpportunityDeadlineFilter =
  | "active"
  | "all"
  | "closing_soon"
  | "no_deadline"
  | "expired";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

function parseOpportunityDeadline(value: string): number {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!dateOnly) return Date.parse(value);

  const calendarDay = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(calendarDay.getTime()) ||
    calendarDay.toISOString().slice(0, 10) !== value
  ) {
    return Number.NaN;
  }

  // Tanzania is UTC+03:00. A date-only deadline remains valid through 23:59:59 local time.
  return Date.parse(`${value}T23:59:59.999+03:00`);
}

export function getOpportunityDeadlineStatus(
  value: string | null | undefined,
  now = Date.now(),
): OpportunityDeadlineStatus {
  if (!value || !value.trim()) return "no_deadline";

  const deadline = parseOpportunityDeadline(value.trim());
  if (!Number.isFinite(deadline)) return "invalid";

  const remaining = deadline - now;
  if (remaining <= 0) return "expired";
  if (remaining <= SEVEN_DAYS_IN_MS) return "closing_soon";
  return "upcoming";
}

export function getOpportunityDeadlineLabel(
  status: OpportunityDeadlineStatus,
): string {
  const labels: Record<OpportunityDeadlineStatus, string> = {
    no_deadline: "No deadline listed",
    upcoming: "Upcoming deadline",
    closing_soon: "Closing within 7 days",
    expired: "Past deadline",
    invalid: "Deadline needs verification",
  };
  return labels[status];
}
