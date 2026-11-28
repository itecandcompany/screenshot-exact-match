import type { OpportunitySubmission } from "@/lib/supabase/client";

export type OpportunitySubmissionStatusFilter =
  | "all"
  | OpportunitySubmission["status"];

export interface OpportunitySubmissionFilters {
  query: string;
  status: OpportunitySubmissionStatusFilter;
}

export function filterOpportunitySubmissions(
  submissions: OpportunitySubmission[],
  filters: OpportunitySubmissionFilters,
): OpportunitySubmission[] {
  const query = filters.query.trim().toLowerCase();

  return submissions.filter((submission) => {
    if (filters.status !== "all" && submission.status !== filters.status) {
      return false;
    }

    if (!query) return true;

    const searchableValues = [
      submission.title,
      submission.source_name,
      submission.source_url,
      submission.country,
      submission.region,
      submission.city,
      submission.channel,
      submission.opportunity_type,
      submission.source_evidence,
      submission.review_note,
    ];

    return searchableValues.some((value) =>
      value?.toLowerCase().includes(query),
    );
  });
}
