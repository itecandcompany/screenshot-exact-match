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
  "Awareness & Impact Campaigns",
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

// Public portfolio artwork is served from the existing /public/portfolio directory.
const portfolioBase = "/portfolio/";
const clientProjects = [
  projectSchema.parse({
    title: "Ether Empire Holiday Courses",
    slug: "e3-empower-ether-empire-holiday-courses",
    clientName: "E3 Empower",
    industry: "Education and training",
    description:
      "A holiday-courses promotional poster created by NEXTDOOR ADS for E3 Empower. The design presents the Ether Empire Holiday Courses offer as an education-focused campaign visual. This is commissioned client work; campaign reach and enrolment results were not supplied.",
    images: [{
      src: portfolioBase + "ether-empire-holiday-courses.png",
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
      src: portfolioBase + "exaud-lizer-empowering-tanzania.png",
      alt: "Exaud Lizer profile poster created for E3 Empower",
    }],
    category: "Advertising Posters",
    servicesProvided: ["Profile-led visual storytelling", "Promotional poster design", "Brand-aligned layout"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
  projectSchema.parse({
    title: "Study Smart, Not Harder — Think Index",
    slug: "index-study-smart-not-harder",
    clientName: "Index Tanzania",
    industry: "Education and digital learning",
    description:
      "An educational advertising poster built around Index’s “Study Smart, Not Harder. Think Index.” message. The creative presents Index as a learning companion through interactive lessons, progress tracking and student achievement.",
    images: [{
      src: portfolioBase + "index-study-smart.png",
      alt: "Index Tanzania Study Smart, Not Harder — Think Index campaign poster",
    }],
    category: "Education and STEM",
    servicesProvided: ["Campaign concept", "Educational advertising", "Promotional poster design"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
  projectSchema.parse({
    title: "Master Education with Index",
    slug: "index-master-education",
    clientName: "Index Tanzania",
    industry: "Education and digital learning",
    description:
      "A leadership-led brand campaign featuring Index CEO Mohamed Salim Suleiman and the quote “Right Problem Identification, Right Opportunities.” The poster reinforces the Index message of learning, practice and excellence.",
    images: [{
      src: portfolioBase + "index-master-education.png",
      alt: "Index Tanzania Master Education with Index poster featuring CEO Mohamed Salim Suleiman",
    }],
    category: "Advertising Posters",
    servicesProvided: ["Leadership campaign creative", "Brand storytelling", "Promotional poster design"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
  projectSchema.parse({
    title: "Physics — Explore the Laws of Nature",
    slug: "index-physics-form-one",
    clientName: "Index Tanzania",
    industry: "Education and STEM",
    description:
      "A Form 1 Physics promotional poster introducing learners to interactive lessons, practice questions and progress tracking through Index. The visual uses science imagery to make the subject feel engaging and accessible.",
    images: [{
      src: portfolioBase + "index-physics-form-1.png",
      alt: "Index Tanzania Physics Form 1 — Explore the Laws of Nature poster",
    }],
    category: "Education and STEM",
    servicesProvided: ["STEM campaign creative", "Educational advertising", "Promotional poster design"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),

  projectSchema.parse({
    title: "From Farms to Global Markets",
    slug: "nurusafe-from-farms-to-global-markets",
    clientName: "NuruSafe Packing House",
    industry: "Agriculture, food handling and export readiness",
    description:
      "An awareness-focused campaign visual communicating the journey from local farms towards wider markets. The creative positions NuruSafe Packing House within the agricultural value chain and helps audiences recognise the importance of organised packing and market access.",
    images: [{
      src: portfolioBase + "nurusafe-from-farms-to-global-markets.png",
      alt: "NuruSafe Packing House awareness poster — From Farms to Global Markets",
    }],
    category: "Awareness & Impact Campaigns",
    servicesProvided: ["Awareness campaign creative", "Agribusiness communication", "Poster design"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
  projectSchema.parse({
    title: "Freshness for Global Markets",
    slug: "nurusafe-freshness-for-global-markets",
    clientName: "NuruSafe Packing House",
    industry: "Agriculture, food handling and export readiness",
    description:
      "An awareness advertisement highlighting freshness and the quality expectations associated with supplying produce to broader markets. Designed to build recognition for NuruSafe Packing House and its role in the produce packing journey.",
    images: [{
      src: portfolioBase + "nurusafe-freshness-for-global-markets.png",
      alt: "NuruSafe Packing House awareness poster — Freshness for Global Markets",
    }],
    category: "Awareness & Impact Campaigns",
    servicesProvided: ["Awareness campaign creative", "Agribusiness communication", "Poster design"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
  projectSchema.parse({
    title: "Quality Today, Prosperity Tomorrow",
    slug: "nurusafe-quality-today-prosperity-tomorrow",
    clientName: "NuruSafe Packing House",
    industry: "Agriculture, food handling and export readiness",
    description:
      "An awareness-led poster connecting consistent quality with long-term prosperity for the agricultural value chain. The creative supports NuruSafe Packing House's partner communications and public awareness.",
    images: [{
      src: portfolioBase + "nurusafe-quality-today-prosperity-tomorrow.png",
      alt: "NuruSafe Packing House awareness poster — Quality Today, Prosperity Tomorrow",
    }],
    category: "Awareness & Impact Campaigns",
    servicesProvided: ["Awareness campaign creative", "Agribusiness communication", "Poster design"],
    projectDate: null,
    featured: true,
    isSample: false,
  }),
];

export const projects = [...clientProjects, ...independentConcepts];
