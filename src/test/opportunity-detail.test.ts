import { describe, expect, it } from "vitest";
import {
  getOpportunityDetailHref,
  isOpportunityId,
} from "@/lib/opportunity-detail";

const validId = "550e8400-e29b-41d4-a716-446655440000";

describe("opportunity detail routes", () => {
  it("recognizes UUID opportunity identifiers", () => {
    expect(isOpportunityId(validId)).toBe(true);
  });

  it("rejects path fragments and non-UUID identifiers", () => {
    for (const value of ["../admin", "not-an-id", "550e8400/../../admin", ""]) {
      expect(isOpportunityId(value)).toBe(false);
    }
  });

  it("builds a stable detail URL for a valid opportunity", () => {
    expect(getOpportunityDetailHref(validId)).toBe(
      `/plus/opportunities/${validId}`,
    );
  });

  it("does not create links for missing or unsafe identifiers", () => {
    expect(getOpportunityDetailHref(null)).toBeNull();
    expect(getOpportunityDetailHref(undefined)).toBeNull();
    expect(getOpportunityDetailHref("../admin")).toBeNull();
  });
});
