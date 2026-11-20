import { useEffect, useState, type FormEvent } from "react";
import { Building2, LoaderCircle, Save, UserRound } from "lucide-react";
import {
  getWorkspaceProfile,
  updateWorkspaceProfile,
  type AuthSession,
} from "@/lib/supabase/client";
import type { WorkspaceProfileDraft } from "@/lib/workspace-profile-settings";

interface PlusWorkspaceProfileProps {
  session: AuthSession;
}

const emptyDraft: WorkspaceProfileDraft = {
  displayName: "",
  businessName: "",
  phone: "",
};

export function PlusWorkspaceProfile({ session }: PlusWorkspaceProfileProps) {
  const [draft, setDraft] = useState<WorkspaceProfileDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void getWorkspaceProfile(session)
      .then((profile) => {
        if (!active) return;
        setDraft({
          displayName: profile.display_name ?? "",
          businessName: profile.business_name ?? "",
          phone: profile.phone ?? "",
        });
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Your profile could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session.user.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      const profile = await updateWorkspaceProfile(session, draft);
      setDraft({
        displayName: profile.display_name ?? "",
        businessName: profile.business_name ?? "",
        phone: profile.phone ?? "",
      });
      setNotice("Your business profile has been updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof WorkspaceProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="rounded-2xl border border-[#dfe8e0] bg-white p-5 shadow-sm md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8c73]">
            Account settings
          </div>
          <h2 className="mt-1 text-xl font-black">Business profile</h2>
          <p className="mt-1 text-sm text-[#718075]">
            Keep your workspace contact details current.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ed] text-[#286442]">
          <Building2 size={19} />
        </div>
      </div>

      {session.user.email && (
        <p className="mb-4 text-xs text-[#7a887e]">
          Signed in as <span className="font-semibold text-[#365b43]">{session.user.email}</span>
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 rounded-lg border border-[#c9e5ce] bg-[#edf8ef] px-3 py-2 text-sm text-[#245a38]">
          {notice}
        </p>
      )}

      {loading ? (
        <div role="status" className="flex items-center gap-2 py-4 text-sm text-[#718075]">
          <LoaderCircle size={16} className="animate-spin" />
          Loading profile…
        </div>
      ) : (
        <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-[#365b43]">
            Your name
            <span className="relative mt-2 block">
              <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9a8e]" />
              <input
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={draft.displayName}
                onChange={(event) => updateField("displayName", event.target.value)}
                className="w-full rounded-xl border border-[#dce5dd] bg-white py-3 pl-9 pr-3 font-normal outline-none transition focus:border-[#4e9466] focus:ring-2 focus:ring-[#4e9466]/15"
                placeholder="Your full name"
              />
            </span>
          </label>

          <label className="block text-sm font-semibold text-[#365b43]">
            Business name <span className="font-normal text-[#8a9a8e]">(optional)</span>
            <input
              maxLength={120}
              autoComplete="organization"
              value={draft.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dce5dd] bg-white px-3 py-3 font-normal outline-none transition focus:border-[#4e9466] focus:ring-2 focus:ring-[#4e9466]/15"
              placeholder="Your company or brand"
            />
          </label>

          <label className="block text-sm font-semibold text-[#365b43] md:col-span-2">
            Contact phone <span className="font-normal text-[#8a9a8e]">(optional)</span>
            <input
              type="tel"
              maxLength={32}
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dce5dd] bg-white px-3 py-3 font-normal outline-none transition focus:border-[#4e9466] focus:ring-2 focus:ring-[#4e9466]/15"
              placeholder="+255 7XX XXX XXX"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
            <p className="text-xs text-[#8a9a8e]">
              Only you can view and update this profile.
            </p>
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c5039] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#143d2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
