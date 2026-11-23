import type {
  OpportunityActivity,
  SavedOpportunity,
} from "@/lib/supabase/client";
import { formatOpportunityDate } from "@/lib/opportunity-display";

export type WorkspacePipelineStatus =
  | "interested"
  | "applied"
  | "won"
  | "dismissed"
  | "not_started";

export interface WorkspaceFollowUp {
  opportunityId: string;
  title: string;
  dueAt: string;
  overdue: boolean;
  status: WorkspacePipelineStatus;
}

export interface WorkspaceRecentActivity {
  id: string;
  opportunityId: string;
  title: string;
  label: string;
  detail: string | null;
  createdAt: string;
}

export interface WorkspaceOverview {
  statusCounts: Record<WorkspacePipelineStatus, number>;
  followUps: WorkspaceFollowUp[];
  recentActivity: WorkspaceRecentActivity[];
}

const statusValues = new Set<WorkspacePipelineStatus>([
  "interested",
  "applied",
  "won",
  "dismissed",
]);

function timestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function latestEventsByOpportunity(
  events: OpportunityActivity[],
  eventType: string,
): Map<string, OpportunityActivity> {
  const latest = new Map<string, OpportunityActivity>();
  const ordered = [...events].sort(
    (left, right) =>
      (timestamp(right.created_at) ?? 0) -
      (timestamp(left.created_at) ?? 0),
  );

  for (const event of ordered) {
    if (
      event.event_type === eventType &&
      !latest.has(event.opportunity_id)
    ) {
      latest.set(event.opportunity_id, event);
    }
  }

  return latest;
}

function activityLabel(eventType: string): string {
  switch (eventType) {
    case "status_changed":
      return "Status updated";
    case "note_added":
      return "Private note added";
    case "follow_up_set":
      return "Follow-up scheduled";
    default:
      return eventType.replaceAll("_", " ");
  }
}

export function buildWorkspaceOverview(
  saved: SavedOpportunity[],
  activity: OpportunityActivity[],
  now = new Date(),
): WorkspaceOverview {
  const savedByOpportunity = new Map(
    saved.map((item) => [item.opportunity_id, item]),
  );
  const latestStatuses = latestEventsByOpportunity(activity, "status_changed");
  const latestFollowUps = latestEventsByOpportunity(activity, "follow_up_set");

  const statusCounts: WorkspaceOverview["statusCounts"] = {
    interested: 0,
    applied: 0,
    won: 0,
    dismissed: 0,
    not_started: 0,
  };

  for (const item of saved) {
    const status = latestStatuses.get(item.opportunity_id)?.new_status;
    if (status && statusValues.has(status as WorkspacePipelineStatus)) {
      statusCounts[status as WorkspacePipelineStatus] += 1;
    } else {
      statusCounts.not_started += 1;
    }
  }

  const followUps = saved.flatMap((item) => {
    const event = latestFollowUps.get(item.opportunity_id);
    const dueAt = event?.note;
    const dueTimestamp = timestamp(dueAt);
    if (!event || !dueAt || dueTimestamp === null) return [];

    const status = latestStatuses.get(item.opportunity_id)?.new_status;
    const pipelineStatus =
      status && statusValues.has(status as WorkspacePipelineStatus)
        ? (status as WorkspacePipelineStatus)
        : "not_started";

    return [{
      opportunityId: item.opportunity_id,
      title: item.opportunities.title,
      dueAt,
      overdue: dueTimestamp < now.getTime(),
      status: pipelineStatus,
    }];
  }).sort(
    (left, right) =>
      (timestamp(left.dueAt) ?? 0) - (timestamp(right.dueAt) ?? 0),
  );

  const recentActivity = activity
    .filter((event) => savedByOpportunity.has(event.opportunity_id))
    .sort(
      (left, right) =>
        (timestamp(right.created_at) ?? 0) -
        (timestamp(left.created_at) ?? 0),
    )
    .slice(0, 6)
    .flatMap((event) => {
      const savedItem = savedByOpportunity.get(event.opportunity_id);
      if (!savedItem) return [];

      return [{
        id: event.id,
        opportunityId: event.opportunity_id,
        title: savedItem.opportunities.title,
        label: activityLabel(event.event_type),
        detail:
          event.event_type === "follow_up_set"
            ? formatOpportunityDate(event.note)
            : event.note,
        createdAt: event.created_at,
      }];
    });

  return { statusCounts, followUps, recentActivity };
}
