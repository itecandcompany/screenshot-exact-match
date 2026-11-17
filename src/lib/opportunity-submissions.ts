export interface OpportunitySubmissionDraft {
  title: string;
  description: string;
  country: string;
  region: string;
  city: string;
  channel: string;
  opportunityType: string;
  eligibility: string;
  deadline: string;
  sourceUrl: string;
  sourceName: string;
  sourceEvidence: string;
}

export interface OpportunitySubmissionPayload {
  title: string;
  description: string;
  country: string;
  region: string | null;
  city: string | null;
  channel: string | null;
  opportunity_type: string | null;
  eligibility: string | null;
  deadline: string | null;
  source_url: string;
  source_name: string | null;
  source_evidence: string;
}

function optionalText(value: string, field: string, maxLength: number): string | null {
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(field + " must be " + maxLength + " characters or fewer.");
  }
  return trimmed || null;
}

export function normalizeOpportunitySubmission(
  draft: OpportunitySubmissionDraft,
): OpportunitySubmissionPayload {
  const title = draft.title.trim();
  if (title.length < 5 || title.length > 160) {
    throw new Error("Opportunity title must be between 5 and 160 characters.");
  }

  const country = draft.country.trim() || "Tanzania";
  if (country.length < 2 || country.length > 80) {
    throw new Error("Country must be between 2 and 80 characters.");
  }

  let source: URL;
  try {
    source = new URL(draft.sourceUrl.trim());
  } catch {
    throw new Error("Enter a valid source URL.");
  }

  if (
    (source.protocol !== "https:" && source.protocol !== "http:") ||
    source.username.length > 0 ||
    source.password.length > 0
  ) {
    throw new Error("Source links must use HTTP or HTTPS and cannot contain embedded credentials.");
  }

  const sourceEvidence = draft.sourceEvidence.trim();
  if (sourceEvidence.length < 20 || sourceEvidence.length > 4000) {
    throw new Error("Source evidence must be between 20 and 4,000 characters.");
  }

  const description = draft.description.trim();
  if (description.length > 3000) {
    throw new Error("Description must be 3,000 characters or fewer.");
  }

  const rawDeadline = draft.deadline.trim();
  let deadline: string | null = null;
  if (rawDeadline) {
    const parsedDeadline = new Date(rawDeadline);
    if (Number.isNaN(parsedDeadline.getTime())) {
      throw new Error("Enter a valid opportunity deadline.");
    }
    deadline = parsedDeadline.toISOString();
  }

  return {
    title,
    description,
    country,
    region: optionalText(draft.region, "Region", 120),
    city: optionalText(draft.city, "City", 120),
    channel: optionalText(draft.channel, "Channel", 120),
    opportunity_type: optionalText(draft.opportunityType, "Opportunity type", 120),
    eligibility: optionalText(draft.eligibility, "Eligibility", 1000),
    deadline,
    source_url: source.toString(),
    source_name: optionalText(draft.sourceName, "Source name", 160),
    source_evidence: sourceEvidence,
  };
}
