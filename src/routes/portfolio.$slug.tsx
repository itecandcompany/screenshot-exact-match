import { createFileRoute, notFound } from "@tanstack/react-router";
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
            <div className="mt-8 rounded-sm border border-border bg-secondary p-5">
              <h3 className="font-bold text-sm">What NEXTDOOR ADS delivered</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {p.servicesProvided.map((service) => <li key={service}>• {service}</li>)}
              </ul>
              <p className="section-copy text-xs mt-4">
                This portfolio entry documents the creative deliverable. No reach, sales or campaign
                performance figures have been provided.
              </p>
            </div>
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
              <a href="/#brand-audit">
                Create Something for Your Brand <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
