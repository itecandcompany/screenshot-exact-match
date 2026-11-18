import { describe, expect, it } from "vitest";
import { getSafeExternalUrl } from "@/lib/safe-external-url";

describe("getSafeExternalUrl", () => {
  it("normalizes valid HTTP and HTTPS links", () => {
    expect(getSafeExternalUrl(" https://example.com/opportunity ")).toBe(
      "https://example.com/opportunity",
    );
    expect(getSafeExternalUrl("http://example.com")).toBe("http://example.com/");
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "//example.com/path",
    "/relative/path",
    "not a URL",
    "https://user:password@example.com/private",
  ])("rejects unsafe or non-absolute URLs: %s", (value) => {
    expect(getSafeExternalUrl(value)).toBeNull();
  });

  it("rejects missing and overlong values", () => {
    expect(getSafeExternalUrl(null)).toBeNull();
    expect(getSafeExternalUrl("")).toBeNull();
    expect(getSafeExternalUrl("https://example.com/" + "a".repeat(2048))).toBeNull();
  });
});
