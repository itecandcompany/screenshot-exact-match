import { describe, expect, it } from "vitest";
import type {
  OpportunityActivity,
  SavedOpportunity,
} from "@/lib/supabase/client";
import { buildWorkspaceOverview } from "@/lib/workspace-overview";

const saved: SavedOpportunity[] = [
  {
    id: "saved-1",
    opportunity_id: "opportunity-1",
    created_at: "2026-11-20T08:00:00.000Z",
    opportunities: { id: "opportunity-1", title: "Arusha billboard placement" } as SavedOpportunity["opportunities"],
  },
  {
    id: "saved-2",
    opportunity_id: "opportunity-2",
    created_at: "2026-11-20T09:00:00.000Z",
    opportunities: { id: "opportunity-2", title: "Dar es Salaam social campaign" } as SavedOpportunity["opportunities"],
  },
];

const event = (
  id: string,
  opportunityId: string,
  eventType: string,
  createdAt: string,
  note: string | null = null,
  newStatus: string | null = null,
): OpportunityActivity => ({
  id,
  opportunity_id: opportunityId,
  event_type: eventType,
  note,
  new_status: newStatus,
  created_at: createdAt,
});

describe("buildWorkspaceOverview", () => {
  const now = new Date("2026-11-23T06:00:00.000Z");

  it("counts each saved opportunity by its latest pipeline status", () => {
    const overview = buildWorkspaceOverview(
      saved,
      [
        event("status-old", "opportunity-1", "status_changed", "2026-11-21T08:00:00Z", null, "interested"),
        event("status-new", "opportunity-1", "status_changed", "2026-11-22T08:00:00Z", null, "applied"),
      ],
      now,
    );

    expect(overview.statusCounts).toEqual({
      interested: 0,
      applied: 1,
      won: 0,
      dismissed: 0,
      not_started: 1,
    });
  });

  it("keeps only the latest valid follow-up per saved opportunity and sorts by due date", () => {
    const overview = buildWorkspaceOverview(
      saved,
      [
        event("old-follow-up", "opportunity-1", "follow_up_set", "2026-11-20T08:00:00Z", "2026-11-24T09:00:00.000Z"),
        event("new-follow-up", "opportunity-1", "follow_up_set", "2026-11-22T08:00:00Z", "2026-11-22T09:00:00.000Z"),
        event("next-follow-up", "opportunity-2", "follow_up_set", "2026-11-22T09:00:00Z", "2026-11-25T09:00:00.000Z"),
        event("invalid-follow-up", "opportunity-2", "follow_up_set", "2026-11-21T09:00:00Z", "not-a-date"),
      ],
      now,
    );

    expect(overview.followUps).toEqual([
      expect.objectContaining({
        opportunityId: "opportunity-1",
        dueAt: "2026-11-22T09:00:00.000Z",
        overdue: true,
      }),
      expect.objectContaining({
        opportunityId: "opportunity-2",
        dueAt: "2026-11-25T09:00:00.000Z",
        overdue: false,
      }),
    ]);
  });

  it("shows the six newest events for saved opportunities only", () => {
    const overview = buildWorkspaceOverview(
      saved,
      [
        event("older", "opportunity-1", "note_added", "2026-11-20T08:00:00Z", "First note"),
        event("newer", "opportunity-2", "note_added", "2026-11-22T08:00:00Z", "Second note"),
        event("removed", "not-saved", "note_added", "2026-11-23T08:00:00Z", "Private orphan"),
      ],
      now,
    );

    expect(overview.recentActivity).toHaveLength(2);
    expect(overview.recentActivity[0]).toMatchObject({
      id: "newer",
      title: "Dar es Salaam social campaign",
      label: "Private note added",
      detail: "Second note",
    });
  });

  it("returns a useful empty overview for a new workspace", () => {
    const overview = buildWorkspaceOverview([], [], now);

    expect(overview.statusCounts.not_started).toBe(0);
    expect(overview.followUps).toEqual([]);
    expect(overview.recentActivity).toEqual([]);
  });
});
