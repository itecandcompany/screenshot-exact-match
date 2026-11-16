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
  isSample: z.boolean(),
});

const concepts = [
  ["A Fresh Start", "zawadi-coffee", "Product Advertising", coffee, "Coffee and retail"],
  ["Ideas Into Impact", "stem-festival", "Education and STEM", stem, "Education"],
  ["Rooted in Possibility", "rooted-identity", "Brand Identity", coffee, "Lifestyle"],
  ["A Brighter Tomorrow", "brighter-tomorrow", "Advertising Posters", stem, "Education"],
  ["Your Daily Inspiration", "daily-inspiration", "Social Media Graphics", coffee, "Retail"],
  ["Create. Connect. Grow.", "creative-gathering", "Events and Campaigns", stem, "Events"],
  ["Coffee With Purpose", "coffee-with-purpose", "Advertising Posters", coffee, "Food and beverage"],
  ["The Next Generation", "next-generation", "Social Media Graphics", stem, "Education"],
] as const;

const independentConcepts = concepts.map(([title, slug, category, image, industry], i) =>
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

// Pin poster assets to a commit so their URLs do not change with branch updates.
const e3Base = "/portfolio/";
const e3ClientWork = [
  projectSchema.parse({
    title: "Ether Empire Holiday Courses",
    slug: "e3-empower-ether-empire-holiday-courses",
    clientName: "E3 Empower",
    industry: "Education and training",
    description:
      "A holiday-courses promotional poster created by NEXTDOOR ADS for E3 Empower. The design presents the Ether Empire Holiday Courses offer as an education-focused campaign visual. This is commissioned client work; campaign reach and enrolment results were not supplied.",
    images: [{
      src: e3Base + "ether-empire-holiday-courses.png",
      alt: "Ether Empire Holiday Courses promotional poster designed for E3 Empower",
    }],
    category: "Education and STEM",
    servicesProvided: ["Campaign concept", "Promotional poster design", "Education advertising creative"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
  projectSchema.parse({
    title: "Exaud Lizer — Empowering Tanzania’s Future",
    slug: "e3-empower-exaud-lizer-profile-poster",
    clientName: "E3 Empower",
    industry: "Education and youth development",
    description:
      "A profile-led promotional poster created by NEXTDOOR ADS for E3 Empower. It introduces Exaud Lizer as an intern and trainer and communicates the organisation’s education and empowerment message. This is commissioned client work; no campaign performance figures were provided.",
    images: [{
      src: e3Base + "exaud-lizer-empowering-tanzania.png",
      alt: "Exaud Lizer profile poster created for E3 Empower",
    }],
    category: "Advertising Posters",
    servicesProvided: ["Profile-led visual storytelling", "Promotional poster design", "Brand-aligned layout"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
];

export const projects = [...e3ClientWork, ...independentConcepts];
