import { describe, expect, it } from "vitest";
import { normalizeWorkspaceProfileDraft } from "@/lib/workspace-profile-settings";

describe("workspace profile settings", () => {
  it("trims names and keeps a valid international phone number", () => {
    expect(
      normalizeWorkspaceProfileDraft({
        displayName: "  Amina   Juma ",
        businessName: "  Amina Creative Studio ",
        phone: "+255 712 345 678",
      }),
    ).toEqual({
      display_name: "Amina Juma",
      business_name: "Amina Creative Studio",
      phone: "+255 712 345 678",
    });
  });

  it("stores blank optional business and phone fields as null", () => {
    expect(
      normalizeWorkspaceProfileDraft({
        displayName: "Amina Juma",
        businessName: "   ",
        phone: "",
      }),
    ).toEqual({
      display_name: "Amina Juma",
      business_name: null,
      phone: null,
    });
  });

  it.each(["", "A", "  "])("rejects a display name that is too short: %s", (displayName) => {
    expect(() =>
      normalizeWorkspaceProfileDraft({ displayName, businessName: "", phone: "" }),
    ).toThrow("between 2 and 80 characters");
  });

  it("rejects an overlong business name", () => {
    expect(() =>
      normalizeWorkspaceProfileDraft({
        displayName: "Amina Juma",
        businessName: "B".repeat(121),
        phone: "",
      }),
    ).toThrow("120 characters or fewer");
  });

  it.each(["abc12345", "+255 12", "1234567890123456", "++255712345678"])(
    "rejects an invalid phone number: %s",
    (phone) => {
      expect(() =>
        normalizeWorkspaceProfileDraft({
          displayName: "Amina Juma",
          businessName: "",
          phone,
        }),
      ).toThrow("valid phone number");
    },
  );
});
