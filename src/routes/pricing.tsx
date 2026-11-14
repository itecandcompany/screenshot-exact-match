import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { seo } from "@/content/site";
import { PageIntro, PricingGrid, Adscore } from "@/components/agency";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/pricing")({
  head: () =>
    seo(
      "Pricing",
      "Monthly creative packages from TSh 100,000. Proposed launch pricing for businesses in Tanzania.",
    ),
  component: Pricing,
});
function Pricing() {
  return (
    <>
      <PageIntro
        label="Invest in your creative"
        title="Big Ambitions. Accessible Creative."
        copy="Choose a monthly package for your business. Every design includes a headline, caption, relevant hashtags and a call to action."
      />
      <section className="section">
        <div className="container">
          <PricingGrid />
          <p className="section-copy mt-7">Proposed launch prices, subject to change.</p>
          <p className="section-copy text-xs mt-2">
            Paid advertising budgets, printing and extensive branding projects are charged
            separately.
          </p>
          <div className="border-t border-border mt-12 pt-10 flex flex-wrap gap-6 justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Custom Quotation</h2>
              <p className="section-copy mt-3">
                A different scope? Let's shape a creative package around your project.
              </p>
            </div>
            <Button asChild variant="forest">
              <Link to="/contact">
                Get a Custom Quote <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Adscore />
    </>
  );
}
