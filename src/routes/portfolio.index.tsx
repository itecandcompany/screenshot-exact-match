import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { categories, projects } from "@/content/portfolio";
import { seo } from "@/content/site";
import { PageIntro, ProjectGrid } from "@/components/agency";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/portfolio/")({
  validateSearch: z.object({ category: z.enum(categories).optional().catch(undefined) }),
  head: () =>
    seo(
      "Portfolio",
      "Explore independent sample concepts across advertising, branding, social media and education.",
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
        label="Selected creative concepts"
        title="Creative That Speaks for Itself."
        copy="A look at the possibilities. All projects below are independent sample concepts, not commissioned client work or performance case studies."
      />
      <section className="section">
        <div className="container">
          <div className="flex flex-wrap gap-2" aria-label="Portfolio categories">
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
