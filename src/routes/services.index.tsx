import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/content/site";
import { PageIntro, ServiceGrid, ClosingCTA } from "@/components/agency";
export const Route = createFileRoute("/services/")({
  head: () =>
    seo(
      "Our Services",
      "Advertising design, social media content, brand identity, performance insights and AI-assisted creative strategy.",
    ),
  component: Services,
});
function Services() {
  return (
    <>
      <PageIntro
        label="Our services"
        title="Good Ideas. Great Execution."
        copy="From the first concept to publishing-ready content, we help you show up with clarity, consistency and creativity."
      />
      <section className="section">
        <div className="container">
          <ServiceGrid />
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
