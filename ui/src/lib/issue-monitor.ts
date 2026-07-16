import { PROVIDER_QUOTA_MONITOR_SERVICE_NAME } from "@paperclipai/shared";
import type { TFunction } from "i18next";
import { t } from "@/i18n";

export function formatMonitorServiceName(
  serviceName: string,
  translate?: TFunction,
): string {
  if (serviceName !== PROVIDER_QUOTA_MONITOR_SERVICE_NAME) return serviceName;
  return translate?.("components.issueMonitor.serviceNames.providerQuota", {
    defaultValue: PROVIDER_QUOTA_MONITOR_SERVICE_NAME,
  }) ?? PROVIDER_QUOTA_MONITOR_SERVICE_NAME;
}

export function formatMonitorNotes(
  notes: string,
  serviceName: string | null,
  translate?: TFunction,
): string {
  if (serviceName !== PROVIDER_QUOTA_MONITOR_SERVICE_NAME || !translate) return notes;
  const match = notes.match(
    /^Provider usage quota reached; retry (the active review participant|the original assignee) (at the provider reset time|after the default recovery backoff)\.$/,
  );
  if (!match) return notes;
  const targetKey = match[1] === "the active review participant"
    ? "activeReviewParticipant"
    : "originalAssignee";
  const timingKey = match[2] === "at the provider reset time"
    ? "providerResetTime"
    : "defaultRecoveryBackoff";
  return translate?.("components.issueMonitor.serviceDescriptions.providerQuota", {
    target: translate(`components.issueMonitor.providerQuotaTargets.${targetKey}`),
    timing: translate(`components.issueMonitor.providerQuotaTimings.${timingKey}`),
    defaultValue: notes,
  });
}

export function formatMonitorOffset(nextCheckAt: Date | string): string {
  const deltaMs = new Date(nextCheckAt).getTime() - Date.now();
  const absMinutes = Math.round(Math.abs(deltaMs) / 60_000);
  if (absMinutes <= 0) return t("common.time.now", { defaultValue: "now" });
  if (absMinutes < 60) return deltaMs >= 0
    ? t("common.time.inMinutes", { defaultValue: "in {{n}}m", n: absMinutes })
    : t("common.time.minutesAgo", { defaultValue: "{{n}}m ago", n: absMinutes });

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return deltaMs >= 0
    ? t("common.time.inHours", { defaultValue: "in {{n}}h", n: absHours })
    : t("common.time.hoursAgo", { defaultValue: "{{n}}h ago", n: absHours });

  const absDays = Math.round(absHours / 24);
  return deltaMs >= 0
    ? t("common.time.inDays", { defaultValue: "in {{n}}d", n: absDays })
    : t("common.time.daysAgo", { defaultValue: "{{n}}d ago", n: absDays });
}
