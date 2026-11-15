import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, LoaderCircle, Sparkles, Target, Video, Image as ImageIcon } from "lucide-react";

type Audit = {
  brandName: string;
  summary: string;
  audience: string;
  positioning: string;
  score: number;
  scores: { label: string; score: number; note: string }[];
  opportunities: string[];
  videoScripts: {
    title: string;
    duration: string;
    hook: string;
    scenes: { time: string; visual: string; voiceover: string }[];
    caption: string;
    hashtags: string[];
  }[];
  staticAds: { headline: string; subheadline: string; visualDirection: string; cta: string }[];
};
type BrandSource = { url: string; title: string; imageUrls: string[] };

export function BrandAudit() {
  const [brandUrl, setBrandUrl] = useState("");
  const [audit, setAudit] = useState<Audit | null>(null);
  const [sourceTitle, setSourceTitle] = useState("");
  const [source, setSource] = useState<BrandSource | null>(null);
  const [poster, setPoster] = useState("");
  const [posterLoading, setPosterLoading] = useState(false);
  const [posterError, setPosterError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAudit(null);
    setLoading(true);
    try {
      const response = await fetch("/api/brand-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandUrl }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The audit could not be completed.");
      setAudit(result.audit);
      setSourceTitle(result.source?.title || result.source?.url || "");
      setSource(result.source || null);
      sessionStorage.setItem("nextdoor-brand-audit-intake", JSON.stringify({
        brandUrl,
        sourceTitle: result.source?.title || result.source?.url || brandUrl,
        audit: result.audit,
      }));
      setPoster("");
      setPosterError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function createPoster(ad: Audit["staticAds"][number]) {
    if (!source) return;
    setPosterLoading(true);
    setPosterError("");
    setPoster("");
    try {
      const response = await fetch("/api/brand-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandUrl: source.url,
          imageUrls: source.imageUrls,
          headline: ad.headline,
          subheadline: ad.subheadline,
          cta: ad.cta,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Poster generation failed.");
      setPoster(result.poster);
    } catch (err) {
      setPosterError(err instanceof Error ? err.message : "Could not create the poster.");
    } finally {
      setPosterLoading(false);
    }
  }

  return (
    <section id="brand-audit" className="section bg-secondary">
      <div className="container">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> Free AI brand audit</div>
            <h2 className="section-title">See What Your Brand Could Be Doing Better.</h2>
            <p className="section-copy mt-5">
              Share your public website or social profile URL and get a practical brand score, fresh campaign ideas and
              ready-to-adapt social content — built around what your business actually offers.
            </p>
            <div className="mt-7 flex flex-col gap-3 text-sm">
              <span className="flex items-center gap-3"><Target size={17} /> A clear brand and messaging review</span>
              <span className="flex items-center gap-3"><Video size={17} /> Three short-form video ad scripts</span>
              <span className="flex items-center gap-3"><ImageIcon size={17} /> Two static ad creative directions</span>
            </div>
            <p className="text-xs text-muted-foreground mt-7">
              Public website URLs work best. Instagram and TikTok may block automated reading; paste a public profile link if you want us to try.
            </p>
          </div>
          <div className="rounded-sm border border-border bg-background p-5 sm:p-7">
            <form onSubmit={runAudit} className="space-y-4">
              <label htmlFor="brand-url" className="block text-sm font-semibold">Website or public profile URL</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="brand-url"
                  type="url"
                  required
                  value={brandUrl}
                  onChange={(event) => setBrandUrl(event.target.value)}
                  placeholder="https://yourbusiness.com or https://instagram.com/yourbrand"
                  className="min-w-0 flex-1 rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <><LoaderCircle className="animate-spin" size={16} /> Auditing...</> : <>Audit my brand <ArrowRight size={16} /></>}
                </button>
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              {loading && <p className="text-xs text-muted-foreground">Reading your public website, finding brand images and preparing your creative recommendations. This can take around 15–30 seconds.</p>}
            </form>
            {audit && (
              <div className="mt-8 space-y-8" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="eyebrow">Your brand report</p>
                    <h3 className="text-xl font-extrabold mt-2">{audit.brandName || sourceTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{sourceTitle}</p>
                  </div>
                  <div className="text-center rounded-sm bg-secondary px-5 py-3">
                    <div className="text-3xl font-extrabold tabular-nums">{audit.score}<span className="text-base">/100</span></div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Brand score</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm leading-6">{audit.summary}</p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-5">
                    <div className="rounded-sm bg-secondary p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Likely audience</p><p className="text-sm mt-2">{audit.audience}</p></div>
                    <div className="rounded-sm bg-secondary p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Positioning</p><p className="text-sm mt-2">{audit.positioning}</p></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-4">Creative scorecard</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {audit.scores?.map((item) => (
                      <div key={item.label} className="border border-border rounded-sm p-4">
                        <div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{item.label}</span><span className="font-bold tabular-nums">{item.score}/100</span></div>
                        <div className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} /></div>
                        <p className="text-xs text-muted-foreground mt-3">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3">Three opportunities to improve</h4>
                  <ul className="space-y-3">
                    {audit.opportunities?.map((item, index) => <li key={item} className="flex gap-3 text-sm"><CheckCircle2 size={17} className="shrink-0 text-primary mt-0.5" /><span>{item}</span></li>)}
                  </ul>
                </div>
                {source && source.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-bold text-sm mb-3">Brand images found on this website</h4>
                    <p className="text-xs text-muted-foreground mb-3">We found these real images on the business website. NEXTDOOR ADS will use them as the source material for its posters.</p>
                    <div className="grid grid-cols-3 gap-2">
                      {source.imageUrls.slice(0, 6).map((imageUrl) => (
                        <div key={imageUrl} className="aspect-square overflow-hidden rounded-sm border border-border bg-secondary">
                          <img src={imageUrl} alt="Image found on the submitted brand website" loading="lazy" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm mb-4">Video ad scripts</h4>
                  <div className="space-y-4">
                    {audit.videoScripts?.map((script, index) => (
                      <article key={script.title} className="rounded-sm border border-border p-4">
                        <div className="flex flex-wrap justify-between gap-2"><h5 className="font-bold text-sm">{index + 1}. {script.title}</h5><span className="text-xs text-muted-foreground">{script.duration}</span></div>
                        <p className="text-sm font-semibold mt-3">Hook: {script.hook}</p>
                        <div className="mt-3 space-y-3">
                          {script.scenes?.map((scene) => <div key={scene.time} className="grid grid-cols-[65px_1fr] gap-3 text-xs"><span className="font-bold text-primary">{scene.time}</span><div><p><strong>Visual:</strong> {scene.visual}</p><p className="text-muted-foreground mt-1"><strong>Voiceover:</strong> {scene.voiceover}</p></div></div>)}
                        </div>
                        <p className="text-sm mt-4">{script.caption}</p>
                        <p className="text-xs text-primary mt-2">{script.hashtags?.join(" ")}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-4">Static ad concepts</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {audit.staticAds?.map((ad, index) => (
                      <article key={ad.headline} className="rounded-sm border border-border p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Concept {index + 1}</p>
                        <h5 className="text-lg font-extrabold leading-tight mt-3">{ad.headline}</h5>
                        <p className="text-sm mt-2">{ad.subheadline}</p>
                        <p className="text-xs text-muted-foreground mt-4"><strong>Visual direction:</strong> {ad.visualDirection}</p>
                        <span className="inline-block mt-4 rounded-sm bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{ad.cta}</span>
                        <button type="button" onClick={() => createPoster(ad)} disabled={posterLoading || !source?.imageUrls?.length} className="mt-4 w-full rounded-sm border border-primary px-4 py-3 text-xs font-bold text-primary disabled:opacity-50">
                          {posterLoading ? "Creating branded poster..." : "Create poster using website images"}
                        </button>
                      </article>
                    ))}
                  </div>
                  {posterError && <p role="alert" className="text-sm text-destructive mt-4">{posterError}</p>}
                  {poster && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-bold text-sm">Your generated branded poster</h4>
                      <img src={poster} alt="AI-generated branded advertising poster using images from the submitted website" className="w-full max-w-md rounded-sm border border-border" />
                      <a href={poster} download="nextdoor-ads-brand-poster.png" className="inline-flex rounded-sm bg-primary px-4 py-3 text-xs font-bold text-primary-foreground">Download poster</a>
                    </div>
                  )}
                  {!source?.imageUrls?.length && <p className="text-xs text-muted-foreground mt-4">We could not detect usable images on this page, so poster generation is unavailable for this audit. Try a page with product or brand photos.</p>}
                </div>
                <p className="text-xs text-muted-foreground border-t border-border pt-4">
                  AI-generated first draft based on the public page we could read. Scores are directional creative assessments, not measured campaign performance.
                </p>
                <div className="rounded-sm border border-primary/30 bg-secondary p-5 space-y-3">
                  <h4 className="font-bold">Ready to create something for your brand?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your audit report will be carried into the project enquiry so our team can review
                    the website, findings and creative recommendations together.
                  </p>
                  <Button asChild variant="forest">
                    <Link to="/contact">Continue to project form <ArrowRight size={16} /></Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    The report is held in this browser session until you prepare your enquiry email.
                  </p>
                </div>
                <button type="button" onClick={() => { setAudit(null); setBrandUrl(""); sessionStorage.removeItem("nextdoor-brand-audit-intake"); }} className="text-sm font-semibold underline underline-offset-4">Audit another brand</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
