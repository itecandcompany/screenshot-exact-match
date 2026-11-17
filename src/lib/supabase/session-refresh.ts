export interface RefreshableSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string };
}

export interface SessionRefreshDependencies<T extends RefreshableSession> {
  read: () => T | null;
  store: (session: T) => void;
  refresh: (refreshToken: string) => Promise<T>;
}

const inFlightRefreshes = new Map<string, Promise<RefreshableSession>>();

export function isSessionExpiring(
  expiresAt: number,
  nowSeconds = Math.floor(Date.now() / 1000),
  skewSeconds = 45,
): boolean {
  return !Number.isFinite(expiresAt) || expiresAt <= nowSeconds + skewSeconds;
}

export async function ensureFreshSession<T extends RefreshableSession>(
  session: T,
  dependencies: SessionRefreshDependencies<T>,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<T> {
  if (!isSessionExpiring(session.expires_at, nowSeconds)) return session;

  const current = dependencies.read();
  if (!current || current.user.id !== session.user.id) {
    throw new Error("Your session changed before it could be refreshed. Please sign in again.");
  }
  if (!isSessionExpiring(current.expires_at, nowSeconds)) return current;

  const userId = current.user.id;
  const pending = inFlightRefreshes.get(userId);
  if (pending) return pending as Promise<T>;

  const refreshPromise = dependencies.refresh(current.refresh_token).then((refreshed) => {
    if (refreshed.user.id !== userId) {
      throw new Error("Session refresh returned a different account.");
    }
    dependencies.store(refreshed);
    return refreshed;
  });

  inFlightRefreshes.set(userId, refreshPromise);
  try {
    return await refreshPromise;
  } finally {
    if (inFlightRefreshes.get(userId) === refreshPromise) {
      inFlightRefreshes.delete(userId);
    }
  }
}
