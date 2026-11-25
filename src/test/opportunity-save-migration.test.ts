import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";

let migration = "";

beforeAll(async () => {
  migration = await readFile(
    new URL("../../supabase/migrations/20261125090000_nextdoor_plus_atomic_saves.sql", import.meta.url),
    "utf8",
  );
});

describe("atomic opportunity-save migration", () => {
  it("keeps the RPC invoker-scoped and preserves the caller's RLS context", () => {
    expect(migration).toMatch(/security invoker/i);
    expect(migration).toMatch(/set search_path\s*=\s*''/i);
    expect(migration).not.toMatch(/security definer/i);
    expect(migration).toMatch(/auth\.uid\(\)/i);
    expect(migration).toMatch(/private\.is_workspace_member/i);
  });

  it("accepts only open published opportunities and serializes duplicate saves", () => {
    expect(migration).toMatch(/o\.status\s*=\s*'open'/i);
    expect(migration).toMatch(/o\.published_at\s+is\s+not\s+null/i);
    expect(migration).toMatch(/pg_catalog\.pg_advisory_xact_lock/i);
    expect(migration).toMatch(/on conflict\s*\(workspace_id,\s*opportunity_id\)\s+do nothing/i);
  });

  it("writes the shortlist row and saved activity in the same RPC transaction", () => {
    expect(migration).toMatch(/insert into public\.saved_opportunities/i);
    expect(migration).toMatch(/insert into public\.opportunity_activity/i);
    expect(migration).toMatch(/event_type\s*=\s*'saved'/i);
    expect(migration).toMatch(/revoke all on function public\.save_opportunity_to_workspace/i);
    expect(migration).toMatch(/grant execute on function public\.save_opportunity_to_workspace[^;]*to authenticated/i);
  });

  it("removes anonymous and unnecessary write privileges from activity tables", () => {
    expect(migration).toMatch(/revoke all on table public\.saved_opportunities from public, anon, authenticated/i);
    expect(migration).toMatch(/grant select, insert, delete on table public\.saved_opportunities to authenticated/i);
    expect(migration).toMatch(/revoke all on table public\.opportunity_activity from public, anon, authenticated/i);
    expect(migration).toMatch(/grant select, insert on table public\.opportunity_activity to authenticated/i);
  });
});
