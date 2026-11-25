-- Make saving an opportunity and recording its activity one atomic operation.
-- SECURITY INVOKER preserves the caller's grants and row-level security policies.

create or replace function public.save_opportunity_to_workspace(
  p_workspace_id uuid,
  p_opportunity_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_saved_id uuid;
  v_saved_by uuid;
  v_created boolean := false;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Sign in before saving an opportunity.';
  end if;

  if p_workspace_id is null or p_opportunity_id is null then
    raise exception using errcode = '22023', message = 'A workspace and opportunity are required.';
  end if;

  if not (select private.is_workspace_member(p_workspace_id)) then
    raise exception using errcode = '42501', message = 'You do not have access to this workspace.';
  end if;

  if not exists (
    select 1
    from public.opportunities o
    where o.id = p_opportunity_id
      and o.status = 'open'
      and o.published_at is not null
  ) then
    raise exception using errcode = '22023', message = 'This opportunity is not currently available to save.';
  end if;

  -- Serialize retries for the same workspace/opportunity pair. The existing
  -- unique constraint remains the final duplicate-write safeguard.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_workspace_id::text || ':' || p_opportunity_id::text, 0::bigint)
  );

  insert into public.saved_opportunities (
    workspace_id,
    opportunity_id,
    saved_by
  )
  values (
    p_workspace_id,
    p_opportunity_id,
    v_user_id
  )
  on conflict (workspace_id, opportunity_id) do nothing
  returning id into v_saved_id;

  v_created := v_saved_id is not null;

  if v_created then
    insert into public.opportunity_activity (
      workspace_id,
      opportunity_id,
      actor_id,
      event_type
    )
    values (
      p_workspace_id,
      p_opportunity_id,
      v_user_id,
      'saved'
    );
  else
    -- Repair a legacy partial save only when the caller originally saved it.
    select so.saved_by
    into v_saved_by
    from public.saved_opportunities so
    where so.workspace_id = p_workspace_id
      and so.opportunity_id = p_opportunity_id;

    if not found then
      raise exception using errcode = '40001', message = 'The saved opportunity changed during this request. Please retry.';
    end if;

    if v_saved_by = v_user_id and not exists (
      select 1
      from public.opportunity_activity a
      where a.workspace_id = p_workspace_id
        and a.opportunity_id = p_opportunity_id
        and a.event_type = 'saved'
    ) then
      insert into public.opportunity_activity (
        workspace_id,
        opportunity_id,
        actor_id,
        event_type
      )
      values (
        p_workspace_id,
        p_opportunity_id,
        v_user_id,
        'saved'
      );
    end if;
  end if;

  return pg_catalog.jsonb_build_object(
    'saved', true,
    'created', v_created
  );
end;
$function$;

revoke all on function public.save_opportunity_to_workspace(uuid, uuid) from public, anon;
grant execute on function public.save_opportunity_to_workspace(uuid, uuid) to authenticated;

-- Remove unused browser privileges from the two Plus activity tables. RLS
-- remains the row-level boundary; grants are the table-level boundary.
revoke all on table public.saved_opportunities from public, anon, authenticated;
grant select, insert, delete on table public.saved_opportunities to authenticated;

revoke all on table public.opportunity_activity from public, anon, authenticated;
grant select, insert on table public.opportunity_activity to authenticated;

comment on function public.save_opportunity_to_workspace(uuid, uuid) is
  'Atomically saves an open published opportunity and records its activity for the authenticated workspace member.';
