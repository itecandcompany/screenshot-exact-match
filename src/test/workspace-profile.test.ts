import { describe, expect, it } from "vitest";
import { buildProfileUpsert } from "@/lib/workspace-profile";

describe("workspace profile upsert", () => {
  it("only sets a display name when the user explicitly supplied one", () => {
    expect(buildProfileUpsert("member-1", "")).toEqual({ id: "member-1" });
    expect(buildProfileUpsert("member-1", "   ")).toEqual({ id: "member-1" });
  });

  it("trims and saves a supplied display name", () => {
    expect(buildProfileUpsert("member-1", "  Amina Juma  ")).toEqual({
      id: "member-1",
      display_name: "Amina Juma",
    });
  });
});
