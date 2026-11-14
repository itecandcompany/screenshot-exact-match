import { Link } from "@tanstack/react-router";
import { Menu, ArrowUpRight, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { nav, site } from "@/content/site";
import { services } from "@/content/services";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container h-full flex items-center justify-between gap-6">
        <Link to="/" aria-label="NEXTDOOR ADS home">
          <Logo />
        </Link>
        <nav className="desktop-nav flex items-center gap-6" aria-label="Main navigation">
          {nav.map((n) => (
            <Link className="nav-link" key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="agency" className="hidden xl:inline-flex text-xs">
          <Link to="/contact">
            Get a Free Quote <ArrowUpRight />
          </Link>
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="darkOutline"
              size="icon"
              className="mobile-menu-button"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-forest text-on-dark">
            <SheetTitle className="text-on-dark">NEXTDOOR ADS</SheetTitle>
            <nav className="flex flex-col gap-4 mt-10">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="nav-link">
                  {n.label}
                </Link>
              ))}
              <Button asChild variant="agency">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Get a Free Quote <ArrowUpRight />
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container grid gap-10 md:grid-cols-[2fr_1fr_1.5fr_1fr] pb-14">
        <div>
          <Link to="/" aria-label="NEXTDOOR ADS home">
            <Logo />
          </Link>
          <p className="mt-6 max-w-xs">
            AI-assisted creative advertising.
            <br />
            Human-led creativity. Purposeful impact.
            <br />
            Made for ambitious brands in Tanzania and beyond.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <div className="flex flex-col gap-2">
            {nav.slice(1).map((n) => (
              <Link key={n.to} to={n.to}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3>What we do</h3>
          <div className="flex flex-col gap-2">
            {services.map((s) => (
              <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
                {s.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3>Let's connect</h3>
          <p>{site.location}</p>
          <p className="mt-3">{site.email || "[EMAIL TO BE ADDED]"}</p>
          <p>{site.phone || "[PHONE TO BE ADDED]"}</p>
          <Link to="/contact" className="inline-flex gap-2 mt-5">
            Start a conversation <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="container border-t border-on-dark/15 py-6 flex flex-wrap gap-4 items-center justify-between">
        <p>© {new Date().getFullYear()} NEXTDOOR ADS. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
      {/^\d{8,15}$/.test(site.whatsapp) && (
        <Button asChild variant="agency" className="fixed bottom-6 right-6 z-30" size="icon">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hello NEXTDOOR ADS, I'd like to discuss a project.")}`}
            aria-label="Contact on WhatsApp"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle />
          </a>
        </Button>
      )}
    </footer>
  );
}
