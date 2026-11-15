import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { projects } from "@/content/portfolio";
import { seo } from "@/content/site";
import { PageIntro } from "@/components/agency";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
export const Route = createFileRoute("/portfolio/$slug")({
  loader: ({ params }) => {
    const p = projects.find((p) => p.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) =>
    seo(
      loaderData?.title || "Project unavailable",
      loaderData?.description || "Discover NEXTDOOR ADS sample work.",
    ),
  component: Project,
});
function Project() {
  const p = Route.useLoaderData();
  return (
    <>
      <PageIntro label={`${p.category} · ${p.isSample ? "Sample Work" : "Client Project"}`} title={p.title} copy={p.description} />
      <section className="section">
        <div className="container grid md:grid-cols-[1.3fr_1fr] gap-16">
          <img
            src={p.images[0]?.src}
            alt={p.images[0]?.alt}
            width={1024}
            height={1024}
            className="w-full"
          />
          <div>
            <span className="text-xs font-bold uppercase">{p.isSample ? "Independent Sample Concept" : `Commissioned Client Work · ${p.clientName}`}</span>
            <h2 className="section-title">The creative direction</h2>
            <p className="section-copy mt-6">{p.description}</p>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="font-bold text-xs">Client</dt>
                <dd className="section-copy mt-2">{p.clientName}</dd>
              </div>
              <div>
                <dt className="font-bold text-xs">Industry</dt>
                <dd className="section-copy mt-2">{p.industry}</dd>
              </div>
              <div>
                <dt className="font-bold text-xs">Services</dt>
                <dd className="section-copy mt-2">{p.servicesProvided.join(" · ")}</dd>
              </div>
            </dl>
            <Button asChild variant="forest" className="mt-8">
              <Link to="/contact">
                Create Something for Your Brand <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
