import { describe, expect, it } from "vitest";
import type { OpportunitySubmission } from "@/lib/supabase/client";
import { filterOpportunitySubmissions } from "@/lib/opportunity-submission-filters";

function submission(
  id: string,
  status: OpportunitySubmission["status"],
  overrides: Partial<OpportunitySubmission> = {},
): OpportunitySubmission {
  return {
    id,
    submitted_by: "user-1",
    title: "Arusha outdoor campaign",
    description: "A local advertising opportunity.",
    country: "Tanzania",
    region: "Arusha",
    city: "Arusha",
    channel: "Outdoor",
    opportunity_type: "Media placement",
    deadline: null,
    source_url: "https://example.org/arusha",
    source_name: "Official Publisher",
    source_evidence: "The publisher confirms the placement and application process.",
    status,
    review_note: null,
    reviewed_at: null,
    published_opportunity_id: null,
    created_at: "2026-11-28T06:00:00.000Z",
    ...overrides,
  };
}

const rows = [
  submission("pending-1", "pending"),
  submission("approved-1", "approved", {
    title: "Dar es Salaam radio campaign",
    source_url: "https://radio.example.org/advertise",
    source_name: "Radio Tanzania",
    region: "Dar es Salaam",
  }),
  submission("rejected-1", "rejected", {
    title: "Mwanza billboard proposal",
    source_evidence: "The source page did not confirm an active advertising placement.",
    review_note: "Please provide a current official source.",
  }),
];

describe("filterOpportunitySubmissions", () => {
  it("returns all statuses when the filter is all", () => {
    expect(filterOpportunitySubmissions(rows, { query: "", status: "all" })).toHaveLength(3);
  });

  it("filters by review status", () => {
    expect(
      filterOpportunitySubmissions(rows, { query: "", status: "pending" }).map((row) => row.id),
    ).toEqual(["pending-1"]);
  });

  it("searches titles and source details without case sensitivity", () => {
    expect(
      filterOpportunitySubmissions(rows, { query: "RADIO TANZANIA", status: "all" }).map((row) => row.id),
    ).toEqual(["approved-1"]);
  });

  it("searches review notes and trims surrounding whitespace", () => {
    expect(
      filterOpportunitySubmissions(rows, { query: "  current official source  ", status: "all" }).map((row) => row.id),
    ).toEqual(["rejected-1"]);
  });

  it("combines status and search filters and returns an empty list for no match", () => {
    expect(
      filterOpportunitySubmissions(rows, { query: "radio", status: "pending" }),
    ).toEqual([]);
  });
});
