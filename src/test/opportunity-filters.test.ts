import { describe, expect, it } from "vitest";
import type { Opportunity } from "@/lib/supabase/client";
import { filterOpportunities } from "@/lib/opportunity-filters";

function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opportunity-1",
    title: "Arusha retail campaign",
    description: "A local brand is looking for social media advertising support.",
    country: "Tanzania",
    region: "Arusha",
    city: "Arusha",
    channel: "Social media",
    opportunity_type: "Campaign",
    eligibility: "Registered small businesses",
    deadline: "2026-12-15T00:00:00.000Z",
    source_url: "https://example.com/opportunity",
    source_name: "Example source",
    verified_at: "2026-11-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("Nextdoor Plus opportunity filters", () => {
  const opportunities = [
    makeOpportunity(),
    makeOpportunity({
      id: "opportunity-2",
      title: "Dar es Salaam outdoor placement",
      region: "Dar es Salaam",
      city: "Dar es Salaam",
      channel: "Outdoor",
      opportunity_type: "Placement",
      source_name: "City media directory",
    }),
  ];

  it("searches case-insensitively across listing and source details", () => {
    expect(
      filterOpportunities(opportunities, { search: "CITY MEDIA" }).map(
        (item) => item.id,
      ),
    ).toEqual(["opportunity-2"]);
  });

  it("combines channel, region and opportunity type filters", () => {
    expect(
      filterOpportunities(opportunities, {
        channel: "Social media",
        region: "Arusha",
        opportunityType: "Campaign",
      }).map((item) => item.id),
    ).toEqual(["opportunity-1"]);
  });

  it("returns every opportunity when no filters are selected", () => {
    expect(filterOpportunities(opportunities)).toEqual(opportunities);
  });

  it("does not mutate the source list", () => {
    const source = [...opportunities];
    filterOpportunities(source, { region: "Arusha" });
    expect(source).toEqual(opportunities);
  });
});
