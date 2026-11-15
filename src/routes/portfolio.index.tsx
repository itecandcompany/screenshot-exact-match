import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { categories, projects } from "@/content/portfolio";
import { seo } from "@/content/site";
import { PageIntro, ProjectGrid } from "@/components/agency";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ExternalLink } from "lucide-react";

const e3Projects = [
  {
    title: "Ether Empire Holiday Courses",
    type: "Education campaign poster",
    description:
      "A promotional poster created by NEXTDOOR ADS for E3 Empower. The artwork presents the Ether Empire Holiday Courses campaign.",
    image:
      "https://raw.githubusercontent.com/itecandcompany/screenshot-exact-match/main/Ether%20Empire%20Holiday%20Courses%20Poster-1.png",
    alt: "Ether Empire Holiday Courses promotional poster designed for E3 Empower",
  },
  {
    title: "Exaud Lizer — Empowering Tanzania’s Future",
    type: "Profile and promotional design",
    description:
      "A profile-focused promotional design created by NEXTDOOR ADS for E3 Empower, featuring Exaud Lizer and the message Empowering Tanzania’s Future.",
    image:
      "https://raw.githubusercontent.com/itecandcompany/screenshot-exact-match/main/Exaud%20Lizer_%20Empowering%20Tanzania%E2%80%99s%20Future.png",
    alt: "Exaud Lizer — Empowering Tanzania’s Future design created for E3 Empower",
  },
] as const;

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
            {e3Projects.map((project) => (
              <article className="e3-project-card" key={project.title}>
                <a
                  className="e3-project-artwork"
                  href={project.image}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open full image: ${project.title}`}
                >
                  <img src={project.image} alt={project.alt} loading="lazy" />
                  <span className="e3-artwork-open"><ExternalLink size={15} /> View full artwork</span>
                </a>
                <div className="pt-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{project.type}</p>
                  <h3 className="text-xl font-bold mt-2">{project.title}</h3>
                  <p className="section-copy text-sm mt-3">{project.description}</p>
                  <div className="mt-4 text-xs font-semibold text-foreground">Client: E3 Empower</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-secondary">
        <div className="container">
          <div className="eyebrow">Independent concepts</div>
          <h2 className="section-title">More Creative Possibilities.</h2>
          <p className="section-copy mt-4 max-w-2xl">
            The concepts below are independent sample work, not commissioned client projects or
            performance case studies.
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
            Some concepts share illustrative artwork; original project photography will replace
            these examples.
          </p>
        </div>
      </section>
    </>
  );
}
