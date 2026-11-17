import { describe, expect, it } from "vitest";
import {
  normalizeOpportunitySubmission,
  type OpportunitySubmissionDraft,
} from "@/lib/opportunity-submissions";

function makeDraft(overrides: Partial<OpportunitySubmissionDraft> = {}): OpportunitySubmissionDraft {
  return {
    title: "Arusha retail campaign",
    description: "A verified local advertising opportunity.",
    country: "Tanzania",
    region: "Arusha",
    city: "Arusha",
    channel: "Social media",
    opportunityType: "Campaign",
    eligibility: "Registered small businesses",
    deadline: "2026-12-15",
    sourceUrl: "https://example.org/opportunities/arusha",
    sourceName: "Official opportunity portal",
    sourceEvidence: "The official page confirms the application window and eligibility requirements.",
    ...overrides,
  };
}

describe("opportunity submission validation", () => {
  it("trims fields and normalizes a safe HTTP source URL", () => {
    const payload = normalizeOpportunitySubmission(
      makeDraft({ title: "  Arusha retail campaign  ", sourceUrl: "https://example.org/opportunities/arusha" }),
    );

    expect(payload.title).toBe("Arusha retail campaign");
    expect(payload.source_url).toBe("https://example.org/opportunities/arusha");
    expect(payload.deadline).toBe("2026-12-15T00:00:00.000Z");
    expect(payload.opportunity_type).toBe("Campaign");
  });

  it("rejects non-HTTP source links and malformed URLs", () => {
    expect(() =>
      normalizeOpportunitySubmission(makeDraft({ sourceUrl: "javascript:alert(1)" })),
    ).toThrow("Source links must use HTTP or HTTPS");

    expect(() =>
      normalizeOpportunitySubmission(makeDraft({ sourceUrl: "not a URL" })),
    ).toThrow("Enter a valid source URL");
  });

  it("rejects URLs with embedded credentials", () => {
    expect(() =>
      normalizeOpportunitySubmission(makeDraft({ sourceUrl: "https://user:pass@example.org/listing" })),
    ).toThrow("cannot contain embedded credentials");
  });

  it("requires useful source evidence before a listing can be submitted", () => {
    expect(() =>
      normalizeOpportunitySubmission(makeDraft({ sourceEvidence: "Looks good." })),
    ).toThrow("Source evidence must be between 20 and 4,000 characters");
  });

  it("rejects invalid deadlines and overlong descriptions", () => {
    expect(() =>
      normalizeOpportunitySubmission(makeDraft({ deadline: "not-a-date" })),
    ).toThrow("Enter a valid opportunity deadline");

    expect(() =>
      normalizeOpportunitySubmission(makeDraft({ description: "x".repeat(3001) })),
    ).toThrow("Description must be 3,000 characters or fewer");
  });
});
