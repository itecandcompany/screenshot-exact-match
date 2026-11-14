import { describe, it, expect } from "vitest";
import { pricing } from "@/content/pricing";
import { projects } from "@/content/portfolio";
import { quoteSchema } from "@/content/quote";
describe("Owner content rules", () => {
  it("Mini includes four monthly designs at TSh 100,000", () => {
    expect(pricing[0]).toMatchObject({ designs: 4, price: 100000 });
  });
  it("Starter includes eight monthly designs at TSh 200,000", () => {
    expect(pricing[1]).toMatchObject({ designs: 8, price: 200000 });
  });
  it("Growth includes twelve monthly designs at TSh 330,000", () => {
    expect(pricing[2]).toMatchObject({ designs: 12, price: 330000, popular: false });
  });
  it("Business includes twenty monthly designs at TSh 500,000", () => {
    expect(pricing[3]).toMatchObject({ designs: 20, price: 500000 });
  });
  it("All eight portfolio projects are sample work", () => {
    expect(projects).toHaveLength(8);
    expect(projects.every((p) => p.isSample)).toBe(true);
  });
  it("Rejects empty requests and honeypot submissions", () => {
    expect(quoteSchema.safeParse({}).success).toBe(false);
    expect(
      quoteSchema.safeParse({
        name: "Test Person",
        business: "Test Studio",
        email: "test@example.com",
        phone: "+255700000000",
        service: "social-media-content",
        description: "We need creative content for our product launch.",
        budget: "discuss",
        contact: "email",
        website: "spam",
      }).success,
    ).toBe(false);
  });
});
