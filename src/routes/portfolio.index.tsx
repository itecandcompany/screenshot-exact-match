import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { categories, projects } from "@/content/portfolio";
import { seo } from "@/content/site";
import { PageIntro, ProjectGrid } from "@/components/agency";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const e3Projects = projects.filter((project) => !project.isSample);

export const Route = createFileRoute("/portfolio/")({
  validateSearch: z.object({ category: z.enum(categories).optional().catch(undefined) }),
  head: () =>
    seo(
      "Portfolio",
      "Explore client work created for E3 Empower alongside independent NEXTDOOR ADS creative concepts.",
    ),
  component: Portfolio,
});

function Portfolio() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const filtered = category ? projects.filter((p) => p.category === category) : projects;

  return (
    <>
      <PageIntro
        label="Selected creative work"
        title="Creative That Speaks for Itself."
        copy="A selection of work created by NEXTDOOR ADS, including commissioned client designs and independent creative concepts."
      />

      <section className="section e3-portfolio-section">
        <div className="container">
          <div className="e3-client-heading">
            <div>
              <div className="eyebrow">Client spotlight · E3 Empower</div>
              <h2 className="section-title">Creative work for E3 Empower.</h2>
            </div>
            <p className="section-copy">
              These promotional designs were created by NEXTDOOR ADS for our client, E3 Empower.
              Select a design to view the full artwork.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {e3Projects.map((project) => {
              const image = project.images[0];
              return (
                <article className="e3-project-card" key={project.slug}>
                  <a
                    className="e3-project-artwork"
                    href={image.src}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open full image: ${project.title}`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="eager"
                      decoding="async"
                    />
                    <span className="e3-artwork-open">
                      <ExternalLink size={15} /> View full artwork
                    </span>
                  </a>
                  <div className="pt-5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {project.category}
                    </p>
                    <h3 className="text-xl font-bold mt-2">{project.title}</h3>
                    <p className="section-copy text-sm mt-3">{project.description}</p>
                    <div className="mt-4 text-xs font-semibold text-foreground">
                      Client: {project.clientName}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-secondary">
        <div className="container">
          <div className="eyebrow">Explore the collection</div>
          <h2 className="section-title">Client Work, Samples & Creative Templates.</h2>
          <p className="section-copy mt-4 max-w-2xl">
            Browse commissioned work created for clients alongside independent sample concepts.
            Each project is labelled clearly so visitors can distinguish client work from illustrative templates.
          </p>
          <div className="flex flex-wrap gap-2 mt-8" aria-label="Portfolio categories">
            {["All Work", ...categories].map((c) => (
              <Button
                key={c}
                variant={category === c || (!category && c === "All Work") ? "forest" : "outline"}
                onClick={() =>
                  navigate({
                    search: {
                      category: c === "All Work" ? undefined : categories.find((x) => x === c),
                    },
                  })
                }
              >
                {c}
              </Button>
            ))}
          </div>
          <ProjectGrid items={filtered} />
          <p className="section-copy text-xs mt-10">
            Sample concepts are illustrative examples, not commissioned client work. Client projects
            are identified by client name. No campaign performance results are claimed unless stated.
          </p>
        </div>
      </section>
    </>
  );
}
