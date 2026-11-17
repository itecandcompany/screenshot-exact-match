# Nextdoor Plus — first platform administrator

Platform administrator access is controlled by the private \`private.platform_admins\` allowlist. It is not based on a browser-editable profile field, workspace role, or email claim, and customers cannot grant themselves administrator access.

## Bootstrap the first administrator

1. Open \`/plus\` on the Nextdoor Ads preview and create the intended owner account.
2. Complete the email confirmation if Supabase Auth requires it.
3. Open the Supabase SQL Editor for project \`tptxzsynpiiewxmketob\`.
4. Replace the placeholder email below with the exact confirmed account email and run the statement:

\`\`\`sql
insert into private.platform_admins (user_id)
select id
from auth.users
where lower(email) = lower('YOUR_CONFIRMED_LOGIN_EMAIL')
  and email_confirmed_at is not null
on conflict (user_id) do nothing;
\`\`\`

5. Sign out of Nextdoor Plus and sign in again. The administrator review queue will appear in the workspace.

If the statement inserts zero rows, confirm that the account exists and its email is verified before retrying. Do not expose the private table through PostgREST or grant authenticated users direct table access. Add or remove administrators only through trusted Supabase administration.

## Review process

- Members submit a title, original HTTP(S) source URL and source evidence.
- Submissions are private and remain in \`pending\` status until reviewed.
- Administrators must inspect the original source before approving.
- Approval runs in one database transaction: it creates an open, published opportunity with \`verified_at\` and \`published_at\` timestamps and marks the submission approved.
- Rejected submissions remain visible to their submitter with the administrator's review note.
- Expired opportunities and duplicate published source URLs cannot be approved through the review function.

No administrator is pre-seeded. This prevents an unverified or guessed account from receiving privileged access.
