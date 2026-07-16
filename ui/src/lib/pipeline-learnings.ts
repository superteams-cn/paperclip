import type { PipelineCompanyCaseEvent } from "../api/pipelines";
import type { TFunction } from "i18next";
import { formatShortDate } from "./utils";

export type LearningEventPresentation = {
  sentence: string;
  kind: "review" | "forced_move" | "unknown";
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function eventItemTitle(event: PipelineCompanyCaseEvent, t?: TFunction): string {
  const payload = asRecord(event.payload);
  return (
    asString(event.case?.title) ??
    asString(payload.itemTitle) ??
    asString(payload.caseTitle) ??
    asString(payload.title) ??
    t?.("pages.pipelines.learnings.event.untitledItem", { defaultValue: "Untitled item" }) ?? "Untitled item"
  );
}

function eventActorName(event: PipelineCompanyCaseEvent, t?: TFunction): string {
  const payload = asRecord(event.payload);
  return (
    asString(event.actorAgent?.name) ??
    asString(payload.actorName) ??
    asString(payload.reviewerName) ??
    asString(payload.decidedByName) ??
    t?.("pages.pipelines.learnings.event.someone", { defaultValue: "Someone" }) ?? "Someone"
  );
}

function payloadText(event: PipelineCompanyCaseEvent, ...keys: string[]): string | null {
  const payload = asRecord(event.payload);
  for (const key of keys) {
    const value = asString(payload[key]);
    if (value) return value;
  }
  return null;
}

function reviewVerb(decision: string | null, t?: TFunction): string {
  if (decision === "request_changes") return t?.("pages.pipelines.learnings.event.verbs.sentBack", { defaultValue: "sent back" }) ?? "sent back";
  if (decision === "reject" || decision === "drop") return t?.("pages.pipelines.learnings.event.verbs.declined", { defaultValue: "declined" }) ?? "declined";
  return t?.("pages.pipelines.learnings.event.verbs.approved", { defaultValue: "approved" }) ?? "approved";
}

export function formatLearningEvent(event: PipelineCompanyCaseEvent, t?: TFunction): LearningEventPresentation {
  const payload = asRecord(event.payload);
  const title = eventItemTitle(event, t);

  if (event.type === "review_decided") {
    const actor = eventActorName(event, t);
    const decision = asString(payload.decision);
    const toStageName =
      asString(event.toStage?.name) ?? payloadText(event, "toStageName", "stageName", "targetStageName");
    const stageCopy = toStageName
      ? t?.("pages.pipelines.learnings.event.movingTo", { defaultValue: " moving to {{stage}}", stage: toStageName }) ?? ` moving to ${toStageName}`
      : "";
    const note = payloadText(event, "reason", "note");
    const noteCopy = note
      ? t?.("pages.pipelines.learnings.event.note", { defaultValue: " - note: {{note}}", note }) ?? ` - note: ${note}`
      : "";
    return {
      kind: "review",
      sentence: t?.("pages.pipelines.learnings.event.reviewSentence", {
        defaultValue: "{{actor}} {{decision}} '{{title}}'{{stage}}{{note}}.",
        actor,
        decision: reviewVerb(decision, t),
        title,
        stage: stageCopy,
        note: noteCopy,
      }) ?? `${actor} ${reviewVerb(decision)} '${title}'${stageCopy}${noteCopy}.`,
    };
  }

  if (event.type === "transition_forced") {
    const fromStageName = asString(event.fromStage?.name) ?? payloadText(event, "fromStageName");
    const toStageName =
      asString(event.toStage?.name) ?? payloadText(event, "toStageName", "stageName", "targetStageName");
    const fromCopy = fromStageName
      ? t?.("pages.pipelines.learnings.event.fromStage", { defaultValue: " from {{stage}}", stage: fromStageName }) ?? ` from ${fromStageName}`
      : "";
    const toCopy = toStageName
      ? t?.("pages.pipelines.learnings.event.toStage", { defaultValue: " to {{stage}}", stage: toStageName }) ?? ` to ${toStageName}`
      : "";
    const reason = payloadText(event, "reason", "note");
    const reasonCopy = reason
      ? t?.("pages.pipelines.learnings.event.reason", { defaultValue: " - reason: {{reason}}", reason }) ?? ` - reason: ${reason}`
      : "";
    return {
      kind: "forced_move",
      sentence: t?.("pages.pipelines.learnings.event.forcedMoveSentence", {
        defaultValue: "'{{title}}' was moved by hand{{from}}{{to}}{{reason}}.",
        title,
        from: fromCopy,
        to: toCopy,
        reason: reasonCopy,
      }) ?? `'${title}' was moved by hand${fromCopy}${toCopy}${reasonCopy}.`,
    };
  }

  return {
    kind: "unknown",
    sentence: t?.("pages.pipelines.learnings.event.changedSentence", {
      defaultValue: "'{{title}}' changed.",
      title,
    }) ?? `'${title}' changed.`,
  };
}

export function learningDayKey(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toISOString().slice(0, 10);
}

export function learningDayLabel(value: string | Date, t?: TFunction) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t?.("pages.pipelines.learnings.date.unknown", { defaultValue: "Unknown" }) ?? "Unknown";
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86_400_000);
  if (diffDays === 0) return t?.("pages.pipelines.learnings.date.today", { defaultValue: "Today" }) ?? "Today";
  if (diffDays === 1) return t?.("pages.pipelines.learnings.date.yesterday", { defaultValue: "Yesterday" }) ?? "Yesterday";
  return formatShortDate(date);
}

export function groupLearningEventsByDay<T extends { createdAt: string | Date }>(events: T[], t?: TFunction) {
  const groups: Array<{ key: string; label: string; events: T[] }> = [];
  for (const event of events) {
    const key = learningDayKey(event.createdAt);
    const existing = groups.find((group) => group.key === key);
    if (existing) {
      existing.events.push(event);
      continue;
    }
    groups.push({ key, label: learningDayLabel(event.createdAt, t), events: [event] });
  }
  return groups;
}
