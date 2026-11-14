const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const storageKey = "nextdoor-plus.auth.session";

export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

export interface Workspace {
  id: string;
  name: string;
  country: string;
  market: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  country: string;
  region: string | null;
  city: string | null;
  channel: string | null;
  opportunity_type: string | null;
  eligibility: string | null;
  deadline: string | null;
  source_url: string;
  source_name: string | null;
  verified_at: string | null;
}

export interface OpportunityActivity {
  id: string;
  opportunity_id: string;
  event_type: string;
  note: string | null;
  new_status: string | null;
  created_at: string;
}

export interface SavedOpportunity {
  id: string;
  opportunity_id: string;
  created_at: string;
  opportunities: Opportunity;
}

function assertConfigured() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Nextdoor Plus is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the app environment.",
    );
  }
}

function storeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(storageKey, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(storageKey);
  }
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(storageKey);
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    storeSession(null);
    return null;
  }
}

function normaliseSession(value: Record<string, unknown>): AuthSession | null {
  if (
    typeof value.access_token !== "string" ||
    typeof value.refresh_token !== "string" ||
    !value.user ||
    typeof value.user !== "object"
  ) {
    return null;
  }
  const user = value.user as Record<string, unknown>;
  if (typeof user.id !== "string") return null;
  const expiresIn = typeof value.expires_in === "number" ? value.expires_in : 3600;
  return {
    access_token: value.access_token,
    refresh_token: value.refresh_token,
    expires_at:
      typeof value.expires_at === "number" ? value.expires_at : Math.floor(Date.now() / 1000) + expiresIn,
    user: { id: user.id, email: typeof user.email === "string" ? user.email : undefined },
  };
}

async function authRequest(path: string, body: Record<string, unknown>) {
  assertConfigured();
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseKey as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      typeof payload.msg === "string"
        ? payload.msg
        : typeof payload.message === "string"
          ? payload.message
          : "Authentication failed. Please try again.",
    );
  }
  return payload;
}

export async function signIn(email: string, password: string) {
  const payload = await authRequest("token?grant_type=password", { email, password });
  const session = normaliseSession(payload);
  if (!session) throw new Error("Sign-in succeeded without a usable session. Please try again.");
  storeSession(session);
  return session;
}

export async function signUp(email: string, password: string) {
  const payload = await authRequest("signup", { email, password });
  const nested = payload.session;
  const session = normaliseSession(
    nested && typeof nested === "object" ? (nested as Record<string, unknown>) : payload,
  );
  if (session) storeSession(session);
  return session;
}

export async function sendPasswordReset(email: string) {
  const redirectTo =
    typeof window === "undefined" ? "" : "?redirect_to=" + encodeURIComponent(window.location.origin + "/plus");
  await authRequest("recover" + redirectTo, { email });
}

export async function signOut() {
  const session = await getSession();
  if (session) {
    try {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: supabaseKey as string,
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } finally {
      storeSession(null);
    }
  } else {
    storeSession(null);
  }
}

export async function getSession(): Promise<AuthSession | null> {
  assertConfigured();
  const session = readSession();
  if (!session) return null;
  if (session.expires_at > Math.floor(Date.now() / 1000) + 45) return session;

  try {
    const payload = await authRequest("token?grant_type=refresh_token", {
      refresh_token: session.refresh_token,
    });
    const refreshed = normaliseSession(payload);
    if (!refreshed) throw new Error("Session refresh returned an invalid response.");
    storeSession(refreshed);
    return refreshed;
  } catch {
    storeSession(null);
    return null;
  }
}

async function restRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; token: string; prefer?: string },
): Promise<T> {
  assertConfigured();
  const headers: Record<string, string> = {
    apikey: supabaseKey as string,
    Authorization: `Bearer ${options.token}`,
    "Content-Type": "application/json",
  };
  if (options.prefer) headers.Prefer = options.prefer;
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : typeof payload.details === "string"
          ? payload.details
          : "The workspace request failed. Please try again.",
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function loadWorkspace(session: AuthSession, displayName = ""): Promise<Workspace> {
  const token = session.access_token;
  await restRequest("profiles?on_conflict=id", {
    method: "POST",
    token,
    prefer: "resolution=merge-duplicates,return=minimal",
    body: {
      id: session.user.id,
      display_name: displayName || session.user.email?.split("@")[0] || "Member",
    },
  });

  const [owned, memberships] = await Promise.all([
    restRequest<Workspace[]>(
      `workspaces?owner_id=eq.${session.user.id}&select=id,name,country,market&order=created_at.asc`,
      { token },
    ),
    restRequest<Array<{ workspace_id: string }>>(
      `workspace_members?user_id=eq.${session.user.id}&select=workspace_id`,
      { token },
    ),
  ]);

  let workspace = owned[0];
  if (!workspace && memberships[0]) {
    const joined = await restRequest<Workspace[]>(
      `workspaces?id=eq.${memberships[0].workspace_id}&select=id,name,country,market`,
      { token },
    );
    workspace = joined[0];
  }

  if (!workspace) {
    const created = await restRequest<Workspace[]>("workspaces", {
      method: "POST",
      token,
      prefer: "return=representation",
      body: {
        owner_id: session.user.id,
        name: `${displayName || session.user.email?.split("@")[0] || "My"} workspace`,
        country: "Tanzania",
        market: "Tanzania",
      },
    });
    workspace = created[0];
    if (!workspace) throw new Error("Your workspace could not be created. Please try again.");
  }

  if (!memberships.some((membership) => membership.workspace_id === workspace?.id)) {
    await restRequest("workspace_members", {
      method: "POST",
      token,
      prefer: "resolution=ignore-duplicates,return=minimal",
      body: { workspace_id: workspace.id, user_id: session.user.id, role: "owner" },
    });
  }

  return workspace;
}

export async function listOpportunities(session: AuthSession) {
  return restRequest<Opportunity[]>(
    "opportunities?status=eq.open&published_at=not.is.null&select=id,title,description,country,region,city,channel,opportunity_type,eligibility,deadline,source_url,source_name,verified_at&order=verified_at.desc.nullslast&limit=50",
    { token: session.access_token },
  );
}

export async function listSavedOpportunities(session: AuthSession, workspaceId: string) {
  return restRequest<SavedOpportunity[]>(
    `saved_opportunities?workspace_id=eq.${workspaceId}&select=id,opportunity_id,created_at,opportunities(id,title,description,country,region,city,channel,opportunity_type,eligibility,deadline,source_url,source_name,verified_at)&order=created_at.desc`,
    { token: session.access_token },
  );
}

export async function listOpportunityActivity(session: AuthSession, workspaceId: string) {
  return restRequest<OpportunityActivity[]>(
    `opportunity_activity?workspace_id=eq.${workspaceId}&select=id,opportunity_id,event_type,note,new_status,created_at&order=created_at.desc&limit=200`,
    { token: session.access_token },
  );
}

export async function saveOpportunity(
  session: AuthSession,
  workspaceId: string,
  opportunityId: string,
) {
  const existing = await restRequest<Array<{ id: string }>>(
    `saved_opportunities?workspace_id=eq.${workspaceId}&opportunity_id=eq.${opportunityId}&select=id&limit=1`,
    { token: session.access_token },
  );
  if (existing.length) return;
  await restRequest("saved_opportunities", {
    method: "POST",
    token: session.access_token,
    prefer: "return=minimal",
    body: {
      workspace_id: workspaceId,
      opportunity_id: opportunityId,
      saved_by: session.user.id,
    },
  });
  await restRequest("opportunity_activity", {
    method: "POST",
    token: session.access_token,
    prefer: "return=minimal",
    body: {
      workspace_id: workspaceId,
      opportunity_id: opportunityId,
      actor_id: session.user.id,
      event_type: "saved",
    },
  });
}

export async function updateOpportunityStatus(
  session: AuthSession,
  workspaceId: string,
  opportunityId: string,
  status: "interested" | "applied" | "won" | "dismissed",
) {
  const saved = await restRequest<Array<{ id: string }>>(
    `saved_opportunities?workspace_id=eq.${workspaceId}&opportunity_id=eq.${opportunityId}&select=id&limit=1`,
    { token: session.access_token },
  );
  if (!saved[0]) throw new Error("Save this opportunity to your workspace before changing its status.");
  await restRequest("opportunity_activity", {
    method: "POST",
    token: session.access_token,
    prefer: "return=minimal",
    body: {
      workspace_id: workspaceId,
      opportunity_id: opportunityId,
      actor_id: session.user.id,
      event_type: "status_changed",
      new_status: status,
    },
  });
}

export async function addOpportunityNote(
  session: AuthSession,
  workspaceId: string,
  opportunityId: string,
  note: string,
) {
  const saved = await restRequest<Array<{ id: string }>>(
    `saved_opportunities?workspace_id=eq.${workspaceId}&opportunity_id=eq.${opportunityId}&select=id&limit=1`,
    { token: session.access_token },
  );
  if (!saved[0]) throw new Error("Save this opportunity to your workspace before adding a note.");
  await restRequest("opportunity_activity", {
    method: "POST",
    token: session.access_token,
    prefer: "return=minimal",
    body: {
      workspace_id: workspaceId,
      opportunity_id: opportunityId,
      actor_id: session.user.id,
      event_type: "note_added",
      note: note.trim(),
    },
  });
}

export async function setOpportunityFollowUp(
  session: AuthSession,
  workspaceId: string,
  opportunityId: string,
  followUpAt: string,
) {
  const saved = await restRequest<Array<{ id: string }>>(
    `saved_opportunities?workspace_id=eq.${workspaceId}&opportunity_id=eq.${opportunityId}&select=id&limit=1`,
    { token: session.access_token },
  );
  if (!saved[0]) throw new Error("Save this opportunity to your workspace before setting a follow-up.");
  await restRequest("opportunity_activity", {
    method: "POST",
    token: session.access_token,
    prefer: "return=minimal",
    body: {
      workspace_id: workspaceId,
      opportunity_id: opportunityId,
      actor_id: session.user.id,
      event_type: "follow_up_set",
      note: followUpAt,
    },
  });
}
