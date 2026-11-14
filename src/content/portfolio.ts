import { z } from "zod";
import coffee from "@/assets/sample-coffee.jpg";
import stem from "@/assets/sample-stem.jpg";
export const categories = [
  "Advertising Posters",
  "Social Media Graphics",
  "Brand Identity",
  "Education and STEM",
  "Events and Campaigns",
  "Product Advertising",
] as const;
export const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  clientName: z.string(),
  industry: z.string(),
  description: z.string(),
  images: z.array(z.object({ src: z.string(), alt: z.string().min(1) })).min(1),
  category: z.enum(categories),
  servicesProvided: z.array(z.string()),
  projectDate: z.string().nullable(),
  featured: z.boolean(),
  isSample: z.literal(true),
});
const concepts = [
  ["A Fresh Start", "zawadi-coffee", "Product Advertising", coffee, "Coffee and retail"],
  ["Ideas Into Impact", "stem-festival", "Education and STEM", stem, "Education"],
  ["Rooted in Possibility", "rooted-identity", "Brand Identity", coffee, "Lifestyle"],
  ["A Brighter Tomorrow", "brighter-tomorrow", "Advertising Posters", stem, "Education"],
  ["Your Daily Inspiration", "daily-inspiration", "Social Media Graphics", coffee, "Retail"],
  ["Create. Connect. Grow.", "creative-gathering", "Events and Campaigns", stem, "Events"],
  [
    "Coffee With Purpose",
    "coffee-with-purpose",
    "Advertising Posters",
    coffee,
    "Food and beverage",
  ],
  ["The Next Generation", "next-generation", "Social Media Graphics", stem, "Education"],
] as const;
export const projects = concepts.map(([title, slug, category, image, industry], i) =>
  projectSchema.parse({
    title,
    slug,
    clientName: "Independent concept — not client work",
    industry,
    description:
      "An independent sample concept exploring purposeful messaging, a cohesive visual identity and audience-focused creative. This is not a commissioned client project and makes no performance claims.",
    images: [{ src: image, alt: `${title} — ${category} sample concept` }],
    category,
    servicesProvided: ["Creative Advertising Design", "AI-Assisted Creative Strategy"],
    projectDate: null,
    featured: i < 3,
    isSample: true,
  }),
);
