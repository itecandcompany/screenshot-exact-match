export interface WorkspaceProfileDraft {
  displayName: string;
  businessName: string;
  phone: string;
}

export interface WorkspaceProfileUpdate {
  display_name: string;
  business_name: string | null;
  phone: string | null;
}

export function normalizeWorkspaceProfileDraft(
  draft: WorkspaceProfileDraft,
): WorkspaceProfileUpdate {
  const displayName = draft.displayName.trim().replace(/\s+/g, " ");
  const businessName = draft.businessName.trim().replace(/\s+/g, " ");
  const phone = draft.phone.trim();

  if (displayName.length < 2 || displayName.length > 80) {
    throw new Error("Your name must be between 2 and 80 characters.");
  }

  if (businessName.length > 120) {
    throw new Error("Your business name must be 120 characters or fewer.");
  }

  if (phone.length > 32) {
    throw new Error("Your phone number must be 32 characters or fewer.");
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (!/^\+?[0-9][0-9\s().-]*$/.test(phone) || digits.length < 7 || digits.length > 15) {
      throw new Error("Enter a valid phone number with 7 to 15 digits.");
    }
  }

  return {
    display_name: displayName,
    business_name: businessName || null,
    phone: phone || null,
  };
}
