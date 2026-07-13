import type { TFunction } from "i18next";
import { formatDateTime } from "./utils";

type RetryAwareRun = {
  status: string;
  retryOfRunId?: string | null;
  scheduledRetryAt?: string | Date | null;
  scheduledRetryAttempt?: number | null;
  scheduledRetryReason?: string | null;
  retryExhaustedReason?: string | null;
};

export type RunRetryStateSummary = {
  kind: "scheduled" | "exhausted" | "attempted";
  badgeLabel: string;
  tone: string;
  detail: string | null;
  secondary: string | null;
  retryOfRunId: string | null;
};

const RETRY_REASON_DEFAULT_LABELS: Record<string, string> = {
  transient_failure: "Transient failure",
  missing_issue_comment: "Missing task comment",
  process_lost: "Process lost",
  assignment_recovery: "Assignment recovery",
  issue_continuation_needed: "Continuation needed",
  max_turns_continuation: "Max-turn continuation",
};

function readNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function joinFragments(parts: Array<string | null>) {
  const filtered = parts.filter((part): part is string => Boolean(part));
  return filtered.length > 0 ? filtered.join(" · ") : null;
}

export function formatRetryReason(reason: string | null | undefined, t?: TFunction) {
  const normalized = readNonEmptyString(reason);
  if (!normalized) return null;
  const defaultValue = RETRY_REASON_DEFAULT_LABELS[normalized] ?? normalized.replace(/_/g, " ");
  return t
    ? t(`common.retryState.reasons.${normalized}`, { defaultValue })
    : defaultValue;
}

function formatAttemptLabel(attempt: number | null, t?: TFunction) {
  if (!attempt) return null;
  return t
    ? t("common.retryState.attempt", { defaultValue: "Attempt {{attempt}}", attempt })
    : `Attempt ${attempt}`;
}

function formatRetryExhaustedReason(reason: string, t?: TFunction) {
  const manualIntervention = t
    ? t("common.retryState.manualInterventionRequired", { defaultValue: "Manual intervention required." })
    : "Manual intervention required.";

  const boundedRetryMatch = reason.match(/^Bounded retry exhausted after (\d+) scheduled attempts; no further automatic retry will be queued$/);
  if (boundedRetryMatch?.[1]) {
    const translated = t
      ? t("common.retryState.boundedRetryExhausted", {
          defaultValue: "Bounded retry exhausted after {{attempts}} scheduled attempts; no further automatic retry will be queued.",
          attempts: Number(boundedRetryMatch[1]),
        })
      : reason;
    return `${translated} ${manualIntervention}`;
  }

  return reason.includes("Manual intervention required")
    ? reason
    : `${reason} ${manualIntervention}`;
}

export function describeRunRetryState(run: RetryAwareRun, t?: TFunction): RunRetryStateSummary | null {
  const attempt =
    typeof run.scheduledRetryAttempt === "number" && Number.isFinite(run.scheduledRetryAttempt) && run.scheduledRetryAttempt > 0
      ? run.scheduledRetryAttempt
      : null;
  const attemptLabel = formatAttemptLabel(attempt, t);
  const reasonLabel = formatRetryReason(run.scheduledRetryReason, t);
  const retryOfRunId = readNonEmptyString(run.retryOfRunId);
  const exhaustedReason = readNonEmptyString(run.retryExhaustedReason);
  const dueAt = run.scheduledRetryAt ? formatDateTime(run.scheduledRetryAt) : null;
  const isMaxTurnContinuation = run.scheduledRetryReason === "max_turns_continuation";
  const hasRetryMetadata =
    Boolean(retryOfRunId)
    || Boolean(reasonLabel)
    || Boolean(dueAt)
    || Boolean(attemptLabel)
    || Boolean(exhaustedReason);

  if (!hasRetryMetadata) return null;

  if (run.status === "scheduled_retry") {
    return {
      kind: "scheduled",
      badgeLabel: isMaxTurnContinuation
        ? t?.("common.retryState.continuationScheduled", { defaultValue: "Continuation scheduled" }) ?? "Continuation scheduled"
        : t?.("common.retryState.retryScheduled", { defaultValue: "Retry scheduled" }) ?? "Retry scheduled",
      tone: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      detail: joinFragments([attemptLabel, reasonLabel]),
      secondary: dueAt
        ? isMaxTurnContinuation
          ? t?.("common.retryState.nextContinuationAt", { defaultValue: "Next continuation {{date}}", date: dueAt }) ?? `Next continuation ${dueAt}`
          : t?.("common.retryState.nextRetryAt", { defaultValue: "Next retry {{date}}", date: dueAt }) ?? `Next retry ${dueAt}`
        : isMaxTurnContinuation
          ? t?.("common.retryState.nextContinuationPending", { defaultValue: "Next continuation pending schedule" }) ?? "Next continuation pending schedule"
          : t?.("common.retryState.nextRetryPending", { defaultValue: "Next retry pending schedule" }) ?? "Next retry pending schedule",
      retryOfRunId,
    };
  }

  if (exhaustedReason) {
    return {
      kind: "exhausted",
      badgeLabel: isMaxTurnContinuation
        ? t?.("common.retryState.continuationExhausted", { defaultValue: "Continuation exhausted" }) ?? "Continuation exhausted"
        : t?.("common.retryState.retryExhausted", { defaultValue: "Retry exhausted" }) ?? "Retry exhausted",
      tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      detail: joinFragments([
        attemptLabel,
        reasonLabel,
        t?.("common.retryState.automaticRetriesExhausted", { defaultValue: "Automatic retries exhausted" }) ?? "Automatic retries exhausted",
      ]),
      secondary: formatRetryExhaustedReason(exhaustedReason, t),
      retryOfRunId,
    };
  }

  return {
    kind: "attempted",
    badgeLabel: isMaxTurnContinuation
      ? t?.("common.retryState.continuedRun", { defaultValue: "Continued run" }) ?? "Continued run"
      : t?.("common.retryState.retriedRun", { defaultValue: "Retried run" }) ?? "Retried run",
    tone: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    detail: joinFragments([attemptLabel, reasonLabel]),
    secondary: null,
    retryOfRunId,
  };
}
