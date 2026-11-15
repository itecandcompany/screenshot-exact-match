import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Copy, Download, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaignInputSchema, briefFields, briefAsText, type CampaignInput, type CampaignBrief } from "@/content/campaign";
import { createCampaignBrief } from "@/lib/campaign.functions";

export function CampaignBuilder() {
  const generate = useServerFn(createCampaignBrief);
  const [brief, setBrief] = useState<CampaignBrief | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CampaignInput>({
    resolver: zodResolver(campaignInputSchema),
    defaultValues: { business: "", description: "", goals: "", audience: "", market: "", budget: "", timeline: "", website: "" },
  });
  async function submit(data: CampaignInput) {
    setError(""); setCopied(false);
    try {
      const result = await generate({ data });
      if (result.error) { setError(result.error); return; }
      if (result.brief) {
        setBrief(result.brief);
        requestAnimationFrame(() => resultRef.current?.focus());
      }
    } catch {
      setError("Your brief could not be created. Your details are still here; please try again later.");
    }
  }
  async function copy() {
    if (!brief) return;
    try { await navigator.clipboard.writeText(briefAsText(brief)); setCopied(true); }
    catch { setError("Copy is unavailable in this browser. You can download the brief instead."); }
  }
  function download() {
    if (!brief) return;
    const url = URL.createObjectURL(new Blob([briefAsText(brief)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "nextdoor-ads-campaign-brief.txt"; link.click();
    URL.revokeObjectURL(url);
  }
  return <section className="section">
    <div className="container grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
      <form noValidate onSubmit={handleSubmit(submit)} className="grid sm:grid-cols-2 gap-5 min-w-0" aria-label="Campaign details">
        <fieldset disabled={isSubmitting} className="contents">
          {[
            { key: "business", label: "Business name", placeholder: "Your business or organisation", max: 120 },
            { key: "market", label: "Target location", placeholder: "e.g. Dar es Salaam, Tanzania", max: 150 },
          ].map((field) => <div className="quote-field min-w-0" key={field.key}>
            <label htmlFor={`campaign-${field.key}`}>{field.label}</label>
            <input id={`campaign-${field.key}`} maxLength={field.max} placeholder={field.placeholder} {...register(field.key as "business" | "market")} aria-invalid={!!errors[field.key as keyof CampaignInput]} aria-describedby={`campaign-${field.key}-error`} />
            <span className="field-error" id={`campaign-${field.key}-error`}>{errors[field.key as keyof CampaignInput]?.message}</span>
          </div>)}
          {[
            { key: "description", label: "What does your business offer?", placeholder: "Your products or services, what makes them different, and your brand personality…", max: 2000 },
            { key: "goals", label: "Advertising goals", placeholder: "What would you like to achieve? More enquiries, a product launch, awareness…", max: 1500 },
            { key: "audience", label: "Ideal customers", placeholder: "Who do you want to reach? Their needs, interests, and buying habits…", max: 800 },
          ].map((field) => <div className="quote-field sm:col-span-2" key={field.key}>
            <label htmlFor={`campaign-${field.key}`}>{field.label}</label>
            <textarea id={`campaign-${field.key}`} rows={3} maxLength={field.max} placeholder={field.placeholder} {...register(field.key as "description" | "goals" | "audience")} aria-invalid={!!errors[field.key as keyof CampaignInput]} aria-describedby={`campaign-${field.key}-error`} />
            <span className="field-error" id={`campaign-${field.key}-error`}>{errors[field.key as keyof CampaignInput]?.message}</span>
          </div>)}
          {[
            { key: "budget", label: "Campaign budget & currency", placeholder: "e.g. TSh 300,000 total, or undecided" },
            { key: "timeline", label: "Launch date / timeframe", placeholder: "e.g. Four weeks, or undecided" },
          ].map((field) => <div className="quote-field min-w-0" key={field.key}>
            <label htmlFor={`campaign-${field.key}`}>{field.label}</label>
            <input id={`campaign-${field.key}`} maxLength={150} placeholder={field.placeholder} {...register(field.key as "budget" | "timeline")} aria-invalid={!!errors[field.key as keyof CampaignInput]} aria-describedby={`campaign-${field.key}-error`} />
            <span className="field-error" id={`campaign-${field.key}-error`}>{errors[field.key as keyof CampaignInput]?.message}</span>
          </div>)}
          <div hidden aria-hidden="true"><input aria-label="Leave empty" tabIndex={-1} autoComplete="off" {...register("website")} /></div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-3 text-xs leading-6" htmlFor="campaign-consent">
              <input id="campaign-consent" type="checkbox" className="mt-1.5 size-4 shrink-0 accent-forest" {...register("consent")} aria-describedby="campaign-consent-error" />
              <span>I agree to send these details to AI for a campaign draft. I will not include confidential or personal information.</span>
            </label>
            <p id="campaign-consent-error" className="field-error">{errors.consent?.message}</p>
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-4 items-center">
            <Button type="submit" variant="forest" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Sparkles />}
              {isSubmitting ? "Creating your brief…" : brief ? "Create revised brief" : "Create campaign brief"}
              {!isSubmitting && <ArrowRight />}
            </Button>
          </div>
        </fieldset>
        <div className="sm:col-span-2 text-xs text-muted-foreground leading-6">
          <p>Your details are not saved as a lead or emailed to NEXTDOOR ADS. Download your brief before leaving.</p>
          <p role="status">{isSubmitting ? "Preparing your campaign draft…" : copied ? "Brief copied." : ""}</p>
          {error && <p role="alert" className="text-destructive">{error}</p>}
        </div>
      </form>
      <article ref={resultRef} tabIndex={-1} aria-label="Campaign brief" aria-busy={isSubmitting} className="min-w-0 scroll-mt-28 border-t-4 border-forest bg-secondary p-6 sm:p-8 outline-none focus-visible:ring-2 ring-ring break-words">
        <div className="eyebrow">NEXTDOOR ADS · Campaign studio</div>
        {brief ? <>
          <div className="flex flex-wrap items-start justify-between gap-4 mt-6">
            <h2 className="text-2xl font-bold leading-snug">{brief.title}</h2>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" title="Copy brief" aria-label="Copy brief" onClick={copy}><Copy /></Button>
              <Button type="button" variant="outline" size="icon" title="Download brief" aria-label="Download brief" onClick={download}><Download /></Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">AI-generated draft · Human review required · Not a quote or performance guarantee</p>
          <div className="divide-y divide-border mt-6">{briefFields.map((field, i) => <section key={field.key} className="py-5">
            <h3 className="text-sm font-bold"><span className="text-muted-foreground mr-3 tabular-nums">{String(i + 1).padStart(2, "0")}</span>{field.label}</h3>
            <p className="text-sm leading-7 whitespace-pre-line mt-3">{brief[field.key]}</p>
          </section>)}</div>
        </> : <>
          <Sparkles className="size-8 mt-10 text-forest" />
          <h2 className="text-2xl font-bold mt-5">Your next campaign starts here.</h2>
          <div className="mt-8 divide-y divide-border">{["A clear objective", "An audience-led creative direction", "A practical launch plan"].map((label, i) => <div className="py-5 flex gap-4 items-center text-sm" key={label}><span className="text-muted-foreground tabular-nums">0{i + 1}</span>{label}</div>)}</div>
        </>}
      </article>
    </div>
  </section>;
}