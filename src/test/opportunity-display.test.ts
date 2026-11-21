import { describe, expect, it } from "vitest";
import { formatOpportunityDate } from "@/lib/opportunity-display";

describe("formatOpportunityDate", () => {
  it("formats timestamp deadlines in Tanzania time", () => {
    expect(formatOpportunityDate("2026-11-21T10:00:00.000Z")).toBe(
      "21 Nov 2026, 13:00",
    );
  });

  it("keeps date-only values free of an invented time", () => {
    expect(formatOpportunityDate("2026-11-21")).toBe("21 Nov 2026");
  });

  it("returns null for missing or invalid dates", () => {
    expect(formatOpportunityDate(null)).toBeNull();
    expect(formatOpportunityDate(undefined)).toBeNull();
    expect(formatOpportunityDate("not-a-date")).toBeNull();
  });
});
