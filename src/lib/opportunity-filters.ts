import type { Opportunity } from "@/lib/supabase/client";
import { getOpportunityDeadlineStatus, type OpportunityDeadlineFilter } from "@/lib/opportunity-display";

export interface OpportunityFilters {
  search?: string;
  channel?: string;
  region?: string;
  opportunityType?: string;
  deadline?: OpportunityDeadlineFilter;
  now?: number;
}

export function filterOpportunities(
  opportunities: readonly Opportunity[],
  filters: OpportunityFilters = {},
): Opportunity[] {
  const query = filters.search?.trim().toLowerCase() ?? "";

  return opportunities.filter((opportunity) => {
    const matchesQuery =
      !query ||
      [
        opportunity.title,
        opportunity.description,
        opportunity.country,
        opportunity.region,
        opportunity.city,
        opportunity.channel,
        opportunity.opportunity_type,
        opportunity.eligibility,
        opportunity.source_name,
      ].some((value) => value?.toLowerCase().includes(query));

    const matchesChannel =
      !filters.channel ||
      filters.channel === "all" ||
      opportunity.channel === filters.channel;
    const matchesRegion =
      !filters.region ||
      filters.region === "all" ||
      opportunity.region === filters.region;
    const matchesType =
      !filters.opportunityType ||
      filters.opportunityType === "all" ||
      opportunity.opportunity_type === filters.opportunityType;
    const deadlineStatus = getOpportunityDeadlineStatus(opportunity.deadline, filters.now);
    const matchesDeadline =
      !filters.deadline ||
      filters.deadline === "all" ||
      (filters.deadline === "active"
        ? deadlineStatus === "upcoming" ||
          deadlineStatus === "closing_soon" ||
          deadlineStatus === "no_deadline"
        : deadlineStatus === filters.deadline);

    return matchesQuery && matchesChannel && matchesRegion && matchesType && matchesDeadline;
  });
}
