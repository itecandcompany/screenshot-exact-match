import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services, process } from "@/content/services";
import { projects } from "@/content/portfolio";
import { pricing, formatPrice } from "@/content/pricing";
export function PageIntro({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return (
    <section className="page-intro">
      <div className="container">
        <div className="eyebrow text-lime">{label}</div>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
    </section>
  );
}
export function ServiceGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-10">
      {services.map((s) => (
        <article className="service-card" key={s.slug}>
          <span className="service-icon">
            <s.icon size={22} />
          </span>
          <h3>{s.title}</h3>
          <p>{s.short}</p>
          <Link className="text-link mt-auto" to="/services/$slug" params={{ slug: s.slug }}>
            Learn More <ArrowUpRight size={15} />
          </Link>
        </article>
      ))}
    </div>
  );
}
export function Timeline() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-7 mt-12">
      {process.map((p, i) => (
        <div key={p.title} className="border-t border-border pt-5">
          <span className="text-muted-foreground text-xs">0{i + 1}</span>
          <h3 className="font-bold text-sm uppercase mt-5">{p.title}</h3>
          <p className="section-copy text-xs mt-3">{p.copy}</p>
        </div>
      ))}
    </div>
  );
}
export function ProjectGrid({ items = projects }: { items?: typeof projects }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10 mt-10">
      {items.map((p) => (
        <Link
          key={p.slug}
          to="/portfolio/$slug"
          params={{ slug: p.slug }}
          className="project-card group"
        >
          <div className="relative overflow-hidden rounded-sm">
            <img
              src={p.images[0]?.src}
              alt={p.images[0]?.alt}
              loading="lazy"
              width={1024}
              height={1024}
              className="project-image"
            />
            <span className="sample-badge">Sample Work</span>
          </div>
          <div className="flex justify-between mt-5">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">{p.category}</p>
              <h3 className="text-lg font-bold mt-2">{p.title}</h3>
            </div>
            <ArrowUpRight size={22} className="mt-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}
export function PricingGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
      {pricing
        .filter((p) => p.visible)
        .map((p) => (
          <article className="price-card" key={p.name}>
            {p.popular && <span className="text-xs font-bold">Most popular</span>}
            <h3>{p.name}</h3>
            <p className="text-xs text-muted-foreground leading-6 mt-3">{p.description}</p>
            <p className="price">{formatPrice(p.price)}</p>
            <p className="text-xs text-muted-foreground mt-2">per month</p>
            <div className="border-t border-border my-6" />
            <p className="font-bold text-sm">{p.designs} designs / month</p>
            <ul className="space-y-3 mt-5 text-xs">
              {[
                "Headline per design",
                "Caption per design",
                "Relevant hashtags",
                "Call to action",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check size={14} />
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild variant="forest" className="w-full mt-7 text-xs">
              <Link to="/contact" search={{ package: p.name }}>
                Choose {p.name.toLowerCase()} <ArrowUpRight />
              </Link>
            </Button>
          </article>
        ))}
    </div>
  );
}
export function Adscore() {
  return (
    <section className="section dark-band">
      <div className="container grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="eyebrow text-lime">A smarter next step</div>
          <h2 className="section-title">
            NEXTDOOR <span className="text-lime">ADSCORE</span>
          </h2>
          <p className="text-lg font-semibold mt-5">
            Understand What Works.
            <br />
            Improve What Comes Next.
          </p>
          <p className="section-copy mt-5 max-w-lg">
            A planned reporting service that turns client-provided analytics into useful creative
            insights. No guesswork. Just a clearer direction.
          </p>
        </div>
        <div>
          <span className="inline-block border border-lime/30 text-lime text-[10px] uppercase px-3 py-2">
            Coming Soon
          </span>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-7">
            {[
              "Reach & impressions",
              "Engagement & shares",
              "Link clicks",
              "Enquiries",
              "Conversions",
              "Creative comparisons",
            ].map((t) => (
              <div
                key={t}
                className="border-b border-on-dark/15 pb-4 text-sm flex items-center gap-3"
              >
                <Check size={15} className="text-lime" />
                {t}
              </div>
            ))}
          </div>
          <p className="text-xs text-dark-muted mt-6">
            Planned capability · Based on analytics you provide
          </p>
        </div>
      </div>
    </section>
  );
}
export function ClosingCTA() {
  return (
    <section className="section bg-secondary">
      <div className="container text-center">
        <div className="eyebrow justify-center">Your next chapter starts here</div>
        <h2 className="section-title mx-auto">
          Ready to Make Your
          <br />
          Brand Stand Out?
        </h2>
        <p className="section-copy max-w-xl mx-auto mt-6">
          Let's create advertising content that communicates your value and gives your business a
          stronger digital presence.
        </p>
        <Button variant="forest" asChild className="mt-8">
          <Link to="/contact">
            Start Your Project <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
