# Nextdoor Plus — product architecture

## Purpose

Nextdoor Plus is the authenticated product workspace for the NEXTDOOR ADS service. The existing public NEXTDOOR ADS website remains the marketing and lead-generation site. Plus is the customer workspace for discovering, evaluating, saving and managing digital advertising opportunities.

Initial market: Tanzania, with an East Africa expansion path. Preserve the existing forest-green / lime-green brand direction.

## Repository strategy

Build Plus on the `feature/nextdoor-plus` branch in this repository. Keep its implementation isolated in a dedicated route and feature module so it can be reviewed and merged independently. The `main` branch remains the production public site until a reviewed pull request is merged.

Suggested boundaries:

- `src/routes/plus/`: authenticated product routes (overview, discover, saved, campaigns, settings).
- `src/features/nextdoor-plus/`: UI, domain types, opportunity scoring and workflow logic.
- `src/lib/supabase/`: shared browser/server Supabase clients and session helpers.
- `supabase/migrations/`: versioned schema and RLS policies.

Do not fork or duplicate the public site. Keep shared brand tokens, navigation conventions and existing public routes intact.

## Customer journeys

1. Visitor opens Nextdoor Plus from the public NEXTDOOR ADS site.
2. Visitor signs up or signs in.
3. A user profile and workspace are provisioned securely.
4. The dashboard presents relevant advertising opportunities, their location, audience, channel, estimated reach/cost (only when sourced), deadline and status.
5. The customer saves an opportunity, assigns an owner, adds notes, and tracks it through a workflow such as `new`, `reviewing`, `planned`, `active`, `completed` or `dismissed`.
6. Customers can return to a single dashboard to review saved opportunities and activity.

## Initial product areas

- Authentication: sign up, sign in, sign out, password reset, protected routes.
- Overview: opportunity counts, saved items, status summary and recent activity.
- Discover: searchable/filterable opportunity directory with source and last-verified date.
- Opportunity detail: full description, location/coverage, channel, eligibility, deadline, source link and evidence.
- Saved opportunities: personal shortlist.
- Management: status, notes, owner and follow-up date.
- Account: profile and workspace settings.

## Data model proposal

Use UUID primary keys and UTC timestamps.

- `profiles`: `id` references `auth.users.id`, display name, business name, phone, created/updated timestamps.
- `workspaces`: owner, name, market/country, timestamps.
- `workspace_members`: workspace, user, role.
- `opportunities`: title, slug, description, country, region/city, channel, opportunity type, eligibility, deadline, source URL, source name, source evidence, verified_at, published_at, status.
- `saved_opportunities`: workspace, opportunity, saved_by, created_at; unique workspace/opportunity pair.
- `opportunity_activity`: workspace, opportunity, actor, event type, note, old/new status, created_at.

Keep source facts separate from customer-specific workflow state. Do not present estimated reach, pricing or availability as factual unless the source provides it and the source/verification date is displayed.

## Supabase and security

The existing Supabase project was previously configured in Vercel (project ref `tptxzsynpiiewxmketob`). Repository inspection found no Supabase client module, Supabase dependency or application tables yet. Confirm the project and environment variables before connecting.

Required environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never put a service-role key in browser code. Use Supabase Auth; enable RLS on every customer table. Policies must scope reads/writes to the authenticated user's workspace membership. Validate privileged operations on the server. Do not create fake authentication or report a successful save when the database write failed.

## Integration with the public site

- Add a clearly labelled Nextdoor Plus entry point to the public navigation/CTA when the feature is ready.
- Link to the Plus route or its eventual dedicated hostname; keep marketing pages public.
- Share the same Supabase project and auth identity only after the schema, redirect URLs and RLS policies are configured.
- Keep product-specific records in the Plus tables; do not change existing quote/contact flows as part of this feature.
- Use a versioned API/server-function boundary for any data consumed by the public site. Avoid direct coupling between marketing page components and Plus dashboard internals.

## Definition of done

- Auth flows work against the configured Supabase project, including email confirmation and password recovery.
- Protected routes redirect unauthenticated users to sign in.
- RLS tests demonstrate that one workspace cannot read or mutate another workspace's records.
- Opportunity discovery shows source attribution and verification dates.
- Save, status change, notes and follow-up actions persist and show errors honestly.
- Responsive, accessible UI follows existing NEXTDOOR ADS branding.
- Typecheck, lint, unit tests and production build pass.
- Existing public routes and quote/contact behavior remain unchanged.

## Current implementation status

This branch currently establishes the product architecture only. Authentication, database migrations, discovery ingestion and dashboard UI are not yet implemented. The existing README explicitly notes that email delivery and quote storage are not operational; Nextdoor Plus must not depend on those unfinished public-site flows.
