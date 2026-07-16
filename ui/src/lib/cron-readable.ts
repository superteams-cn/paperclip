/**
 * Tiny best-effort cron → plain-English helper for the routine Triggers section.
 * Not a full cron parser: it covers the common shapes Paperclip schedule triggers
 * produce (every N minutes/hours, daily at HH:MM, weekday/weekend, day-of-week).
 * Falls back to the raw expression when it can't confidently describe it.
*/
import type { TFunction } from "i18next";

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function describeTime(minute: string, hour: string): string | null {
  const m = Number(minute);
  const h = Number(hour);
  if (!Number.isInteger(m) || !Number.isInteger(h)) return null;
  if (m < 0 || m > 59 || h < 0 || h > 23) return null;
  return `${pad2(h)}:${pad2(m)}`;
}

function describeDayOfWeek(dow: string, t?: TFunction): string | null {
  if (dow === "*" || dow === "?") return t?.("components.routineTriggerCard.cron.everyDay", { defaultValue: "every day" }) ?? "every day";
  if (dow === "1-5") return t?.("components.routineTriggerCard.cron.everyWeekday", { defaultValue: "every weekday" }) ?? "every weekday";
  if (dow === "0,6" || dow === "6,0" || dow === "0,7") return t?.("components.routineTriggerCard.cron.everyWeekend", { defaultValue: "every weekend" }) ?? "every weekend";
  const parts = dow.split(",").map((part) => part.trim());
  const names = parts.map((part) => {
    const n = Number(part);
    if (!Number.isInteger(n)) return null;
    const fallback = DOW_NAMES[n % 7];
    return t?.(`components.routineTriggerCard.cron.weekdays.${fallback.toLowerCase()}`, { defaultValue: fallback }) ?? fallback;
  });
  if (names.some((name) => name === null)) return null;
  if (names.length === 1) {
    return t?.("components.routineTriggerCard.cron.everyNamedDay", {
      defaultValue: "every {{day}}",
      day: names[0],
    }) ?? `every ${names[0]}`;
  }
  const leadingDays = names.slice(0, -1).join(t?.("components.routineTriggerCard.cron.daySeparator", { defaultValue: ", " }) ?? ", ");
  const lastDay = names[names.length - 1];
  return t?.("components.routineTriggerCard.cron.everyNamedDays", {
    defaultValue: "every {{days}} and {{lastDay}}",
    days: leadingDays,
    lastDay,
  }) ?? `every ${names.slice(0, -1).join(", ")} and ${lastDay}`;
}

export function describeCron(expression: string | null | undefined, t?: TFunction): string | null {
  if (!expression) return null;
  const trimmed = expression.trim();
  const fields = trimmed.split(/\s+/);
  // Standard 5-field cron: minute hour day-of-month month day-of-week
  if (fields.length !== 5) return null;
  const [minute, hour, dom, month, dow] = fields;

  // Every N minutes
  const everyMinutes = minute.match(/^\*\/(\d+)$/);
  if (everyMinutes && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return t?.("components.routineTriggerCard.cron.everyMinutes", {
      defaultValue: "Every {{count}} minutes",
      count: everyMinutes[1],
    }) ?? `Every ${everyMinutes[1]} minutes`;
  }

  // Every N hours, on the minute
  const everyHours = hour.match(/^\*\/(\d+)$/);
  if (everyHours && /^\d+$/.test(minute) && dom === "*" && month === "*" && dow === "*") {
    const minuteText = `:${pad2(Number(minute))}`;
    return t?.("components.routineTriggerCard.cron.everyHoursAt", {
      defaultValue: "Every {{count}} hours at {{minute}}",
      count: everyHours[1],
      minute: minuteText,
    }) ?? `Every ${everyHours[1]} hours at ${minuteText}`;
  }

  // Hourly
  if (/^\d+$/.test(minute) && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    const minuteText = `:${pad2(Number(minute))}`;
    return t?.("components.routineTriggerCard.cron.everyHourAt", {
      defaultValue: "Every hour at {{minute}}",
      minute: minuteText,
    }) ?? `Every hour at ${minuteText}`;
  }

  // Daily / weekly at a fixed time
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && month === "*") {
    const time = describeTime(minute, hour);
    if (!time) return null;
    if (dom === "*" && (dow === "*" || dow === "?")) {
      return t?.("components.routineTriggerCard.cron.everyDayAt", {
        defaultValue: "Every day at {{time}}",
        time,
      }) ?? `Every day at ${time}`;
    }
    if (dom === "*") {
      const dowText = describeDayOfWeek(dow, t);
      if (dowText) {
        if (t) return t("components.routineTriggerCard.cron.scheduleAt", { defaultValue: "{{schedule}} at {{time}}", schedule: dowText, time });
        return `${dowText[0].toUpperCase()}${dowText.slice(1)} at ${time}`;
      }
    }
    if (/^\d+$/.test(dom) && (dow === "*" || dow === "?")) {
      return t?.("components.routineTriggerCard.cron.dayOfMonthAt", {
        defaultValue: "Day {{day}} of every month at {{time}}",
        day: dom,
        time,
      }) ?? `Day ${dom} of every month at ${time}`;
    }
  }

  return null;
}
