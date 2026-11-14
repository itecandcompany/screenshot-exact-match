-- RLS policy hardening for the existing Nextdoor Plus core schema.
-- SECURITY DEFINER helpers live outside the exposed public API schema to avoid
-- recursive policy evaluation between workspaces and workspace_members.

create schema if not exists private;

create or replace function private.is_workspace_member(_workspace_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = _workspace_id
      and wm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_workspace_owner(_workspace_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = _workspace_id
      and w.owner_id = (select auth.uid())
  );
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.is_workspace_owner(uuid) from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.is_workspace_owner(uuid) to authenticated;

drop policy if exists "Authenticated users can browse published opportunities" on public.opportunities;
drop policy if exists "Workspace members can add opportunity activity" on public.opportunity_activity;
drop policy if exists "Workspace members can read opportunity activity" on public.opportunity_activity;
drop policy if exists "Profiles are readable by their owner" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Workspace members can read saved opportunities" on public.saved_opportunities;
drop policy if exists "Workspace members can remove saved opportunities" on public.saved_opportunities;
drop policy if exists "Workspace members can save opportunities" on public.saved_opportunities;
drop policy if exists "Workspace members can read memberships" on public.workspace_members;
drop policy if exists "Workspace owners can add members" on public.workspace_members;
drop policy if exists "Workspace owners can remove members" on public.workspace_members;
drop policy if exists "Users can create owned workspaces" on public.workspaces;
drop policy if exists "Workspace members can read their workspaces" on public.workspaces;

drop policy if exists workspaces_select_member on public.workspaces;
drop policy if exists workspace_members_select_self_or_owner on public.workspace_members;
drop policy if exists workspace_members_insert_self_or_owner on public.workspace_members;
drop policy if exists workspace_members_delete_self_or_owner on public.workspace_members;
drop policy if exists saved_opportunities_select_member on public.saved_opportunities;
drop policy if exists saved_opportunities_insert_member on public.saved_opportunities;
drop policy if exists saved_opportunities_delete_member on public.saved_opportunities;
drop policy if exists opportunity_activity_select_member on public.opportunity_activity;
drop policy if exists opportunity_activity_insert_member on public.opportunity_activity;

create policy workspaces_select_member on public.workspaces
for select to authenticated
using (owner_id = (select auth.uid()) or (select private.is_workspace_member(id)));

create policy workspace_members_select_self_or_owner on public.workspace_members
for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_workspace_owner(workspace_id)));

create policy workspace_members_insert_self_or_owner on public.workspace_members
for insert to authenticated
with check (user_id = (select auth.uid()) and (select private.is_workspace_owner(workspace_id)));

create policy workspace_members_delete_self_or_owner on public.workspace_members
for delete to authenticated
using (user_id = (select auth.uid()) or (select private.is_workspace_owner(workspace_id)));

create policy saved_opportunities_select_member on public.saved_opportunities
for select to authenticated
using ((select private.is_workspace_member(workspace_id)));

create policy saved_opportunities_insert_member on public.saved_opportunities
for insert to authenticated
with check (
  saved_by = (select auth.uid())
  and (select private.is_workspace_member(workspace_id))
  and exists (
    select 1 from public.opportunities o
    where o.id = saved_opportunities.opportunity_id
      and o.status = 'open'
      and o.published_at is not null
  )
);

create policy saved_opportunities_delete_member on public.saved_opportunities
for delete to authenticated
using (
  saved_by = (select auth.uid())
  and (select private.is_workspace_member(workspace_id))
);

create policy opportunity_activity_select_member on public.opportunity_activity
for select to authenticated
using ((select private.is_workspace_member(workspace_id)));

create policy opportunity_activity_insert_member on public.opportunity_activity
for insert to authenticated
with check (
  actor_id = (select auth.uid())
  and (select private.is_workspace_member(workspace_id))
);
