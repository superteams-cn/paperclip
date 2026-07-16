import type { TFunction } from "i18next";
import type { Agent } from "@paperclipai/shared";
import type { CompanyUserProfile } from "./company-members";
import { formatMonitorServiceName } from "./issue-monitor";

type ActivityDetails = Record<string, unknown> | null | undefined;

type ActivityParticipant = {
  type: "agent" | "user";
  agentId?: string | null;
  userId?: string | null;
};

type ActivityIssueReference = {
  id?: string | null;
  identifier?: string | null;
  title?: string | null;
};

interface ActivityFormatOptions {
  agentMap?: Map<string, Agent>;
  userProfileMap?: Map<string, CompanyUserProfile>;
  currentUserId?: string | null;
  t?: TFunction;
}

function activityText(
  options: ActivityFormatOptions,
  key: string,
  defaultValue: string,
  values: Record<string, unknown> = {},
) {
  return options.t?.(key, { defaultValue, ...values }) ?? defaultValue;
}

/** Look up an activity verb/label with i18n, falling back to the English map value. */
function localizeActivity(
  map: Record<string, string>,
  ns: string,
  action: string,
  options: ActivityFormatOptions,
): string {
  const fallback = map[action] ?? action.replace(/[._]/g, " ");
  if (!options.t) return fallback;
  return options.t(`${ns}.${action.replace(/\./g, "_")}`, { defaultValue: fallback });
}

const ACTIVITY_ROW_VERBS: Record<string, string> = {
  "issue.created": "created",
  "issue.updated": "updated",
  "issue.checked_out": "checked out",
  "issue.released": "released",
  "issue.comment_added": "commented on",
  "issue.comment_cancelled": "cancelled a queued comment on",
  "issue.comment_deleted": "deleted a comment on",
  "issue.attachment_added": "attached file to",
  "issue.attachment_removed": "removed attachment from",
  "issue.document_created": "created document for",
  "issue.document_updated": "updated document on",
  "issue.document_locked": "locked document on",
  "issue.document_unlocked": "unlocked document on",
  "issue.document_deleted": "deleted document from",
  "issue.monitor_scheduled": "scheduled monitor on",
  "issue.monitor_triggered": "triggered monitor for",
  "issue.monitor_cleared": "cleared monitor on",
  "issue.monitor_skipped": "skipped monitor for",
  "issue.monitor_exhausted": "exhausted monitor on",
  "issue.monitor_recovery_wake_queued": "queued monitor recovery for",
  "issue.monitor_recovery_issue_created": "created monitor recovery for",
  "issue.monitor_escalated_to_board": "escalated monitor for",
  "issue.commented": "commented on",
  "issue.deleted": "deleted",
  "issue.successful_run_handoff_required": "flagged missing next step on",
  "issue.successful_run_handoff_resolved": "recorded next step chosen on",
  "issue.successful_run_handoff_escalated": "escalated missing next step on",
  "issue.accepted_plan_decomposition_updated": "updated accepted-plan decomposition on",
  "issue.recovery_action_opened": "opened a recovery action on",
  "issue.recovery_action_resolved": "resolved the recovery action on",
  "issue.recovery_action_escalated": "escalated the recovery action on",
  "agent.created": "created",
  "agent.updated": "updated",
  "agent.paused": "paused",
  "agent.resumed": "resumed",
  "agent.error_cleared": "cleared error on",
  "agent.terminated": "terminated",
  "agent.key_created": "created API key for",
  "agent.budget_updated": "updated budget for",
  "agent.runtime_session_reset": "reset session for",
  "heartbeat.invoked": "invoked heartbeat for",
  "heartbeat.cancelled": "cancelled heartbeat for",
  "heartbeat.output_stale_source_resolved": "system-folded stale run on",
  "heartbeat.output_stale_recovery_recursion_refused": "refused recovery-on-recovery for",
  "approval.created": "requested approval",
  "approval.approved": "approved",
  "approval.rejected": "rejected",
  "project.created": "created",
  "project.updated": "updated",
  "project.deleted": "deleted",
  "goal.created": "created",
  "goal.updated": "updated",
  "goal.deleted": "deleted",
  "cost.reported": "reported cost for",
  "cost.recorded": "recorded cost for",
  "company.created": "created company",
  "company.updated": "updated company",
  "company.archived": "archived",
  "company.reactivated": "reactivated",
  "company.budget_updated": "updated budget for",
};

const ISSUE_ACTIVITY_LABELS: Record<string, string> = {
  "issue.created": "created the issue",
  "issue.updated": "updated the issue",
  "issue.checked_out": "checked out the issue",
  "issue.released": "released the issue",
  "issue.comment_added": "added a comment",
  "issue.comment_cancelled": "cancelled a queued comment",
  "issue.comment_deleted": "deleted a comment",
  "issue.feedback_vote_saved": "saved feedback on an AI output",
  "issue.attachment_added": "added an attachment",
  "issue.attachment_removed": "removed an attachment",
  "issue.document_created": "created a document",
  "issue.document_updated": "updated a document",
  "issue.document_locked": "locked a document",
  "issue.document_unlocked": "unlocked a document",
  "issue.document_deleted": "deleted a document",
  "issue.monitor_scheduled": "scheduled a monitor",
  "issue.monitor_triggered": "triggered a monitor",
  "issue.monitor_cleared": "cleared a monitor",
  "issue.monitor_skipped": "skipped a monitor",
  "issue.monitor_exhausted": "exhausted a monitor",
  "issue.monitor_recovery_wake_queued": "queued a monitor recovery wake",
  "issue.monitor_recovery_issue_created": "created a monitor recovery issue",
  "issue.monitor_escalated_to_board": "escalated a monitor to the board",
  "issue.deleted": "deleted the issue",
  "issue.successful_run_handoff_required": "Run finished without a clear next step",
  "issue.successful_run_handoff_resolved": "Next step chosen",
  "issue.successful_run_handoff_escalated": "Run finished without a next step - recovery escalated",
  "issue.recovery_action_opened": "Opened a source-scoped recovery action",
  "issue.recovery_action_resolved": "Resolved the recovery action",
  "issue.recovery_action_escalated": "Escalated the recovery action",
  "issue.accepted_plan_decomposition_updated": "updated the accepted-plan decomposition",
  "agent.created": "created an agent",
  "agent.updated": "updated the agent",
  "agent.paused": "paused the agent",
  "agent.resumed": "resumed the agent",
  "agent.error_cleared": "cleared the agent error",
  "agent.terminated": "terminated the agent",
  "heartbeat.invoked": "invoked a heartbeat",
  "heartbeat.cancelled": "cancelled a heartbeat",
  "heartbeat.output_stale_source_resolved": "System folded a stale run",
  "heartbeat.output_stale_recovery_recursion_refused": "Refused recovery-on-recovery escalation",
  "approval.created": "requested approval",
  "approval.approved": "approved",
  "approval.rejected": "rejected",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function humanizeValue(value: unknown, options: ActivityFormatOptions = {}): string {
  if (typeof value !== "string") return String(value ?? activityText(options, "common.none", "none"));
  const fallback = value.replace(/_/g, " ");
  return activityText(options, `pages.activity.format.values.${value}`, fallback);
}

function isActivityParticipant(value: unknown): value is ActivityParticipant {
  const record = asRecord(value);
  if (!record) return false;
  return record.type === "agent" || record.type === "user";
}

function isActivityIssueReference(value: unknown): value is ActivityIssueReference {
  return asRecord(value) !== null;
}

function readParticipants(details: ActivityDetails, key: string): ActivityParticipant[] {
  const value = details?.[key];
  if (!Array.isArray(value)) return [];
  return value.filter(isActivityParticipant);
}

function readIssueReferences(details: ActivityDetails, key: string): ActivityIssueReference[] {
  const value = details?.[key];
  if (!Array.isArray(value)) return [];
  return value.filter(isActivityIssueReference);
}

function formatUserLabel(userId: string | null | undefined, options: ActivityFormatOptions = {}): string {
  if (!userId || userId === "local-board") return activityText(options, "pages.activity.format.actors.board", "Board");
  if (options.currentUserId && userId === options.currentUserId) return activityText(options, "pages.activity.format.actors.you", "You");
  const profile = options.userProfileMap?.get(userId);
  if (profile) return profile.label;
  return activityText(options, "pages.activity.format.actors.userId", `user ${userId.slice(0, 5)}`, { id: userId.slice(0, 5) });
}

function formatParticipantLabel(participant: ActivityParticipant, options: ActivityFormatOptions): string {
  if (participant.type === "agent") {
    const agentId = participant.agentId ?? "";
    return options.agentMap?.get(agentId)?.name ?? activityText(options, "pages.activity.format.actors.agent", "agent");
  }
  return formatUserLabel(participant.userId, options);
}

function formatIssueReferenceLabel(reference: ActivityIssueReference, options: ActivityFormatOptions): string {
  if (reference.identifier) return reference.identifier;
  if (reference.title) return reference.title;
  if (reference.id) return reference.id.slice(0, 8);
  return activityText(options, "pages.activity.format.entities.task", "task");
}

function formatChangedEntityLabel(
  entity: "blocker" | "reviewer" | "approver",
  labels: string[],
  options: ActivityFormatOptions,
): string {
  const singular = activityText(options, `pages.activity.format.entities.${entity}.singular`, entity);
  const plural = activityText(options, `pages.activity.format.entities.${entity}.plural`, `${entity}s`);
  if (labels.length <= 0) return plural;
  if (labels.length === 1) return activityText(options, "pages.activity.format.entityWithLabel", `${singular} ${labels[0]}`, { entity: singular, label: labels[0] });
  return activityText(options, "pages.activity.format.entityCount", `${labels.length} ${plural}`, { count: labels.length, entity: plural });
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function readStringArrayLength(value: unknown): number {
  if (!Array.isArray(value)) return 0;
  return value.filter((entry) => typeof entry === "string" && entry.length > 0).length;
}

function formatAcceptedPlanDecompositionDetail(details: ActivityDetails, options: ActivityFormatOptions): string | null {
  if (!details) return null;
  const status = typeof details.status === "string" ? details.status : null;
  const requested = readNumber(details.requestedChildCount);
  const totalChildren = readStringArrayLength(details.childIssueIds);
  const newlyCreated = readStringArrayLength(details.newlyCreatedChildIssueIds);
  const reused = Math.max(0, totalChildren - newlyCreated);
  const parts: string[] = [];
  if (newlyCreated > 0) parts.push(activityText(options, "pages.activity.format.decomposition.createdNew", `created ${newlyCreated} new`, { count: newlyCreated }));
  if (reused > 0) parts.push(activityText(options, "pages.activity.format.decomposition.reusedExisting", `reused ${reused} existing`, { count: reused }));
  if (parts.length === 0 && requested !== null) parts.push(activityText(options, "pages.activity.format.decomposition.requested", `${requested} requested`, { count: requested }));
  const separator = activityText(options, "pages.activity.format.partsSeparator", ", ");
  const summary = parts.length > 0 ? parts.join(separator) : null;
  if (status === "completed" && summary) return activityText(options, "pages.activity.format.decomposition.completedWithSummary", `decomposition completed (${summary})`, { summary });
  if (status === "completed") return activityText(options, "pages.activity.format.decomposition.completed", "decomposition completed");
  if (status === "in_flight" && summary) return activityText(options, "pages.activity.format.decomposition.inFlightWithSummary", `decomposition in flight (${summary})`, { summary });
  return summary;
}

function formatIssueUpdatedVerb(details: ActivityDetails, options: ActivityFormatOptions): string | null {
  if (!details) return null;
  const previous = asRecord(details._previous) ?? {};
  if (details.status !== undefined) {
    const from = previous.status;
    return from
      ? activityText(options, "pages.activity.format.rowDynamic.changedStatusFromTo", `changed status from ${humanizeValue(from)} to ${humanizeValue(details.status)} on`, { from: humanizeValue(from, options), to: humanizeValue(details.status, options) })
      : activityText(options, "pages.activity.format.rowDynamic.changedStatusTo", `changed status to ${humanizeValue(details.status)} on`, { to: humanizeValue(details.status, options) });
  }
  if (details.priority !== undefined) {
    const from = previous.priority;
    return from
      ? activityText(options, "pages.activity.format.rowDynamic.changedPriorityFromTo", `changed priority from ${humanizeValue(from)} to ${humanizeValue(details.priority)} on`, { from: humanizeValue(from, options), to: humanizeValue(details.priority, options) })
      : activityText(options, "pages.activity.format.rowDynamic.changedPriorityTo", `changed priority to ${humanizeValue(details.priority)} on`, { to: humanizeValue(details.priority, options) });
  }
  return null;
}

function formatAssigneeName(details: ActivityDetails, options: ActivityFormatOptions): string | null {
  if (!details) return null;
  const agentId = details.assigneeAgentId;
  const userId = details.assigneeUserId;
  if (typeof agentId === "string" && agentId) {
    return options.agentMap?.get(agentId)?.name ?? activityText(options, "pages.activity.format.actors.agent", "agent");
  }
  if (typeof userId === "string" && userId) {
    return formatUserLabel(userId, options);
  }
  return null;
}

function formatIssueUpdatedAction(details: ActivityDetails, options: ActivityFormatOptions = {}): string | null {
  if (!details) return null;
  const previous = asRecord(details._previous) ?? {};
  const parts: string[] = [];

  if (details.status !== undefined) {
    const from = previous.status;
    parts.push(
      from
        ? activityText(options, "pages.activity.format.issueDynamic.changedStatusFromTo", `changed the status from ${humanizeValue(from)} to ${humanizeValue(details.status)}`, { from: humanizeValue(from, options), to: humanizeValue(details.status, options) })
        : activityText(options, "pages.activity.format.issueDynamic.changedStatusTo", `changed the status to ${humanizeValue(details.status)}`, { to: humanizeValue(details.status, options) }),
    );
  }
  if (details.priority !== undefined) {
    const from = previous.priority;
    parts.push(
      from
        ? activityText(options, "pages.activity.format.issueDynamic.changedPriorityFromTo", `changed the priority from ${humanizeValue(from)} to ${humanizeValue(details.priority)}`, { from: humanizeValue(from, options), to: humanizeValue(details.priority, options) })
        : activityText(options, "pages.activity.format.issueDynamic.changedPriorityTo", `changed the priority to ${humanizeValue(details.priority)}`, { to: humanizeValue(details.priority, options) }),
    );
  }
  if (details.assigneeAgentId !== undefined || details.assigneeUserId !== undefined) {
    const assigneeName = formatAssigneeName(details, options);
    parts.push(assigneeName
      ? activityText(options, "pages.activity.format.issueDynamic.assignedIssueTo", `assigned the issue to ${assigneeName}`, { assignee: assigneeName })
      : activityText(options, "pages.activity.format.issueDynamic.unassignedIssue", "unassigned the issue"));
  }
  if (details.title !== undefined) parts.push(activityText(options, "pages.activity.format.issueDynamic.updatedTitle", "updated the title"));
  if (details.description !== undefined) parts.push(activityText(options, "pages.activity.format.issueDynamic.updatedDescription", "updated the description"));

  const separator = activityText(options, "pages.activity.format.partsSeparator", ", ");
  return parts.length > 0 ? parts.join(separator) : null;
}

function formatStructuredIssueChange(input: {
  action: string;
  details: ActivityDetails;
  options: ActivityFormatOptions;
  forIssueDetail: boolean;
}): string | null {
  const details = input.details;
  if (!details) return null;

  if (input.action === "issue.blockers_updated") {
    const added = readIssueReferences(details, "addedBlockedByIssues").map((reference) => formatIssueReferenceLabel(reference, input.options));
    const removed = readIssueReferences(details, "removedBlockedByIssues").map((reference) => formatIssueReferenceLabel(reference, input.options));
    if (added.length > 0 && removed.length === 0) {
      const changed = formatChangedEntityLabel("blocker", added, input.options);
      return input.forIssueDetail
        ? activityText(input.options, "pages.activity.format.structured.added", `added ${changed}`, { changed })
        : activityText(input.options, "pages.activity.format.structured.addedTo", `added ${changed} to`, { changed });
    }
    if (removed.length > 0 && added.length === 0) {
      const changed = formatChangedEntityLabel("blocker", removed, input.options);
      return input.forIssueDetail
        ? activityText(input.options, "pages.activity.format.structured.removed", `removed ${changed}`, { changed })
        : activityText(input.options, "pages.activity.format.structured.removedFrom", `removed ${changed} from`, { changed });
    }
    return input.forIssueDetail
      ? activityText(input.options, "pages.activity.format.structured.updatedBlockers", "updated blockers")
      : activityText(input.options, "pages.activity.format.structured.updatedBlockersOn", "updated blockers on");
  }

  if (input.action === "issue.reviewers_updated" || input.action === "issue.approvers_updated") {
    const added = readParticipants(details, "addedParticipants").map((participant) => formatParticipantLabel(participant, input.options));
    const removed = readParticipants(details, "removedParticipants").map((participant) => formatParticipantLabel(participant, input.options));
    const entity = input.action === "issue.reviewers_updated" ? "reviewer" : "approver";
    if (added.length > 0 && removed.length === 0) {
      const changed = formatChangedEntityLabel(entity, added, input.options);
      return input.forIssueDetail
        ? activityText(input.options, "pages.activity.format.structured.added", `added ${changed}`, { changed })
        : activityText(input.options, "pages.activity.format.structured.addedTo", `added ${changed} to`, { changed });
    }
    if (removed.length > 0 && added.length === 0) {
      const changed = formatChangedEntityLabel(entity, removed, input.options);
      return input.forIssueDetail
        ? activityText(input.options, "pages.activity.format.structured.removed", `removed ${changed}`, { changed })
        : activityText(input.options, "pages.activity.format.structured.removedFrom", `removed ${changed} from`, { changed });
    }
    return input.forIssueDetail
      ? activityText(input.options, `pages.activity.format.structured.updated.${entity}`, `updated ${entity}s`)
      : activityText(input.options, `pages.activity.format.structured.updatedOn.${entity}`, `updated ${entity}s on`);
  }

  return null;
}

export function formatActivityVerb(
  action: string,
  details?: Record<string, unknown> | null,
  options: ActivityFormatOptions = {},
): string {
  if (action === "issue.updated") {
    const issueUpdatedVerb = formatIssueUpdatedVerb(details, options);
    if (issueUpdatedVerb) return issueUpdatedVerb;
  }

  const structuredChange = formatStructuredIssueChange({
    action,
    details,
    options,
    forIssueDetail: false,
  });
  if (structuredChange) return structuredChange;

  return localizeActivity(ACTIVITY_ROW_VERBS, "activity.rowVerbs", action, options);
}

export function formatIssueActivityAction(
  action: string,
  details?: Record<string, unknown> | null,
  options: ActivityFormatOptions = {},
): string {
  if (action === "issue.updated") {
    const issueUpdatedAction = formatIssueUpdatedAction(details, options);
    if (issueUpdatedAction) return issueUpdatedAction;
  }

  const structuredChange = formatStructuredIssueChange({
    action,
    details,
    options,
    forIssueDetail: true,
  });
  if (structuredChange) return structuredChange;

  if (action === "issue.accepted_plan_decomposition_updated") {
    const detail = formatAcceptedPlanDecompositionDetail(details, options);
    if (detail) return detail;
  }

  if (action.startsWith("issue.monitor_") && details) {
    const serviceName = typeof details.serviceName === "string" && details.serviceName.trim()
      ? formatMonitorServiceName(details.serviceName.trim(), options.t)
      : null;
    const base = localizeActivity(ISSUE_ACTIVITY_LABELS, "activity.issueLabels", action, options);
    return serviceName ? activityText(options, "pages.activity.format.issueDynamic.forService", `${base} for ${serviceName}`, { base, service: serviceName }) : base;
  }

  if (
    (
      action === "issue.document_created" ||
      action === "issue.document_updated" ||
      action === "issue.document_locked" ||
      action === "issue.document_unlocked" ||
      action === "issue.document_deleted"
    ) &&
    details
  ) {
    const key = typeof details.key === "string" ? details.key : "document";
    const title = typeof details.title === "string" && details.title ? ` (${details.title})` : "";
    return `${localizeActivity(ISSUE_ACTIVITY_LABELS, "activity.issueLabels", action, options)} ${key}${title}`;
  }

  return localizeActivity(ISSUE_ACTIVITY_LABELS, "activity.issueLabels", action, options);
}
