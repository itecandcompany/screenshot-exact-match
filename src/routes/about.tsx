import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/content/site";
import { PageIntro, ClosingCTA } from "@/components/agency";
export const Route = createFileRoute("/about")({
  head: () =>
    seo(
      "About Us",
      "Creativity that connects businesses to people. Meet the purpose behind NEXTDOOR ADS.",
    ),
  component: About,
});
function About() {
  return (
    <>
      <PageIntro
        label="About NEXTDOOR ADS"
        title="Creativity That Connects Businesses to People."
        copy="We combine artificial intelligence, professional graphic design and marketing insights to create purposeful advertising content."
      />
      <section className="section">
        <div className="container grid md:grid-cols-2 gap-16">
          <div>
            <div className="eyebrow">Our story</div>
            <h2 className="section-title">Good creative should open doors.</h2>
            <p className="section-copy mt-6">
              Nextdoor Ads is an AI-assisted creative advertising company helping businesses,
              organisations and brands build stronger identities, create engaging promotional
              content and connect with their target audiences.
            </p>
            <p className="section-copy mt-4">
              We believe good advertising is more than an attractive image. It must communicate the
              right message to the right audience.
            </p>
          </div>
          <div className="space-y-8">
            {/* DRAFT – OWNER TO CONFIRM: story framing, vision, values */}
            {[
              [
                "Our mission",
                "Make professional, intelligent and effective advertising accessible and affordable for businesses of every size.",
              ],
              [
                "Our vision",
                "A future where ambitious businesses can express their value through purposeful, professional creative.",
              ],
              [
                "Our values",
                "Creativity with purpose. Clear communication. Human judgement. Accessibility. Continuous improvement.",
              ],
              [
                "Our approach",
                "AI helps us explore possibilities; human expertise shapes the direction. Every design starts with your business and the people you want to reach.",
              ],
            ].map(([t, c]) => (
              <div key={t} className="border-b border-border pb-6">
                <h3 className="font-bold text-lg">{t}</h3>
                <p className="section-copy mt-3">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
