import { z } from "zod";

export const campaignInputSchema = z.object({
  business: z.string().trim().min(2, "Enter your business name.").max(120),
  description: z.string().trim().min(20, "Describe your business in at least 20 characters.").max(2000),
  goals: z.string().trim().min(10, "Tell us what you want your advertising to achieve.").max(1500),
  audience: z.string().trim().min(5, "Describe your ideal customers.").max(800),
  market: z.string().trim().min(2, "Enter your target location.").max(150),
  budget: z.string().trim().min(2, "Enter a budget or say undecided.").max(150),
  timeline: z.string().trim().min(2, "Enter a timeframe or say undecided.").max(150),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to AI processing to continue." }) }),
  website: z.string().max(0),
});
export type CampaignInput = z.infer<typeof campaignInputSchema>;

export const briefFields = [
  { key: "objective", label: "Campaign objective" },
  { key: "audience", label: "Audience & insight" },
  { key: "message", label: "Core message & call to action" },
  { key: "creative", label: "Creative direction" },
  { key: "channels", label: "Channels & deliverables" },
  { key: "budget", label: "Budget approach" },
  { key: "timeline", label: "Launch plan" },
  { key: "measurement", label: "Success measures" },
  { key: "questions", label: "To confirm before launch" },
] as const;
export const campaignBriefSchema = z.object({
  title: z.string().min(1).max(200),
  objective: z.string().min(1).max(2500),
  audience: z.string().min(1).max(2500),
  message: z.string().min(1).max(2500),
  creative: z.string().min(1).max(2500),
  channels: z.string().min(1).max(2500),
  budget: z.string().min(1).max(2500),
  timeline: z.string().min(1).max(2500),
  measurement: z.string().min(1).max(2500),
  questions: z.string().min(1).max(2500),
});
export type CampaignBrief = z.infer<typeof campaignBriefSchema>;
export function briefAsText(brief: CampaignBrief) {
  return `NEXTDOOR ADS · AI campaign brief\n${brief.title}\n\n${briefFields.map((f) => `${f.label}\n${brief[f.key]}`).join("\n\n")}\n\nAI-generated draft for human review. Not a quote or a performance guarantee.`;
}