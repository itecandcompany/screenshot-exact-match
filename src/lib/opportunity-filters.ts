import type { Opportunity } from "@/lib/supabase/client";

export interface OpportunityFilters {
  search?: string;
  channel?: string;
  region?: string;
  opportunityType?: string;
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

    return matchesQuery && matchesChannel && matchesRegion && matchesType;
  });
}
