import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, CalendarDays, ShieldCheck } from "lucide-react";
import {
  getOpportunityById,
  getSession,
  type Opportunity,
} from "@/lib/supabase/client";
import { getSafeExternalUrl } from "@/lib/safe-external-url";
import {
  formatOpportunityDate,
  getOpportunityDeadlineLabel,
  getOpportunityDeadlineStatus,
} from "@/lib/opportunity-display";

export const Route = createFileRoute("/plus/opportunities/$opportunityId")({
  head: () => ({
    meta: [
      { title: "Opportunity details | Nextdoor Plus" },
      {
        name: "description",
        content: "Review a source-backed opportunity in your NEXTDOOR ADS workspace.",
      },
    ],
  }),
  component: PlusOpportunityDetailPage,
});

type PageState = "loading" | "signed-out" | "ready" | "missing" | "error";

function PlusOpportunityDetailPage() {
  const { opportunityId } = Route.useParams();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOpportunity() {
      setPageState("loading");
      setOpportunity(null);
      setError("");

      try {
        const session = await getSession();
        if (!active) return;

        if (!session) {
          setPageState("signed-out");
          return;
        }

        const record = await getOpportunityById(session, opportunityId);
        if (!active) return;

        setOpportunity(record);
        setPageState(record ? "ready" : "missing");
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "We could not load this opportunity. Please try again.",
        );
        setPageState("error");
      }
    }

    void loadOpportunity();
    return () => {
      active = false;
    };
  }, [opportunityId]);

  const sourceUrl = getSafeExternalUrl(opportunity?.source_url);
  const deadline = formatOpportunityDate(opportunity?.deadline);
  const deadlineStatus = getOpportunityDeadlineStatus(opportunity?.deadline);
  const deadlineLabel = getOpportunityDeadlineLabel(deadlineStatus);
  const deadlineBadgeClass = deadlineStatus === "expired"
    ? "bg-[#ffe5e5] text-[#7f1d1d]"
    : deadlineStatus === "closing_soon"
      ? "bg-[#fff4d6] text-[#704b00]"
      : "bg-white/10 text-white";
  const verifiedAt = formatOpportunityDate(opportunity?.verified_at);

  return (
    <main className="min-h-[80vh] bg-[#f5f7f4] py-10 text-[#183b2d] md:py-14">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <a
          href="/plus"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#286442] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Nextdoor Plus
        </a>

        {pageState === "loading" && (
          <div role="status" className="mt-8 rounded-2xl border border-[#dfe8e0] bg-white p-8 text-sm text-[#617469]">
            Loading verified opportunity details…
          </div>
        )}

        {pageState === "signed-out" && (
          <section className="mt-8 rounded-3xl border border-[#dfe8e0] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5ed] text-[#286442]">
              <ShieldCheck size={23} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">
              NEXTDOOR ADS · NEXTDOOR PLUS
            </p>
            <h1 className="mt-3 text-2xl font-black md:text-3xl">Sign in to view this opportunity</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#718075]">
              Opportunity details are available inside your secure Nextdoor Plus workspace.
              Sign in, then reopen this link to continue.
            </p>
            <a
              href="/plus"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1c5039] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#143d2b]"
            >
              Sign in to Nextdoor Plus <ArrowUpRight size={16} />
            </a>
          </section>
        )}

        {pageState === "missing" && (
          <section className="mt-8 rounded-3xl border border-[#dfe8e0] bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black">This opportunity is no longer available</h1>
            <p className="mt-3 text-sm leading-6 text-[#718075]">
              It may have been withdrawn, expired or unpublished. Return to your workspace to browse current listings.
            </p>
            <a href="/plus" className="mt-5 inline-flex text-sm font-bold text-[#286442] hover:underline">
              Return to your workspace
            </a>
          </section>
        )}

        {pageState === "error" && (
          <section role="alert" className="mt-8 rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-black">We could not load this opportunity</h1>
            <p className="mt-3 text-sm leading-6 text-red-800">{error}</p>
            <a href="/plus" className="mt-5 inline-flex text-sm font-bold text-[#286442] hover:underline">
              Return to your workspace
            </a>
          </section>
        )}

        {pageState === "ready" && opportunity && (
          <article className="mt-8 overflow-hidden rounded-3xl border border-[#dfe8e0] bg-white shadow-sm">
            <div className="bg-[#173f30] px-7 py-8 text-white md:px-10 md:py-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c8f36b]">
                NEXTDOOR ADS · VERIFIED OPPORTUNITY
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">{opportunity.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                {[opportunity.city, opportunity.region, opportunity.country].filter(Boolean).join(", ")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
                {opportunity.channel && <span className="rounded-full bg-white/10 px-3 py-1.5">{opportunity.channel}</span>}
                {opportunity.opportunity_type && <span className="rounded-full bg-white/10 px-3 py-1.5">{opportunity.opportunity_type}</span>}
                <span className={`rounded-full px-3 py-1.5 ${deadlineBadgeClass}`}>{deadlineLabel}</span>
              </div>
            </div>

            <div className="space-y-7 p-7 md:p-10">
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">Opportunity overview</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#365b43]">{opportunity.description}</p>
              </section>

              {(opportunity.eligibility || deadline || verifiedAt) && (
                <dl className="grid gap-5 border-t border-[#edf1ed] pt-6 sm:grid-cols-2">
                  {opportunity.eligibility && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-bold uppercase tracking-wide text-[#7a887e]">Eligibility</dt>
                      <dd className="mt-2 whitespace-pre-line text-sm leading-6 text-[#365b43]">{opportunity.eligibility}</dd>
                    </div>
                  )}
                  {deadline && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-[#7a887e]">Deadline · Tanzania time</dt>
                      <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#365b43]">
                        <CalendarDays size={16} /> {deadline}
                      </dd>
                    </div>
                  )}
                  {verifiedAt && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-[#7a887e]">Last verified</dt>
                      <dd className="mt-2 text-sm font-semibold text-[#365b43]">{verifiedAt}</dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1ed] pt-6">
                <div className="text-xs text-[#7a887e]">
                  {opportunity.source_name ? `Source: ${opportunity.source_name}` : "Source details available"}
                </div>
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1c5039] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#143d2b]"
                  >
                    Open original source <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <span className="text-xs text-[#8a9a8e]">Original source unavailable</span>
                )}
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
