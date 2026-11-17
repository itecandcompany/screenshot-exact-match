import { describe, expect, it, vi } from "vitest";
import {
  ensureFreshSession,
  isSessionExpiring,
  type RefreshableSession,
  type SessionRefreshDependencies,
} from "@/lib/supabase/session-refresh";

interface TestSession extends RefreshableSession {}

function makeSession(
  userId: string,
  expiresAt: number,
  accessToken = "access-old",
  refreshToken = "refresh-old",
): TestSession {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    user: { id: userId },
  };
}

function makeDependencies(
  initial: TestSession,
  refresh: (token: string) => Promise<TestSession>,
) {
  const state: { current: TestSession | null } = { current: initial };
  const dependencies: SessionRefreshDependencies<TestSession> = {
    read: () => state.current,
    store: (session) => {
      state.current = session;
    },
    refresh,
  };
  return { state, dependencies };
}

describe("Nextdoor Plus session refresh", () => {
  it("uses the 45-second expiry buffer", () => {
    expect(isSessionExpiring(1045, 1000)).toBe(true);
    expect(isSessionExpiring(1046, 1000)).toBe(false);
    expect(isSessionExpiring(Number.NaN, 1000)).toBe(true);
  });

  it("does not refresh a session that is still valid beyond the buffer", async () => {
    const session = makeSession("member-1", 1200);
    const refresh = vi.fn(async () => makeSession("member-1", 2400, "access-new", "refresh-new"));
    const { dependencies } = makeDependencies(session, refresh);

    await expect(ensureFreshSession(session, dependencies, 1000)).resolves.toBe(session);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes an expiring session and persists the rotated tokens", async () => {
    const session = makeSession("member-1", 1000);
    const refreshed = makeSession("member-1", 2400, "access-new", "refresh-new");
    const refresh = vi.fn(async () => refreshed);
    const { state, dependencies } = makeDependencies(session, refresh);

    await expect(ensureFreshSession(session, dependencies, 1000)).resolves.toBe(refreshed);
    expect(refresh).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledWith("refresh-old");
    expect(state.current).toBe(refreshed);
  });

  it("shares one refresh across concurrent requests for the same account", async () => {
    const session = makeSession("member-1", 1000);
    const refreshed = makeSession("member-1", 2400, "access-new", "refresh-new");
    let resolveRefresh: (value: TestSession) => void = () => undefined;
    const refresh = vi.fn(
      () =>
        new Promise<TestSession>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const { state, dependencies } = makeDependencies(session, refresh);

    const first = ensureFreshSession(session, dependencies, 1000);
    const second = ensureFreshSession(session, dependencies, 1000);
    expect(refresh).toHaveBeenCalledOnce();

    resolveRefresh(refreshed);
    await expect(Promise.all([first, second])).resolves.toEqual([refreshed, refreshed]);
    expect(state.current).toBe(refreshed);
  });

  it("refuses to refresh when the stored session belongs to another account", async () => {
    const session = makeSession("member-1", 1000);
    const otherAccount = makeSession("member-2", 1000);
    const refresh = vi.fn(async () => makeSession("member-1", 2400));
    const { dependencies } = makeDependencies(otherAccount, refresh);

    await expect(ensureFreshSession(session, dependencies, 1000)).rejects.toThrow(
      "Your session changed before it could be refreshed",
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});
