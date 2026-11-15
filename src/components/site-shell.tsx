import { Link } from "@tanstack/react-router";
import { Menu, ArrowUpRight } from "lucide-react";
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
        <Button asChild variant="agency" className="whatsapp-float" size="icon">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hello NEXTDOOR ADS, I'd like to discuss a project.")}`}
            aria-label="Contact on WhatsApp"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false" className="whatsapp-brand-mark">
              <path fill="currentColor" d="M16.04 2.67A13.22 13.22 0 0 0 4.7 22.7L3 29l6.47-1.66a13.3 13.3 0 0 0 6.56 1.72h.01a13.2 13.2 0 0 0 0-26.39Zm0 23.96h-.01a10.9 10.9 0 0 1-5.55-1.52l-.4-.24-3.84.99 1.02-3.74-.26-.41a10.77 10.77 0 1 1 9.04 4.92Zm5.92-8.08c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.11 1.32 3.32c.16.21 2.28 3.48 5.53 4.88.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.54.27-.75.27-1.4.19-1.54-.08-.13-.3-.21-.62-.37Z" />
            </svg>
          </a>
        </Button>
      )}
    </footer>
  );
}
