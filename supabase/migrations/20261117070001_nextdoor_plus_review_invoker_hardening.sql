-- Keep the exposed RPC functions SECURITY INVOKER.
-- RLS policies authorize the privileged writes after the private admin check.

drop policy if exists platform_admins_deny_client_access on private.platform_admins;
create policy platform_admins_deny_client_access
on private.platform_admins
for all
to anon, authenticated
using (false)
with check (false);

grant update on table public.opportunity_submissions to authenticated;

drop policy if exists opportunity_submissions_update_admin on public.opportunity_submissions;
create policy opportunity_submissions_update_admin
on public.opportunity_submissions
for update
to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

grant insert on table public.opportunities to authenticated;

drop policy if exists opportunities_insert_admin on public.opportunities;
create policy opportunities_insert_admin
on public.opportunities
for insert
to authenticated
with check ((select private.is_platform_admin()));

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_platform_admin();
$$;

create or replace function public.review_opportunity_submission(
  p_submission_id uuid,
  p_decision text,
  p_review_note text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_submission public.opportunity_submissions%rowtype;
  v_opportunity_id uuid;
  v_slug text;
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then
    raise exception using errcode = '42501', message = 'Platform administrator access is required.';
  end if;

  if p_decision is null or p_decision not in ('approved', 'rejected') then
    raise exception using errcode = '22023', message = 'Decision must be approved or rejected.';
  end if;

  if p_review_note is not null and char_length(p_review_note) > 2000 then
    raise exception using errcode = '22023', message = 'Review note must be 2,000 characters or fewer.';
  end if;

  select * into v_submission
  from public.opportunity_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Opportunity submission was not found.';
  end if;

  if v_submission.status <> 'pending' then
    raise exception using errcode = '22023', message = 'Only pending submissions can be reviewed.';
  end if;

  if p_decision = 'approved' then
    if v_submission.deadline is not null and v_submission.deadline <= now() then
      raise exception using errcode = '22023', message = 'Expired opportunities cannot be published.';
    end if;

    if char_length(btrim(v_submission.source_evidence)) < 20 then
      raise exception using errcode = '22023', message = 'Source evidence is required before publication.';
    end if;

    if exists (
      select 1 from public.opportunities o
      where lower(btrim(o.source_url)) = lower(btrim(v_submission.source_url))
    ) then
      raise exception using errcode = '23505', message = 'An opportunity from this source URL is already published.';
    end if;

    v_slug :=
      coalesce(
        nullif(trim(both '-' from regexp_replace(lower(v_submission.title), '[^a-z0-9]+', '-', 'g')), ''),
        'opportunity'
      )
      || '-'
      || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

    insert into public.opportunities (
      title, slug, description, country, region, city, channel, opportunity_type,
      eligibility, deadline, source_url, source_name, source_evidence,
      verified_at, published_at, status
    )
    values (
      v_submission.title, v_slug, v_submission.description, v_submission.country,
      v_submission.region, v_submission.city, v_submission.channel,
      v_submission.opportunity_type, v_submission.eligibility, v_submission.deadline,
      v_submission.source_url, v_submission.source_name, v_submission.source_evidence,
      now(), now(), 'open'
    )
    returning id into v_opportunity_id;
  end if;

  update public.opportunity_submissions
  set status = p_decision,
      review_note = nullif(btrim(p_review_note), ''),
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      published_opportunity_id = v_opportunity_id,
      updated_at = now()
  where id = p_submission_id;

  return jsonb_build_object(
    'submission_id', p_submission_id,
    'status', p_decision,
    'opportunity_id', v_opportunity_id
  );
end;
$$;

revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

revoke all on function public.review_opportunity_submission(uuid, text, text) from public, anon;
grant execute on function public.review_opportunity_submission(uuid, text, text) to authenticated;
