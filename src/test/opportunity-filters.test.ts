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
      filterOpportunities(opportunities, { search: "CITY MEDIA" }).map((item) => item.id),
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


describe("opportunity deadline filters", () => {
  const now = Date.parse("2026-11-24T06:00:00.000Z");
  const current = makeOpportunity({
    id: "current",
    deadline: "2026-12-10T06:00:00.000Z",
  });
  const closingSoon = makeOpportunity({
    id: "closing-soon",
    deadline: "2026-11-27T06:00:00.000Z",
  });
  const expired = makeOpportunity({
    id: "expired",
    deadline: "2026-11-20T06:00:00.000Z",
  });
  const undated = makeOpportunity({
    id: "undated",
    deadline: null,
  });

  it("shows only current opportunities in the default active view", () => {
    expect(
      filterOpportunities([current, closingSoon, expired, undated], {
        deadline: "active",
        now,
      }).map((item) => item.id),
    ).toEqual(["current", "closing-soon", "undated"]);
  });

  it("can isolate closing-soon, expired and undated opportunities", () => {
    const opportunities = [current, closingSoon, expired, undated];
    expect(
      filterOpportunities(opportunities, { deadline: "closing_soon", now }).map((item) => item.id),
    ).toEqual(["closing-soon"]);
    expect(
      filterOpportunities(opportunities, { deadline: "expired", now }).map((item) => item.id),
    ).toEqual(["expired"]);
    expect(
      filterOpportunities(opportunities, { deadline: "no_deadline", now }).map((item) => item.id),
    ).toEqual(["undated"]);
  });

  it("keeps the complete feed available through the all-deadlines filter", () => {
    expect(
      filterOpportunities([current, closingSoon, expired, undated], {
        deadline: "all",
        now,
      }),
    ).toHaveLength(4);
  });
});
