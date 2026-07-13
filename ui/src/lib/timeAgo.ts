import { t } from "@/i18n";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.round((now - then) / 1000);

  if (seconds < MINUTE) return t("common.time.justNow", { defaultValue: "just now" });
  if (seconds < HOUR) {
    const m = Math.floor(seconds / MINUTE);
    return t("common.time.minutesAgo", { defaultValue: "{{n}}m ago", n: m });
  }
  if (seconds < DAY) {
    const h = Math.floor(seconds / HOUR);
    return t("common.time.hoursAgo", { defaultValue: "{{n}}h ago", n: h });
  }
  if (seconds < WEEK) {
    const d = Math.floor(seconds / DAY);
    return t("common.time.daysAgo", { defaultValue: "{{n}}d ago", n: d });
  }
  if (seconds < MONTH) {
    const w = Math.floor(seconds / WEEK);
    return t("common.time.weeksAgo", { defaultValue: "{{n}}w ago", n: w });
  }
  const mo = Math.floor(seconds / MONTH);
  return t("common.time.monthsAgo", { defaultValue: "{{n}}mo ago", n: mo });
}
