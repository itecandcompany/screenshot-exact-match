# Nextdoor Plus — product architecture

## Purpose

Nextdoor Plus is the authenticated customer workspace for NEXTDOOR ADS. The existing public website remains the marketing and lead-generation site; Plus is where customers discover, evaluate, save and manage advertising opportunities.

Initial market: Tanzania, with an East Africa expansion path. Preserve the existing forest-green and lime-green brand direction.

## Repository strategy

Development lives on `feature/nextdoor-plus`. The `main` branch remains the production public site until the draft pull request is reviewed and approved. The Plus implementation is isolated in `/plus` and `src/lib/supabase`.

## Customer journeys

1. A visitor opens Nextdoor Plus from the public NEXTDOOR ADS navigation.
2. They create an account, sign in, or request a password reset.
3. The first authenticated visit creates a profile and Tanzania workspace.
4. The dashboard displays published, open opportunities with source attribution and verification dates.
5. A customer saves an opportunity, tracks its status, adds private notes and records follow-up dates.
6. Workspace members return to review their shortlist and activity history.

## Existing Supabase schema

The existing Supabase project is `nextdoor-ads` (`tptxzsynpiiewxmketob`). It contains six original core tables plus the opportunity intake table:

- `profiles`: authenticated user profile.
- `workspaces`: customer workspaces.
- `workspace_members`: membership and role records.
- `opportunities`: source-backed public listings.
- `saved_opportunities`: workspace shortlist.
- `opportunity_activity`: status changes, notes and follow-up events.
- `opportunity_submissions`: private member suggestions awaiting source review.

The original schema and access policies pre-date this feature branch. The fourth original migration is present as `supabase/migrations/20261114231147_nextdoor_plus_rls_policy_hardening.sql`; the first three original migration SQL files are still missing from this branch even though Supabase records them as applied. The new intake, invoker-hardening and index migrations are now named to match the versions recorded in Supabase.

## Current implementation

- `/plus` route linked from desktop, mobile and footer navigation.
- Email/password sign-up and sign-in.
- Email-confirmation-aware sign-up response.
- Password reset request, recovery-token consumption and password update.
- Browser session persistence, expiry-aware access-token refresh before authenticated REST requests, per-account refresh de-duplication, and sign-out.
- First-login profile and Tanzania workspace provisioning; returning sign-ins no longer overwrite a saved display name with the email prefix.
- Self-service business profile settings for display name, business name and contact phone. Reads and updates are scoped to the signed-in user and protected by the existing `profiles` row-level security policies.
- Published/open opportunity feed with search, channel/region/type filters, deadline-aware views and source links. The default view excludes expired or invalid deadlines; members can switch to closing-soon (7 days), undated, expired or all listings. Date-only deadlines remain valid through 23:59 Africa/Dar_es_Salaam time. Expired/invalid listings cannot be saved. Every source URL is revalidated as an absolute HTTP(S) URL before rendering; credential-bearing and non-web protocols are never exposed as clickable links.
- Accessible inline opportunity detail disclosures expand the full description and show location, opportunity type, eligibility, deadline and verification timestamp. Date/time values are formatted in Africa/Dar_es_Salaam time.
- Shareable `/plus/opportunities/:opportunityId` detail pages load only after a valid authenticated session and retrieve only open, published records. The feed and saved shortlist link to the same detail page; source links are revalidated before rendering.
- The detail page uses TanStack Router's non-nested `plus_` file-route convention, so it renders independently instead of being incorrectly wrapped by the existing `/plus` leaf page.
- Save-to-workspace prefers a SECURITY INVOKER RPC that atomically inserts the shortlist row and matching activity event. A transaction-scoped advisory lock and the existing unique `(workspace_id, opportunity_id)` constraint make retries/concurrent saves idempotent; a legacy save by the same actor can repair a missing `saved` event. Until the migration is applied, the client detects only the specific missing-function response and falls back to a conflict-safe PostgREST upsert plus activity repair, keeping the current preview compatible. Authorization, validation and network errors are never downgraded to the fallback.
- Private pipeline status events: interested, applied, won and dismissed.
- Private notes and follow-up-date events.
- Workspace pipeline overview derived from existing saved-opportunity and activity records: current status counts, the latest scheduled follow-up per saved opportunity (including overdue reminders), and the six most recent events. No additional schema or client-side cross-workspace query is required. Saved-opportunity dates and per-opportunity activity history use the shared `Africa/Dar_es_Salaam` formatter, so they do not shift when a member's browser is set to another timezone.
- Truthful empty state when no published opportunities are available.
- Member-submitted opportunity intake with required original source URLs and evidence; submissions remain private while pending. Date-only deadlines are stored as 23:59:59.999 Africa/Dar_es_Salaam (20:59:59.999Z) so database review and feed expiry share the same boundary; that canonical timestamp is displayed as a date without an invented time.
- Platform-admin review queue with atomic approve-and-publish or reject actions and reviewer notes.
- Platform administrator identity is held in the non-exposed `private.platform_admins` allowlist; first-admin bootstrap is documented in `docs/NEXTDOOR_PLUS_ADMIN_BOOTSTRAP.md`.

The browser client uses the existing Vercel variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. It does not expose a service-role key. CI now verifies that the browser Supabase client reads only those two public variables and scans the built `.output/public` assets for server-only Supabase environment names, `sb_secret_` keys, and JWTs whose decoded role is `service_role`. The guard never prints matched credential values and runs after the production build.

## Row-level security

RLS is enabled on all seven public tables. The private administrator allowlist also has an explicit deny-client policy and no client table grants. Policies now ensure:
- Users can read and update only their own profile.
- Workspace owners and members can access only their workspaces.
- Membership changes are restricted to self-join for an owned workspace or owner-managed membership.
- Only open, published opportunities are visible to authenticated users.
- Saved opportunities and activity are limited to workspace members.
- Users can create activity only as themselves.
- Opportunity submissions are private to their submitter and platform administrators; only admin-approved submissions can create published feed records.

To avoid recursive RLS policy evaluation, workspace membership/ownership checks use tightly scoped SECURITY DEFINER helper functions in the non-exposed `private` schema. They are executable by authenticated users only. The exposed review RPC functions use SECURITY INVOKER; admin-only RLS policies authorize publication and review writes. The private administrator allowlist has an explicit deny-client policy and no client table grants.

## Known gaps and next work

- The atomic-save migration `20261125090000_nextdoor_plus_atomic_saves.sql` is committed on the feature branch but has not been applied to the existing Supabase project. Apply it only after review and explicit release approval.
- No published opportunities currently exist in the table. Member submissions are now supported, but an administrator must verify each original source before publication; do not add fabricated listings. Deadline status is computed at read time in the client and does not automatically rewrite database status; admins must still review source pages and close records when appropriate.
- The first platform administrator must be provisioned manually after creating and confirming the owner account; see `docs/NEXTDOOR_PLUS_ADMIN_BOOTSTRAP.md`. The Supabase project currently has no auth users, so no admin has been seeded.
- Restore the first three original core migration SQL files before using this branch to bootstrap a clean Supabase project; their versions are in database history but their source files are not present here.
- Verify email confirmation and password recovery end-to-end against the Supabase Auth redirect and SMTP settings.
- Add automated tests for cross-workspace isolation and all write policies; client-side filtering, source validation, refresh coordination and profile-upsert behavior now have unit coverage.
- Replace the small direct Auth/PostgREST wrapper with `@supabase/supabase-js` once the package and Bun lockfile can be regenerated together.
- Add automated tests for cross-workspace isolation and all write policies; the workspace overview currently has unit coverage for latest-status aggregation, follow-up replacement/ordering, and saved-only activity.
- Run lint, typecheck, tests and production build; complete browser QA.

## Release safety

The Nextdoor Plus pull request remains draft. Its Vercel preview is not production. Do not merge or promote it until authentication, RLS isolation, tests and existing public-site regression checks pass. Existing quote/contact flows remain unchanged.
