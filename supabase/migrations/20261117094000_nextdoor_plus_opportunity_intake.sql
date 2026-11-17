-- Source-backed opportunity intake and controlled publication.
-- Members can suggest listings; only manually provisioned platform admins can publish them.

create schema if not exists private;

create table if not exists private.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table private.platform_admins enable row level security;
revoke all on table private.platform_admins from public, anon, authenticated;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.platform_admins pa
    where pa.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_platform_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin() to authenticated;

create table if not exists public.opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 5 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  country text not null default 'Tanzania' check (char_length(btrim(country)) between 2 and 80),
  region text check (region is null or char_length(region) <= 120),
  city text check (city is null or char_length(city) <= 120),
  channel text check (channel is null or char_length(channel) <= 120),
  opportunity_type text check (opportunity_type is null or char_length(opportunity_type) <= 120),
  eligibility text check (eligibility is null or char_length(eligibility) <= 1000),
  deadline timestamptz,
  source_url text not null check (char_length(source_url) <= 2048 and source_url ~* '^https?://[^[:space:]/?#@]+([/?#][^[:space:]@]*)?),
  source_name text check (source_name is null or char_length(source_name) <= 160),
  source_evidence text not null check (char_length(btrim(source_evidence)) between 20 and 4000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 2000),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  published_opportunity_id uuid references public.opportunities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_submissions_review_state_check check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null and published_opportunity_id is null)
    or
    (status = 'approved' and reviewed_by is not null and reviewed_at is not null and published_opportunity_id is not null)
    or
    (status = 'rejected' and reviewed_by is not null and reviewed_at is not null and published_opportunity_id is null)
  )
);

create index if not exists opportunity_submissions_status_created_idx
  on public.opportunity_submissions (status, created_at desc);
create index if not exists opportunity_submissions_submitter_created_idx
  on public.opportunity_submissions (submitted_by, created_at desc);
create unique index if not exists opportunity_submissions_published_unique_idx
  on public.opportunity_submissions (published_opportunity_id)
  where published_opportunity_id is not null;

alter table public.opportunity_submissions enable row level security;

drop policy if exists opportunity_submissions_select_own_or_admin on public.opportunity_submissions;
create policy opportunity_submissions_select_own_or_admin
on public.opportunity_submissions
for select to authenticated
using (submitted_by = (select auth.uid()) or (select private.is_platform_admin()));

drop policy if exists opportunity_submissions_insert_own_pending on public.opportunity_submissions;
create policy opportunity_submissions_insert_own_pending
on public.opportunity_submissions
for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and published_opportunity_id is null
);

revoke all on table public.opportunity_submissions from public, anon, authenticated;
grant select, insert on table public.opportunity_submissions to authenticated;

-- The customer-facing feed is read-only. Publication happens only inside the
-- SECURITY DEFINER review function below, never through browser table writes.
revoke all on table public.opportunities from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.opportunities from anon, authenticated;
grant select on table public.opportunities to authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_platform_admin();
$$;

revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.review_opportunity_submission(
  p_submission_id uuid,
  p_decision text,
  p_review_note text default null
)
returns jsonb
language plpgsql
security definer
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

revoke all on function public.review_opportunity_submission(uuid, text, text) from public, anon;
grant execute on function public.review_opportunity_submission(uuid, text, text) to authenticated;

comment on table public.opportunity_submissions is
  'Member-submitted opportunity candidates. Rows remain private until reviewed by a platform administrator.';
comment on table private.platform_admins is
  'Manual platform administrator allowlist. Manage only through the Supabase SQL editor or trusted server-side administration.';
),
  source_name text check (source_name is null or char_length(source_name) <= 160),
  source_evidence text not null check (char_length(btrim(source_evidence)) between 20 and 4000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 2000),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  published_opportunity_id uuid references public.opportunities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_submissions_review_state_check check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null and published_opportunity_id is null)
    or
    (status = 'approved' and reviewed_by is not null and reviewed_at is not null and published_opportunity_id is not null)
    or
    (status = 'rejected' and reviewed_by is not null and reviewed_at is not null and published_opportunity_id is null)
  )
);

create index if not exists opportunity_submissions_status_created_idx
  on public.opportunity_submissions (status, created_at desc);
create index if not exists opportunity_submissions_submitter_created_idx
  on public.opportunity_submissions (submitted_by, created_at desc);
create unique index if not exists opportunity_submissions_published_unique_idx
  on public.opportunity_submissions (published_opportunity_id)
  where published_opportunity_id is not null;

alter table public.opportunity_submissions enable row level security;

drop policy if exists opportunity_submissions_select_own_or_admin on public.opportunity_submissions;
create policy opportunity_submissions_select_own_or_admin
on public.opportunity_submissions
for select to authenticated
using (submitted_by = (select auth.uid()) or (select private.is_platform_admin()));

drop policy if exists opportunity_submissions_insert_own_pending on public.opportunity_submissions;
create policy opportunity_submissions_insert_own_pending
on public.opportunity_submissions
for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and published_opportunity_id is null
);

revoke all on table public.opportunity_submissions from public, anon, authenticated;
grant select, insert on table public.opportunity_submissions to authenticated;

-- The customer-facing feed is read-only. Publication happens only inside the
-- SECURITY DEFINER review function below, never through browser table writes.
revoke all on table public.opportunities from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.opportunities from anon, authenticated;
grant select on table public.opportunities to authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_platform_admin();
$$;

revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.review_opportunity_submission(
  p_submission_id uuid,
  p_decision text,
  p_review_note text default null
)
returns jsonb
language plpgsql
security definer
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

  if p_decision not in ('approved', 'rejected') then
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

revoke all on function public.review_opportunity_submission(uuid, text, text) from public, anon;
grant execute on function public.review_opportunity_submission(uuid, text, text) to authenticated;

comment on table public.opportunity_submissions is
  'Member-submitted opportunity candidates. Rows remain private until reviewed by a platform administrator.';
comment on table private.platform_admins is
  'Manual platform administrator allowlist. Manage only through the Supabase SQL editor or trusted server-side administration.';
