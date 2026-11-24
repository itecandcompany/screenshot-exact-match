import { describe, expect, it } from "vitest";
import {
  formatOpportunityDate,
  getOpportunityDeadlineLabel,
  getOpportunityDeadlineStatus,
} from "@/lib/opportunity-display";

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


describe("getOpportunityDeadlineStatus", () => {
  const now = Date.parse("2026-11-24T06:00:00.000Z");

  it("distinguishes upcoming, closing-soon and expired timestamps", () => {
    expect(getOpportunityDeadlineStatus("2026-12-10T06:00:00.000Z", now)).toBe("upcoming");
    expect(getOpportunityDeadlineStatus("2026-11-27T06:00:00.000Z", now)).toBe("closing_soon");
    expect(getOpportunityDeadlineStatus("2026-11-20T06:00:00.000Z", now)).toBe("expired");
    expect(getOpportunityDeadlineStatus("2026-11-24T06:00:00.000Z", now)).toBe("expired");
  });

  it("treats date-only deadlines as valid through the end of the day in Tanzania", () => {
    expect(
      getOpportunityDeadlineStatus("2026-11-24", Date.parse("2026-11-24T20:00:00.000Z")),
    ).toBe("closing_soon");
    expect(
      getOpportunityDeadlineStatus("2026-11-24", Date.parse("2026-11-24T21:00:00.000Z")),
    ).toBe("expired");
  });

  it("distinguishes missing and invalid deadline values", () => {
    expect(getOpportunityDeadlineStatus(null, now)).toBe("no_deadline");
    expect(getOpportunityDeadlineStatus("   ", now)).toBe("no_deadline");
    expect(getOpportunityDeadlineStatus("not-a-date", now)).toBe("invalid");
    expect(getOpportunityDeadlineStatus("2026-02-31", now)).toBe("invalid");
    expect(getOpportunityDeadlineLabel("closing_soon")).toBe("Closing within 7 days");
  });
});
