export interface ProfileUpsert {
  id: string;
  display_name?: string;
}

export function buildProfileUpsert(userId: string, displayName: string): ProfileUpsert {
  const normalizedName = displayName.trim();
  return normalizedName
    ? { id: userId, display_name: normalizedName }
    : { id: userId };
}
