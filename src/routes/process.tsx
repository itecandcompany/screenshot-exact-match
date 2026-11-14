import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/content/site";
import { PageIntro, Timeline, ClosingCTA } from "@/components/agency";
export const Route = createFileRoute("/process")({
  head: () =>
    seo(
      "Our Process",
      "Discover, research, strategise, design, publish and improve: the Nextdoor Creative Growth Process.",
    ),
  component: Process,
});
function Process() {
  return (
    <>
      <PageIntro
        label="From idea to impact"
        title="Nextdoor Creative Growth Process"
        copy="A collaborative path from understanding your business to creating content with purpose—and improving what comes next."
      />
      <section className="section">
        <div className="container">
          <Timeline />
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
