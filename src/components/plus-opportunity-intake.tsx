import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, FilePlus2, ShieldCheck, XCircle } from "lucide-react";
import {
  isPlatformAdmin,
  listOpportunitySubmissions,
  reviewOpportunitySubmission,
  submitOpportunity,
  type AuthSession,
  type OpportunitySubmission,
} from "@/lib/supabase/client";
import type { OpportunitySubmissionDraft } from "@/lib/opportunity-submissions";

const emptyDraft: OpportunitySubmissionDraft = {
  title: "",
  description: "",
  country: "Tanzania",
  region: "",
  city: "",
  channel: "",
  opportunityType: "",
  eligibility: "",
  deadline: "",
  sourceUrl: "",
  sourceName: "",
  sourceEvidence: "",
};

interface PlusOpportunityIntakeProps {
  session: AuthSession;
  onRefresh: () => Promise<void>;
}

export function PlusOpportunityIntake({ session, onRefresh }: PlusOpportunityIntakeProps) {
  const [draft, setDraft] = useState<OpportunitySubmissionDraft>(emptyDraft);
  const [submissions, setSubmissions] = useState<OpportunitySubmission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const [admin, rows] = await Promise.all([
        isPlatformAdmin(session),
        listOpportunitySubmissions(session),
      ]);
      setIsAdmin(admin);
      setSubmissions(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load opportunity submissions.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  function updateDraft(field: keyof OpportunitySubmissionDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await submitOpportunity(session, draft);
      setDraft(emptyDraft);
      await Promise.all([loadSubmissions(), onRefresh()]);
      setNotice("Your opportunity suggestion was sent for source review. It is not public yet.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not submit this opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(submissionId: string, decision: "approved" | "rejected") {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await reviewOpportunitySubmission(
        session,
        submissionId,
        decision,
        reviewNotes[submissionId] ?? "",
      );
      setReviewNotes((current) => {
        const next = { ...current };
        delete next[submissionId];
        return next;
      });
      await Promise.all([loadSubmissions(), onRefresh()]);
      setNotice(
        decision === "approved"
          ? "Source reviewed and opportunity published to the Nextdoor Plus feed."
          : "Submission rejected. The submitter can see your review note.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not review this submission.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ed] text-[#286442]">
            <FilePlus2 size={19} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">Help grow the network</div>
            <h2 className="mt-1 text-xl font-black">Suggest an opportunity</h2>
          </div>
        </div>
        <p className="mb-5 max-w-3xl text-sm leading-6 text-[#718075]">
          Share a real advertising opportunity or media placement with its original source. Suggestions stay private until a Nextdoor Ads administrator checks the evidence and approves publication.
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-4 rounded-xl border border-[#c9e5ce] bg-[#edf8ef] px-4 py-3 text-sm text-[#245a38]">
            {notice}
          </div>
        )}

        <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold md:col-span-2">
            Opportunity title
            <input
              required
              minLength={5}
              maxLength={160}
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="e.g. Arusha outdoor advertising placements"
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Original source URL
            <input
              required
              type="url"
              value={draft.sourceUrl}
              onChange={(event) => updateDraft("sourceUrl", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="https://official-source.example/opportunity"
            />
          </label>
          <label className="text-sm font-semibold">
            Source or publisher name
            <input
              maxLength={160}
              value={draft.sourceName}
              onChange={(event) => updateDraft("sourceName", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Official publisher"
            />
          </label>
          <label className="text-sm font-semibold">
            Country
            <input
              maxLength={80}
              value={draft.country}
              onChange={(event) => updateDraft("country", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
            />
          </label>
          <label className="text-sm font-semibold">
            Region
            <input
              maxLength={120}
              value={draft.region}
              onChange={(event) => updateDraft("region", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Arusha"
            />
          </label>
          <label className="text-sm font-semibold">
            City
            <input
              maxLength={120}
              value={draft.city}
              onChange={(event) => updateDraft("city", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Arusha"
            />
          </label>
          <label className="text-sm font-semibold">
            Advertising channel
            <input
              maxLength={120}
              value={draft.channel}
              onChange={(event) => updateDraft("channel", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Outdoor, radio, social media"
            />
          </label>
          <label className="text-sm font-semibold">
            Opportunity type
            <input
              maxLength={120}
              value={draft.opportunityType}
              onChange={(event) => updateDraft("opportunityType", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Media placement, campaign, tender"
            />
          </label>
          <label className="text-sm font-semibold">
            Application or booking deadline
            <input
              type="date"
              value={draft.deadline}
              onChange={(event) => updateDraft("deadline", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Description and eligibility
            <textarea
              maxLength={3000}
              rows={3}
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Describe what is being offered and who can apply."
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Source evidence (required)
            <textarea
              required
              minLength={20}
              maxLength={4000}
              rows={3}
              value={draft.sourceEvidence}
              onChange={(event) => updateDraft("sourceEvidence", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dce5dd] px-3 py-2.5 font-normal outline-none focus:border-[#4e9466]"
              placeholder="Explain what the original source confirms, including the opportunity details, eligibility or deadline."
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
            <p className="max-w-xl text-xs leading-5 text-[#7a887e]">
              Submitting does not publish a listing. An administrator must verify the source first.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c5039] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#143d2b] disabled:opacity-50"
            >
              <FilePlus2 size={16} />
              {submitting ? "Sending…" : "Submit for review"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm md:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">
              {isAdmin ? "Administration" : "Submission history"}
            </div>
            <h2 className="mt-1 text-xl font-black">
              {isAdmin ? "Opportunity review queue" : "Your submitted opportunities"}
            </h2>
          </div>
          {isAdmin && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f4e8] px-3 py-1.5 text-xs font-bold text-[#286442]">
              <ShieldCheck size={14} /> Admin
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-[#718075]">Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd9cd] px-4 py-8 text-center text-sm text-[#718075]">
            {isAdmin ? "No opportunity suggestions are waiting for review." : "Your opportunity suggestions will appear here."}
          </div>
        ) : (
          <div className="divide-y divide-[#edf1ed]">
            {submissions.map((submission) => (
              <article key={submission.id} className="space-y-3 py-5 first:pt-1 last:pb-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{submission.title}</h3>
                    <p className="mt-1 text-xs text-[#7a887e]">
                      {submission.source_name || "Source submitted"} · {new Date(submission.created_at).toLocaleDateString()}
                      {isAdmin ? " · Submitted by " + submission.submitted_by.slice(0, 8) : ""}
                    </p>
                  </div>
                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs font-bold capitalize " +
                      (submission.status === "approved"
                        ? "bg-[#e8f4e8] text-[#286442]"
                        : submission.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-800")
                    }
                  >
                    {submission.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <a href={submission.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#286442] hover:underline">
                    Open original source <ArrowUpRight size={13} />
                  </a>
                  {submission.published_opportunity_id && (
                    <span className="text-[#617469]">Published to the opportunity feed</span>
                  )}
                </div>
                {submission.source_evidence && (
                  <p className="rounded-xl bg-[#f6f8f5] p-3 text-xs leading-5 text-[#617469]">
                    <strong>Source evidence:</strong> {submission.source_evidence}
                  </p>
                )}
                {submission.review_note && (
                  <p className="rounded-xl bg-[#fff8e8] p-3 text-xs leading-5 text-[#74571b]">
                    <strong>Review note:</strong> {submission.review_note}
                  </p>
                )}
                {isAdmin && submission.status === "pending" && (
                  <div className="space-y-2 rounded-xl border border-[#e5ece5] p-3">
                    <label className="block text-xs font-semibold text-[#617469]">
                      Review note (optional)
                      <textarea
                        rows={2}
                        maxLength={2000}
                        value={reviewNotes[submission.id] ?? ""}
                        onChange={(event) =>
                          setReviewNotes((current) => ({ ...current, [submission.id]: event.target.value }))
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#dce5dd] px-3 py-2 text-sm font-normal outline-none focus:border-[#4e9466]"
                        placeholder="Explain the decision or any source issue."
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleReview(submission.id, "approved")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c5039] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Approve and publish
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleReview(submission.id, "rejected")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6d4d4] px-3 py-2 text-xs font-bold text-[#9a3d3d] disabled:opacity-50"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
