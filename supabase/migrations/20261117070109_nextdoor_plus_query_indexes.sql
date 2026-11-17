-- Add covering indexes for active foreign-key lookups and remove a duplicate workspace update policy.

create index if not exists workspaces_owner_id_idx
  on public.workspaces (owner_id);

create index if not exists saved_opportunities_opportunity_id_idx
  on public.saved_opportunities (opportunity_id);

create index if not exists saved_opportunities_saved_by_idx
  on public.saved_opportunities (saved_by);

create index if not exists opportunity_activity_opportunity_id_idx
  on public.opportunity_activity (opportunity_id);

create index if not exists opportunity_activity_actor_id_idx
  on public.opportunity_activity (actor_id);

create index if not exists opportunity_submissions_reviewed_by_idx
  on public.opportunity_submissions (reviewed_by);

drop policy if exists "Workspace owners can update workspaces" on public.workspaces;
