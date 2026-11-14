import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getSession,
  addOpportunityNote,
  consumeRecoverySession,
  listOpportunities,
  listOpportunityActivity,
  listSavedOpportunities,
  loadWorkspace,
  saveOpportunity,
  sendPasswordReset,
  setOpportunityFollowUp,
  updateOpportunityStatus,
  updatePassword,
  signIn,
  signOut,
  signUp,
  type AuthSession,
  type Opportunity,
  type OpportunityActivity,
  type SavedOpportunity,
  type Workspace,
} from "@/lib/supabase/client";

export const Route = createFileRoute("/plus")({
  head: () => ({
    meta: [
      { title: "Nextdoor Plus | NEXTDOOR ADS" },
      {
        name: "description",
        content:
          "Your NEXTDOOR ADS workspace for discovering, evaluating and managing advertising opportunities.",
      },
    ],
  }),
  component: NextdoorPlusPage,
});

type AuthMode = "signin" | "signup" | "reset" | "set-password";

async function hydrateAccount(
  session: AuthSession,
  displayName: string,
): Promise<{ workspace: Workspace; opportunities: Opportunity[]; saved: SavedOpportunity[]; activity: OpportunityActivity[] }> {
  const workspace = await loadWorkspace(session, displayName);
  const [opportunities, saved, activity] = await Promise.all([
    listOpportunities(session),
    listSavedOpportunities(session, workspace.id),
    listOpportunityActivity(session, workspace.id),
  ]);
  return { workspace, opportunities, saved, activity };
}

function NextdoorPlusPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [saved, setSaved] = useState<SavedOpportunity[]>([]);
  const [activity, setActivity] = useState<OpportunityActivity[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccount = useCallback(async (current: AuthSession, name = "") => {
    const data = await hydrateAccount(current, name);
    setSession(current);
    setWorkspace(data.workspace);
    setOpportunities(data.opportunities);
    setSaved(data.saved);
    setActivity(data.activity);
  }, []);

  useEffect(() => {
    let active = true;
    void consumeRecoverySession()
      .then(async (recovery) => {
        const current = recovery ?? await getSession();
        if (recovery && active) setMode("set-password");
        if (current && active) await loadAccount(current);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAccount]);

  const savedIds = useMemo(
    () => new Set(saved.map((item) => item.opportunity_id)),
    [saved],
  );

  const filteredOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return opportunities;
    return opportunities.filter((item) =>
      [
        item.title,
        item.description,
        item.country,
        item.region,
        item.city,
        item.channel,
        item.opportunity_type,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [opportunities, search]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (mode === "set-password") {
        const current = await getSession();
        if (!current) throw new Error("Your password reset session has expired. Request a new reset link.");
        await updatePassword(current, password);
        await loadAccount(current);
        setNotice("Your password has been updated successfully.");
        setMode("signin");
      } else if (mode === "reset") {
        await sendPasswordReset(email.trim());
        setNotice("If an account exists for that email, a password reset link is on its way.");
        setMode("signin");
      } else if (mode === "signup") {
        const created = await signUp(email.trim(), password);
        if (!created) {
          setNotice("Your account request was received. Check your email to confirm your address, then sign in here.");
          setMode("signin");
        } else {
          await loadAccount(created, displayName.trim());
          setNotice("Your Nextdoor Plus workspace is ready.");
        }
      } else {
        const authenticated = await signIn(email.trim(), password);
        await loadAccount(authenticated);
        setNotice("Welcome back. Your workspace is ready.");
      }
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not complete that request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave(opportunity: Opportunity) {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const current = await getSession();
      if (!current || !workspace) throw new Error("Your session has expired. Please sign in again.");
      await saveOpportunity(current, workspace.id, opportunity.id);
      const [refreshed, refreshedActivity] = await Promise.all([
        listSavedOpportunities(current, workspace.id),
        listOpportunityActivity(current, workspace.id),
      ]);
      setSaved(refreshed);
      setActivity(refreshedActivity);
      setSession(current);
      setNotice("Opportunity saved to your workspace.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save this opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePipelineAction(
    opportunityId: string,
    action: "interested" | "applied" | "won" | "dismissed" | "note" | "follow_up",
  ) {
    if (!workspace) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const current = await getSession();
      if (!current) throw new Error("Your session has expired. Please sign in again.");
      if (action === "note") {
        const note = (noteDrafts[opportunityId] ?? "").trim();
        if (!note) throw new Error("Write a note before saving it.");
        await addOpportunityNote(current, workspace.id, opportunityId, note);
        setNoteDrafts((previous) => ({ ...previous, [opportunityId]: "" }));
        setNotice("Note added to your opportunity history.");
      } else if (action === "follow_up") {
        const date = followUpDrafts[opportunityId];
        if (!date) throw new Error("Choose a follow-up date first.");
        await setOpportunityFollowUp(current, workspace.id, opportunityId, new Date(date).toISOString());
        setNotice("Follow-up added to your opportunity history.");
      } else {
        await updateOpportunityStatus(current, workspace.id, opportunityId, action);
        setNotice("Opportunity status updated.");
      }
      setActivity(await listOpportunityActivity(current, workspace.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not update this opportunity.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setSubmitting(true);
    try {
      await signOut();
      setSession(null);
      setWorkspace(null);
      setOpportunities([]);
      setSaved([]);
      setActivity([]);
      setNotice("You have signed out.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] bg-[#f5f7f4] py-10 text-[#183b2d] md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e4f1e6] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#286442]">
              <Sparkles size={14} /> NEXTDOOR ADS
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Nextdoor Plus</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#617469] md:text-base">
              Discover opportunities. Make informed decisions. Keep your next move organized.
            </p>
          </div>
          {session && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2da] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#f0f5f1] disabled:opacity-50"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-5 rounded-xl border border-[#c9e5ce] bg-[#edf8ef] px-4 py-3 text-sm text-[#245a38]">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-[#617469]">
            <RefreshCw className="animate-spin" size={18} /> Loading your secure workspace…
          </div>
        ) : !session || !workspace ? (
          <div className="grid overflow-hidden rounded-3xl border border-[#dfe8e0] bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-[#173f30] p-8 text-white md:p-12">
              <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c8f36b] text-[#173f30]">
                <Compass size={28} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8f36b]">Your opportunity workspace</p>
              <h2 className="mt-4 max-w-lg text-3xl font-black leading-tight md:text-4xl">
                Turn the right opportunities into your next advantage.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
                Keep relevant advertising opportunities, sources and follow-up work together in one organized workspace.
              </p>
              <div className="mt-10 space-y-4 text-sm text-white/90">
                <div className="flex items-center gap-3"><ShieldCheck className="text-[#c8f36b]" size={18} /> Private workspace access</div>
                <div className="flex items-center gap-3"><Bookmark className="text-[#c8f36b]" size={18} /> Save opportunities for later</div>
                <div className="flex items-center gap-3"><BriefcaseBusiness className="text-[#c8f36b]" size={18} /> Manage your business pipeline</div>
              </div>
            </div>
            <div className="p-7 md:p-12">
              {mode !== "set-password" && <div className="mb-7 flex gap-2 rounded-xl bg-[#f1f5f1] p-1">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "signin" ? "bg-white text-[#173f30] shadow-sm" : "text-[#68786d]"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "signup" ? "bg-white text-[#173f30] shadow-sm" : "text-[#68786d]"}`}
                >
                  Create account
                </button>
              </div>}
              <h3 className="text-2xl font-black">{mode === "signup" ? "Create your workspace" : mode === "reset" ? "Reset your password" : mode === "set-password" ? "Choose a new password" : "Welcome back"}</h3>
              <p className="mt-2 text-sm text-[#718075]">
                {mode === "signup" ? "Start with your email and a secure password." : mode === "reset" ? "We will email you a secure link to choose a new password." : mode === "set-password" ? "Choose a new password for your account." : "Sign in to continue to your Nextdoor Plus workspace."}
              </p>
              <form onSubmit={(event) => void handleAuth(event)} className="mt-7 space-y-4">
                {mode === "signup" && (
                  <label className="block text-sm font-semibold">
                    Your name
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      autoComplete="name"
                      className="mt-2 w-full rounded-xl border border-[#dce5dd] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#4e9466] focus:ring-2 focus:ring-[#4e9466]/15"
                      placeholder="Your name"
                    />
                  </label>
                )}
                <label className="block text-sm font-semibold">
                  Email address
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-[#dce5dd] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#4e9466] focus:ring-2 focus:ring-[#4e9466]/15"
                    placeholder="you@company.com"
                  />
                </label>
                {mode !== "reset" && <label className="block text-sm font-semibold">
                  Password
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="mt-2 w-full rounded-xl border border-[#dce5dd] bg-white px-4 py-3 font-normal outline-none transition focus:border-[#4e9466] focus:ring-2 focus:ring-[#4e9466]/15"
                    placeholder="At least 8 characters"
                  />
                </label>}
                {mode === "signin" && <button type="button" onClick={() => setMode("reset")} className="text-sm font-semibold text-[#286442] hover:underline">Forgot your password?</button>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c5039] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#143d2b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Please wait…" : mode === "signup" ? "Create my account" : mode === "reset" ? "Send reset link" : mode === "set-password" ? "Update password" : "Sign in to Nextdoor Plus"}
                  {!submitting && <ArrowUpRight size={17} />}
                </button>
              </form>
              <p className="mt-5 text-xs leading-6 text-[#7a887e]">
                Your account is protected by Supabase authentication. New accounts may need email confirmation before the first sign-in. You can request a password reset from the sign-in screen.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-7">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Available opportunities", value: opportunities.length, icon: Compass },
                { label: "Saved for review", value: saved.length, icon: Bookmark },
                { label: "Workspace", value: workspace.country, icon: BriefcaseBusiness },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-sm text-[#718075]">
                    {stat.label}<stat.icon size={18} className="text-[#4b8b60]" />
                  </div>
                  <div className="mt-3 text-2xl font-black text-[#173f30]">{stat.value}</div>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">Your workspace</div>
                  <h2 className="mt-1 text-xl font-black">{workspace.name}</h2>
                  <p className="mt-1 text-sm text-[#718075]">Market: {workspace.market}</p>
                </div>
                <div className="rounded-full bg-[#e8f4e8] px-3 py-1.5 text-xs font-bold text-[#286442]">Secure workspace</div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">Explore</div>
                  <h2 className="mt-1 text-2xl font-black">Discover opportunities</h2>
                  <p className="mt-1 text-sm text-[#718075]">Browse published opportunities and save the ones worth pursuing.</p>
                </div>
                <label className="relative block w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9a8e]" size={17} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search opportunities"
                    className="w-full rounded-xl border border-[#dce5dd] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#4e9466]"
                  />
                </label>
              </div>
              {filteredOpportunities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#cbd9cd] bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5ed] text-[#4b8b60]">
                    <Compass size={23} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">
                    {opportunities.length === 0 ? "Your opportunity feed is being prepared" : "No matching opportunities"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718075]">
                    {opportunities.length === 0
                      ? "Your workspace is connected, but there are no published opportunities in the database yet. We will show verified listings here once they are added."
                      : "Try a different keyword or clear your search to see the available listings."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredOpportunities.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#66816e]">
                        {item.channel && <span className="rounded-full bg-[#edf5ed] px-2.5 py-1">{item.channel}</span>}
                        {item.city && <span>{item.city}{item.region ? `, ${item.region}` : ""}</span>}
                      </div>
                      <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#718075]">{item.description}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] pt-4">
                        <div className="text-xs text-[#7a887e]">
                          {item.source_name ? `Source: ${item.source_name}` : "Source details available"}
                          {item.verified_at && <span className="block mt-1">Verified {new Date(item.verified_at).toLocaleDateString()}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#286442] hover:underline">
                            Source <ArrowUpRight size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => void handleSave(item)}
                            disabled={submitting || savedIds.has(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c5039] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#143d2b] disabled:cursor-not-allowed disabled:bg-[#e7eee8] disabled:text-[#56705d]"
                          >
                            {savedIds.has(item.id) ? <><CheckCircle2 size={14} /> Saved</> : <><Bookmark size={14} /> Save</>}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">Your shortlist</div>
                  <h2 className="mt-1 text-xl font-black">Saved opportunities</h2>
                </div>
                <Bookmark className="text-[#4b8b60]" />
              </div>
              {saved.length === 0 ? (
                <p className="text-sm text-[#718075]">You have not saved any opportunities yet. Save a listing above to build your shortlist.</p>
              ) : (
                <div className="divide-y divide-[#edf1ed]">
                  {saved.map((item) => {
                    const history = activity.filter((event) => event.opportunity_id === item.opportunity_id);
                    const latestStatus = history.find((event) => event.event_type === "status_changed")?.new_status;
                    return (
                      <article key={item.id} className="space-y-4 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold">{item.opportunities.title}</h3>
                            <p className="mt-1 text-xs text-[#7a887e]">
                              Saved {new Date(item.created_at).toLocaleDateString()}
                              {latestStatus && ` · ${latestStatus.replace("_", " ")}`}
                            </p>
                          </div>
                          <a href={item.opportunities.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#286442] hover:underline">
                            View source <ArrowUpRight size={13} />
                          </a>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(["interested", "applied", "won", "dismissed"] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => void handlePipelineAction(item.opportunity_id, status)}
                              disabled={submitting}
                              className="rounded-lg border border-[#dce5dd] px-3 py-2 text-xs font-semibold capitalize text-[#365b43] hover:bg-[#edf5ed] disabled:opacity-50"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                          <input
                            value={noteDrafts[item.opportunity_id] ?? ""}
                            onChange={(event) => setNoteDrafts((previous) => ({ ...previous, [item.opportunity_id]: event.target.value }))}
                            placeholder="Add a private note"
                            className="min-w-0 rounded-lg border border-[#dce5dd] px-3 py-2 text-sm outline-none focus:border-[#4e9466]"
                          />
                          <button type="button" onClick={() => void handlePipelineAction(item.opportunity_id, "note")} disabled={submitting} className="rounded-lg bg-[#edf5ed] px-3 py-2 text-xs font-bold text-[#286442] disabled:opacity-50">
                            Add note
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="datetime-local"
                            value={followUpDrafts[item.opportunity_id] ?? ""}
                            onChange={(event) => setFollowUpDrafts((previous) => ({ ...previous, [item.opportunity_id]: event.target.value }))}
                            className="rounded-lg border border-[#dce5dd] px-3 py-2 text-xs outline-none focus:border-[#4e9466]"
                          />
                          <button type="button" onClick={() => void handlePipelineAction(item.opportunity_id, "follow_up")} disabled={submitting} className="rounded-lg bg-[#1c5039] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                            Set follow-up
                          </button>
                        </div>
                        {history.slice(0, 4).length > 0 && (
                          <div className="rounded-xl bg-[#f6f8f5] p-3">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#718075]">Recent activity</p>
                            <ul className="space-y-2">
                              {history.slice(0, 4).map((event) => (
                                <li key={event.id} className="text-xs text-[#617469]">
                                  <span className="font-semibold">{event.event_type.replace("_", " ")}</span>
                                  {event.new_status && ` · ${event.new_status}`}
                                  {event.note && ` · ${event.note}`}
                                  <span className="ml-2 text-[#8a9a8e]">{new Date(event.created_at).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#7a887e]">
          <ShieldCheck size={14} /> NEXTDOOR ADS · Nextdoor Plus · Tanzania
        </div>
      </div>
    </div>
  );
}
