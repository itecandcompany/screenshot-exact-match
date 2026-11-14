import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { services } from "@/content/services";
import { seo } from "@/content/site";
import { PageIntro } from "@/components/agency";
import { Button } from "@/components/ui/button";
import image from "@/assets/sample-stem.jpg";
export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return service;
  },
  head: ({ loaderData }) =>
    seo(
      loaderData?.title || "Service unavailable",
      loaderData?.description || "Explore NEXTDOOR ADS creative services.",
    ),
  component: Service,
});
function Service() {
  const s = Route.useLoaderData();
  return (
    <>
      <PageIntro label="Creative services" title={s.title} copy={s.description} />
      <section className="section">
        <div className="container grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow">Made for your brand</div>
            <h2 className="section-title">What's included</h2>
            <ul className="mt-8 space-y-5">
              {s.includes.map((i) => (
                <li key={i} className="flex items-center gap-3 border-b border-border pb-4 text-sm">
                  <Check size={17} />
                  {i}
                </li>
              ))}
            </ul>
            <Button asChild variant="forest" className="mt-8">
              <Link to="/contact" search={{ service: s.slug }}>
                Enquire About This Service <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="relative">
            <img
              src={image}
              alt="Illustrative creative campaign sample"
              width={1024}
              height={1024}
              className="w-full rounded-sm"
              loading="lazy"
            />
            <span className="sample-badge">Sample Work</span>
          </div>
        </div>
      </section>
    </>
  );
}
