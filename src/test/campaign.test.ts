import { describe, it, expect } from "vitest";
import { campaignInputSchema, campaignBriefSchema, briefAsText } from "@/content/campaign";

const input = { business: "Kijani Coffee", description: "We sell locally roasted coffee in Dar es Salaam.", goals: "Increase enquiries for office coffee deliveries.", audience: "Office managers in Dar es Salaam", market: "Dar es Salaam", budget: "TSh 300,000", timeline: "Four weeks", consent: true, website: "" };
describe("Campaign brief validation", () => {
  it("accepts business and advertising goals with the client's budget", () => {
    expect(campaignInputSchema.parse(input).budget).toBe("TSh 300,000");
  });
  it("rejects missing advertising goals", () => {
    expect(campaignInputSchema.safeParse({ ...input, goals: "" }).success).toBe(false);
  });
  it("requires consent before sending details to AI", () => {
    expect(campaignInputSchema.safeParse({ ...input, consent: false }).success).toBe(false);
  });
  it("rejects honeypot submissions", () => {
    expect(campaignInputSchema.safeParse({ ...input, website: "spam" }).success).toBe(false);
  });
  it("requires a complete campaign brief", () => {
    expect(campaignBriefSchema.safeParse({ title: "Coffee campaign" }).success).toBe(false);
  });
  it("exports the client's campaign plan without losing budget or timeline", () => {
    const brief = campaignBriefSchema.parse({ title: "Coffee campaign", objective: "Increase enquiries", audience: input.audience, message: "Office coffee delivery", creative: "Show the real product", channels: "Instagram", budget: input.budget, timeline: input.timeline, measurement: "Track enquiries", questions: "Confirm delivery coverage" });
    expect(briefAsText(brief)).toContain("TSh 300,000");
    expect(briefAsText(brief)).toContain("Four weeks");
  });
});