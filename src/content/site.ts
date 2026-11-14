export const site = {
  name: "NEXTDOOR ADS",
  email: "",
  phone: "",
  whatsapp: import.meta.env["VITE_WHATSAPP_NUMBER"] || "",
  socials: [] as { name: string; url: string }[],
  location: "Tanzania · East Africa",
  slogan: "Your Brand. Our Creativity. More Impact.",
};
export const nav = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Our Process", to: "/process" },
  { label: "Pricing", to: "/pricing" },
  { label: "Contact", to: "/contact" },
] as const;
export function seo(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | NEXTDOOR ADS` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | NEXTDOOR ADS` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
