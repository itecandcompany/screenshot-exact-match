import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { seo, site } from "@/content/site";
import { services } from "@/content/services";
import { PageIntro } from "@/components/agency";
import { QuoteForm } from "@/components/quote-form";
export const Route = createFileRoute("/contact")({
  validateSearch: z.object({
    service: z.string().optional().catch(undefined),
    package: z.string().optional().catch(undefined),
  }),
  head: () =>
    seo(
      "Contact & Free Quote",
      "Tell NEXTDOOR ADS about your business and your next creative project.",
    ),
  component: Contact,
});
function Contact() {
  const search = Route.useSearch();
  const service = services.find((s) => s.slug === search.service)?.slug;
  return (
    <>
      <PageIntro
        label="Let's create together"
        title="Your Next Big Idea Starts Here."
        copy="Tell us about your business, your goals and the creative you have in mind."
      />
      <section className="section">
        <div className="container grid lg:grid-cols-[1fr_2fr] gap-16">
          <div>
            <div className="eyebrow">A conversation, not a commitment</div>
            <h2 className="section-title">
              Let's Grow
              <br />
              Your Brand.
            </h2>
            <p className="section-copy mt-6">
              Based in Tanzania. Creating for businesses, organisations and ambitious brands across
              East Africa.
            </p>
            <div className="border-t border-border mt-8 pt-6">
              <p className="text-xs font-bold">Email</p>
              <p className="section-copy mt-2">{site.email || "[EMAIL TO BE ADDED]"}</p>
              <p className="text-xs font-bold mt-6">Phone / WhatsApp</p>
              <p className="section-copy mt-2">{site.phone || "[PHONE TO BE ADDED]"}</p>
            </div>
          </div>
          <QuoteForm
            key={`${service}-${search.package}`}
            service={service}
            packageName={search.package}
          />
        </div>
      </section>
    </>
  );
}
