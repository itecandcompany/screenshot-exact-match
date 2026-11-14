import {
  PenTool,
  MessageSquareText,
  Fingerprint,
  ChartNoAxesCombined,
  Sparkles,
} from "lucide-react";
export const services = [
  {
    slug: "creative-advertising-design",
    title: "Creative Advertising Design",
    short: "Bold visuals. Clear messages. Designs that make your brand impossible to overlook.",
    description:
      "Purposeful advertising visuals that bring your message to life. From a single promotion to a coordinated campaign, we make every creative decision count.",
    includes: [
      "Posters and flyers",
      "Promotional graphics",
      "Product advertising",
      "Event designs and banners",
      "Campaign visuals",
    ],
    icon: PenTool,
  },
  {
    slug: "social-media-content",
    title: "Social Media Content",
    short: "Content that connects, engages and gives your audience a reason to act.",
    description:
      "Build a consistent presence with creative, audience-focused content prepared for your social channels.",
    includes: [
      "Captions and headlines",
      "Content descriptions",
      "Relevant hashtags",
      "Calls to action",
      "Publishing-ready content",
    ],
    icon: MessageSquareText,
  },
  {
    slug: "branding-and-brand-identity",
    title: "Branding & Brand Identity",
    short: "A distinctive identity that tells your story and builds recognition.",
    description:
      "A cohesive visual identity that reflects who you are and keeps your business recognisable across every touchpoint.",
    includes: [
      "Logo design",
      "Brand guidelines",
      "Colour systems",
      "Typography direction",
      "Business stationery",
    ],
    icon: Fingerprint,
  },
  {
    slug: "advertising-performance-insights",
    title: "Advertising Performance Insights",
    short: "Turn your advertising data into clarity for your next creative move.",
    description:
      "We review analytics you provide to understand your content performance and inform future improvements. No live integrations or guaranteed outcomes.",
    includes: [
      "Reach and impressions review",
      "Engagement and shares",
      "Link click analysis",
      "Enquiry and conversion review",
      "Creative improvement recommendations",
    ],
    icon: ChartNoAxesCombined,
  },
  {
    slug: "ai-assisted-creative-strategy",
    title: "AI-Assisted Creative Strategy",
    short: "Smarter ideas, human-led direction and creative with a purpose.",
    description:
      "Combine AI-assisted exploration with human judgement to create audience-focused campaign concepts and a clear creative direction.",
    includes: [
      "Audience research",
      "Advertising concepts",
      "Creative direction",
      "Campaign ideas",
      "Content variations",
    ],
    icon: Sparkles,
  },
];
export const process = [
  { title: "Discover", copy: "Understand your business, goals and what makes you different." },
  { title: "Research", copy: "Get to know your audience and what matters to them." },
  { title: "Strategise", copy: "Shape the right message and a purposeful creative direction." },
  { title: "Design", copy: "Bring your message to life with professional visual design." },
  { title: "Publish", copy: "Prepare graphics, captions, hashtags and calls to action." },
  { title: "Improve", copy: "Review available analytics and refine what comes next." },
];
