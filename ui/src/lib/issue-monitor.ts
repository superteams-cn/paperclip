import { t } from "@/i18n";

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
