import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/content/site";
import { PageIntro } from "@/components/agency";
export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy Policy", "How NEXTDOOR ADS handles personal information."),
  component: Legal,
});
function Legal() {
  return (
    <>
      <PageIntro
        label="Legal · Draft for review"
        title="Privacy Policy"
        copy="Draft template — to be reviewed by a legal professional before launch."
      />
      <section className="section">
        <div className="container max-w-3xl space-y-10">
          <section>
            <h2 className="text-xl font-bold">Information you share</h2>
            <p className="section-copy mt-4">
              When quote delivery is enabled, the details you provide will be used to understand and
              respond to your project enquiry.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Use and sharing</h2>
            <p className="section-copy mt-4">
              Personal information should only be used for the stated enquiry purpose and shared
              with service providers needed to fulfil it.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Your rights</h2>
            <p className="section-copy mt-4">
              You may request access, correction or deletion of your personal information using the
              contact details once published.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Retention and cookies</h2>
            <p className="section-copy mt-4">
              Retention periods, hosting providers and cookie practices must be confirmed before
              launch.
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
