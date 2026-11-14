import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/content/site";
import { PageIntro } from "@/components/agency";
export const Route = createFileRoute("/terms")({
  head: () => seo("Terms & Conditions", "Draft terms for NEXTDOOR ADS creative services."),
  component: Legal,
});
function Legal() {
  return (
    <>
      <PageIntro
        label="Legal · Draft for review"
        title="Terms & Conditions"
        copy="Draft template — to be reviewed by a legal professional before launch."
      />
      <section className="section">
        <div className="container max-w-3xl space-y-10">
          <section>
            <h2 className="text-xl font-bold">Project scope</h2>
            <p className="section-copy mt-4">
              Deliverables, schedules, revision allowances and project responsibilities are to be
              agreed in a written quotation before work begins.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Pricing and payment</h2>
            <p className="section-copy mt-4">
              Displayed launch prices are proposed and subject to change. Advertising budgets,
              printing and extensive branding are charged separately.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Intellectual property</h2>
            <p className="section-copy mt-4">
              Ownership, licences and permission to use third-party assets must be specified in each
              project agreement.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Results and liability</h2>
            <p className="section-copy mt-4">
              Creative services do not guarantee sales, reach, engagement or virality. Final
              liability provisions require professional review.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
