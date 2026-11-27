-- Limit browser/PostgREST table privileges to operations the Plus client and
-- SECURITY INVOKER admin workflows actually require. RLS remains the row-level
-- authorization boundary; service_role grants are deliberately untouched.

revoke all privileges on table
  public.profiles,
  public.workspaces,
  public.workspace_members,
  public.opportunities,
  public.saved_opportunities,
  public.opportunity_activity,
  public.opportunity_submissions
from PUBLIC, anon, authenticated;

revoke all privileges on table private.platform_admins
from PUBLIC, anon, authenticated;

-- Workspace authorization helpers remain callable by authenticated users,
-- while the private schema itself is never available to anonymous clients.
revoke all on schema private from PUBLIC, anon;
grant usage on schema private to authenticated;

-- Profiles: own-row provisioning and profile settings.
grant select, insert, update on table public.profiles to authenticated;

-- Workspaces: member discovery, owner provisioning and owner edits.
grant select, insert, update on table public.workspaces to authenticated;

-- Memberships: self/owner reads, owner-managed joins and removals.
grant select, insert, delete on table public.workspace_members to authenticated;

-- Opportunities: browse published records; only platform admins may insert.
grant select, insert on table public.opportunities to authenticated;

-- Submissions: submit/read own suggestions; only platform admins may review.
grant select, insert, update on table public.opportunity_submissions to authenticated;

-- Shortlist: read, save and remove. No direct updates are required.
grant select, insert, delete on table public.saved_opportunities to authenticated;

-- Activity is append-only from the browser.
grant select, insert on table public.opportunity_activity to authenticated;
