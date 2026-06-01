import { t as translate } from "@/i18n";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.round((now - then) / 1000);

  if (seconds < MINUTE) return translate("common.timeAgo.justNow", { defaultValue: "just now" });
  if (seconds < HOUR) {
    const m = Math.floor(seconds / MINUTE);
    return translate("common.timeAgo.minutesAgo", { count: m, defaultValue: "{{count}}m ago" });
  }
  if (seconds < DAY) {
    const h = Math.floor(seconds / HOUR);
    return translate("common.timeAgo.hoursAgo", { count: h, defaultValue: "{{count}}h ago" });
  }
  if (seconds < WEEK) {
    const d = Math.floor(seconds / DAY);
    return translate("common.timeAgo.daysAgo", { count: d, defaultValue: "{{count}}d ago" });
  }
  if (seconds < MONTH) {
    const w = Math.floor(seconds / WEEK);
    return translate("common.timeAgo.weeksAgo", { count: w, defaultValue: "{{count}}w ago" });
  }
  const mo = Math.floor(seconds / MONTH);
  return translate("common.timeAgo.monthsAgo", { count: mo, defaultValue: "{{count}}mo ago" });
}
