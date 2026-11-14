import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowDown,
  Check,
  Sparkles,
  Fingerprint,
  PackageCheck,
  MapPin,
  PenTool,
  Target,
  HeartHandshake,
} from "lucide-react";
import hero from "@/assets/creative-studio.jpg";
import { Button } from "@/components/ui/button";
import {
  ServiceGrid,
  Timeline,
  ProjectGrid,
  PricingGrid,
  Adscore,
  ClosingCTA,
} from "@/components/agency";
import { projects } from "@/content/portfolio";
import { seo } from "@/content/site";
export const Route = createFileRoute("/")({
  head: () => ({
    ...seo(
      "Make Every Design Count.",
      "AI-assisted advertising and creative design that helps your business stand out, reach the right audience and grow.",
    ),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NEXTDOOR ADS",
          description: "AI-assisted creative advertising. Human-led creativity.",
          areaServed: "Tanzania",
        }),
      },
    ],
  }),
  component: Index,
});
function Index() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src={hero}
          width={1536}
          height={1024}
          alt="Illustrative creative professional in a design studio"
          fetchPriority="high"
        />
        <div className="container hero-content">
          <div className="eyebrow text-lime">AI-Assisted. Human-Led. Impact-Driven.</div>
          <h1>
            Make Every
            <br />
            Design <span className="text-lime">Count.</span>
          </h1>
          <p className="hero-copy">
            AI-assisted advertising and creative design that helps your business stand out, reach
            the right audience and grow.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild variant="agency">
              <Link to="/contact">
                Let's Grow Your Brand <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="darkOutline">
              <Link to="/services">
                Explore Our Services <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="hero-bottom">
            <span className="flex gap-2 items-center">
              <MapPin size={14} className="text-lime" />
              Based in Tanzania. Creating for East Africa.
            </span>
            <span className="h-4 border-l border-on-dark/25 hidden sm:block" />
            <span className="flex items-center gap-2">
              <HeartHandshake size={15} className="text-lime" />
              Your growth. Our purpose.
            </span>
          </div>
        </div>
        <span className="hero-label">Illustrative studio image · AI-generated</span>
        <a
          href="#creative"
          aria-label="Discover our creative approach"
          className="absolute bottom-6 left-1/2 text-on-dark/70 hidden md:block"
        >
          <ArrowDown size={20} />
        </a>
      </section>
      <div className="promise-strip">
        <div className="container">
          {[
            { icon: PenTool, text: "Human-Led Creativity" },
            { icon: Sparkles, text: "AI-Assisted Workflows" },
            { icon: Target, text: "Audience-Focused Design" },
            { icon: PackageCheck, text: "Publishing-Ready Content" },
          ].map((p) => (
            <span key={p.text}>
              <p.icon size={17} />
              {p.text}
            </span>
          ))}
        </div>
      </div>
      <section id="creative" className="section">
        <div className="container grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <div className="eyebrow">Creativity with a purpose</div>
            <h2 className="section-title">
              Great Advertising Starts
              <br />
              With the Right Creative.
            </h2>
          </div>
          <div>
            <p className="section-copy">
              Every business deserves advertising that looks professional and communicates with
              purpose. We combine creative thinking, AI-assisted workflows and human design
              expertise to turn your ideas into content that connects.
            </p>
            <Link to="/about" className="text-link mt-6">
              Meet NEXTDOOR ADS <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section border-t border-border pt-16">
        <div className="container">
          <div className="flex flex-wrap gap-6 items-end justify-between">
            <div>
              <div className="eyebrow">What we do</div>
              <h2 className="section-title">Good Ideas. Great Execution.</h2>
            </div>
            <Link to="/services" className="text-link">
              Explore All Services <ArrowUpRight size={16} />
            </Link>
          </div>
          <ServiceGrid />
        </div>
      </section>
      <section className="section dark-band">
        <div className="container grid lg:grid-cols-2 gap-16">
          <div>
            <div className="eyebrow text-lime">The NEXTDOOR difference</div>
            <h2 className="section-title">
              Creative Thinking.
              <br />
              <span className="text-lime">Smarter Advertising.</span>
            </h2>
            <p className="section-copy mt-6 max-w-md">
              Technology expands the possibilities. Human creativity makes them meaningful. We bring
              both together for your brand.
            </p>
            <Button asChild variant="agency" className="mt-7">
              <Link to="/contact">
                Let's Create Something <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              ["Purposeful design", "Professional visuals shaped around your message."],
              ["Accessible creativity", "Affordable creative solutions for growing businesses."],
              ["A consistent brand", "One clear identity across every touchpoint."],
              ["Smarter workflows", "AI-assisted exploration. Human-led decisions."],
              ["Ready for your audience", "Messaging with the right people in mind."],
              ["Room to improve", "Future work informed by available performance insights."],
            ].map(([t, c]) => (
              <div key={t}>
                <Check className="text-lime mb-3" size={19} />
                <h3 className="font-bold text-sm">{t}</h3>
                <p className="section-copy text-xs mt-2">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="flex flex-wrap justify-between items-end gap-6">
            <div>
              <div className="eyebrow">From idea to impact</div>
              <h2 className="section-title">A Clear Process. A Creative Journey.</h2>
            </div>
            <Link to="/process" className="text-link">
              Our Process <ArrowUpRight size={16} />
            </Link>
          </div>
          <Timeline />
        </div>
      </section>
      <section className="section bg-secondary">
        <div className="container">
          <div className="flex justify-between flex-wrap gap-6 items-end">
            <div>
              <div className="eyebrow">A look at the possibilities</div>
              <h2 className="section-title">Creative That Speaks for Itself.</h2>
            </div>
            <Link to="/portfolio" className="text-link">
              View Portfolio <ArrowUpRight size={16} />
            </Link>
          </div>
          <ProjectGrid items={projects.filter((p) => p.featured)} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="eyebrow">Built for your next stage</div>
          <h2 className="section-title">Big Ambitions. Accessible Creative.</h2>
          <p className="section-copy mt-4">
            A monthly creative package that fits where your business is today.
          </p>
          <PricingGrid />
          <p className="section-copy text-xs mt-6">
            Proposed launch prices, subject to change. Paid advertising budgets, printing and
            extensive branding projects are charged separately.
          </p>
        </div>
      </section>
      <Adscore />
      <ClosingCTA />
    </>
  );
}
