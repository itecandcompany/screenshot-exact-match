import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

let migration = "";

beforeAll(async () => {
  migration = await readFile(
    resolve(process.cwd(), "supabase/migrations/20261127070000_nextdoor_plus_least_privilege_grants.sql"),
    "utf8",
  );
});

describe("Nextdoor Plus least-privilege grants migration", () => {
  it("removes broad browser grants from every Plus table and the private admin allowlist", () => {
    expect(migration).toMatch(
      /revoke all privileges on table[\s\S]*?public\.opportunity_submissions\s+from\s+public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(
      /revoke all privileges on table private\.platform_admins\s+from\s+public,\s*anon,\s*authenticated/i,
    );
  });

  it("grants only the operations required by the authenticated workspace", () => {
    const grants = [
      /grant select, insert, update on table public\.profiles to authenticated/i,
      /grant select, insert, update on table public\.workspaces to authenticated/i,
      /grant select, insert, delete on table public\.workspace_members to authenticated/i,
      /grant select, insert on table public\.opportunities to authenticated/i,
      /grant select, insert, update on table public\.opportunity_submissions to authenticated/i,
      /grant select, insert, delete on table public\.saved_opportunities to authenticated/i,
      /grant select, insert on table public\.opportunity_activity to authenticated/i,
    ];

    for (const grant of grants) expect(migration).toMatch(grant);
  });

  it("keeps the private schema unavailable to anonymous users", () => {
    expect(migration).toMatch(/revoke all on schema private from public, anon/i);
    expect(migration).toMatch(/grant usage on schema private to authenticated/i);
  });

  it("does not grant browser privileges to anon or alter service-role grants", () => {
    expect(migration).not.toMatch(/grant\s+[^;]+\s+to\s+(?:public|anon)\b/i);
    expect(migration).not.toMatch(/(?:from|to)\s+service_role\b/i);
  });
});
