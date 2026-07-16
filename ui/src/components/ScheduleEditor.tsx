import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { nextCronFires, parseCronExpression } from "../lib/cron-fires";
import { t as translate } from "@/i18n";

export type SchedulePreset = "every_minute" | "every_hour" | "every_day" | "weekdays" | "weekly" | "monthly" | "custom";

const PRESETS: { value: SchedulePreset }[] = [
  { value: "every_minute" },
  { value: "every_hour" },
  { value: "every_day" },
  { value: "weekdays" },
  { value: "weekly" },
  { value: "monthly" },
  { value: "custom" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({ value: String(i) }));

const MINUTES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i * 5),
  label: String(i * 5).padStart(2, "0"),
}));

const DAYS_OF_WEEK = [
  { value: "1", key: "mon" },
  { value: "2", key: "tue" },
  { value: "3", key: "wed" },
  { value: "4", key: "thu" },
  { value: "5", key: "fri" },
  { value: "6", key: "sat" },
  { value: "0", key: "sun" },
];

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

function hasOption(options: Array<{ value: string }>, value: string): boolean {
  return options.some((option) => option.value === value);
}

export function parseCronToPreset(cron: string): {
  preset: SchedulePreset;
  hour: string;
  minute: string;
  dayOfWeek: string;
  dayOfMonth: string;
} {
  const defaults = { hour: "10", minute: "0", dayOfWeek: "1", dayOfMonth: "1" };

  if (!cron || !cron.trim()) {
    return { preset: "every_day", ...defaults };
  }

  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { preset: "custom", ...defaults };
  }

  const [min, hr, dom, month, dow] = parts;
  const selectableMinute = hasOption(MINUTES, min);
  const selectableHour = hasOption(HOURS, hr);

  // Every minute: "* * * * *"
  if (min === "*" && hr === "*" && dom === "*" && month === "*" && dow === "*") {
    return { preset: "every_minute", ...defaults };
  }

  // Every hour: "0 * * * *"
  if (hr === "*" && dom === "*" && month === "*" && dow === "*" && selectableMinute) {
    return { preset: "every_hour", ...defaults, minute: min };
  }

  // Every day: "M H * * *"
  if (dom === "*" && month === "*" && dow === "*" && selectableHour && selectableMinute) {
    return { preset: "every_day", ...defaults, hour: hr, minute: min };
  }

  // Weekdays: "M H * * 1-5"
  if (dom === "*" && month === "*" && dow === "1-5" && selectableHour && selectableMinute) {
    return { preset: "weekdays", ...defaults, hour: hr, minute: min };
  }

  // Weekly: "M H * * D" (single day)
  if (dom === "*" && month === "*" && hasOption(DAYS_OF_WEEK, dow) && selectableHour && selectableMinute) {
    return { preset: "weekly", ...defaults, hour: hr, minute: min, dayOfWeek: dow };
  }

  // Monthly: "M H D * *"
  if (month === "*" && hasOption(DAYS_OF_MONTH, dom) && dow === "*" && selectableHour && selectableMinute) {
    return { preset: "monthly", ...defaults, hour: hr, minute: min, dayOfMonth: dom };
  }

  return { preset: "custom", ...defaults };
}

export function buildCron(preset: SchedulePreset, hour: string, minute: string, dayOfWeek: string, dayOfMonth: string): string {
  switch (preset) {
    case "every_minute":
      return "* * * * *";
    case "every_hour":
      return `${minute} * * * *`;
    case "every_day":
      return `${minute} ${hour} * * *`;
    case "weekdays":
      return `${minute} ${hour} * * 1-5`;
    case "weekly":
      return `${minute} ${hour} * * ${dayOfWeek}`;
    case "monthly":
      return `${minute} ${hour} ${dayOfMonth} * *`;
    case "custom":
      return "";
  }
}

function describeSchedule(cron: string): string {
  const { preset, hour, minute, dayOfWeek, dayOfMonth } = parseCronToPreset(cron);
  const hourNumber = Number(hour);
  const hour12 = Number.isFinite(hourNumber) ? (hourNumber % 12 || 12) : hour;
  const period = Number.isFinite(hourNumber) && hourNumber >= 12 ? "pm" : "am";
  const timeStr = translate(`components.scheduleEditor.time.${period}`, {
    hour: hour12,
    minute: minute.padStart(2, "0"),
  });

  switch (preset) {
    case "every_minute":
      return translate("components.scheduleEditor.descriptions.everyMinute", { defaultValue: "Every minute" });
    case "every_hour":
      return translate("components.scheduleEditor.descriptions.everyHour", {
        minute: minute.padStart(2, "0"),
        defaultValue: `Every hour at :${minute.padStart(2, "0")}`,
      });
    case "every_day":
      return translate("components.scheduleEditor.descriptions.everyDay", { time: timeStr, defaultValue: `Every day at ${timeStr}` });
    case "weekdays":
      return translate("components.scheduleEditor.descriptions.weekdays", { time: timeStr, defaultValue: `Weekdays at ${timeStr}` });
    case "weekly": {
      const dayKey = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.key;
      const day = dayKey ? translate(`components.scheduleEditor.days.${dayKey}`) : dayOfWeek;
      return translate("components.scheduleEditor.descriptions.weekly", { day, time: timeStr, defaultValue: `Every ${day} at ${timeStr}` });
    }
    case "monthly": {
      const suffix = ordinalSuffix(Number(dayOfMonth));
      const dayLabel = translate(`components.scheduleEditor.descriptions.ordinal.${suffix}`, {
        day: dayOfMonth,
        defaultValue: `${dayOfMonth}${suffix}`,
      });
      return translate("components.scheduleEditor.descriptions.monthly", {
        dayLabel,
        time: timeStr,
        defaultValue: `Monthly on the ${dayOfMonth}${ordinalSuffix(Number(dayOfMonth))} at ${timeStr}`,
      });
    }
    case "custom":
      return cron || translate("components.scheduleEditor.descriptions.none", { defaultValue: "No schedule set" });
  }
}

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export { describeSchedule };

export function getScheduleCronValidation(cron: string): {
  valid: boolean;
  message: string;
  nextFires: Date[];
} {
  const trimmed = cron.trim();
  if (!trimmed) {
    return {
      valid: false,
      message: translate("components.scheduleEditor.validation.required", { defaultValue: "Enter a 5-field cron expression." }),
      nextFires: [],
    };
  }

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    return {
      valid: false,
      message: translate("components.scheduleEditor.validation.fieldCount", { count: fields.length, defaultValue: `Use exactly 5 fields; this has ${fields.length}.` }),
      nextFires: [],
    };
  }

  if (!parseCronExpression(trimmed)) {
    return {
      valid: false,
      message: translate("components.scheduleEditor.validation.invalidFields", { defaultValue: "Cron fields must use valid numbers, ranges, lists, wildcards, or steps." }),
      nextFires: [],
    };
  }

  const nextFires = nextCronFires(trimmed, 3, { timeZone: "UTC" });
  return {
    valid: true,
    message: nextFires.length > 0
      ? translate("components.scheduleEditor.validation.valid", { defaultValue: "Valid cron." })
      : translate("components.scheduleEditor.validation.noUpcomingFires", { defaultValue: "Valid cron, but no upcoming fires were found." }),
    nextFires,
  };
}

export function ScheduleEditor({
  value,
  onChange,
  onValidityChange,
}: {
  value: string;
  onChange: (cron: string) => void;
  onValidityChange?: (valid: boolean) => void;
}) {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseCronToPreset(value), [value]);
  const [preset, setPreset] = useState<SchedulePreset>(parsed.preset);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [dayOfWeek, setDayOfWeek] = useState(parsed.dayOfWeek);
  const [dayOfMonth, setDayOfMonth] = useState(parsed.dayOfMonth);
  const [customCron, setCustomCron] = useState(preset === "custom" ? value : "");
  const customValidation = useMemo(() => getScheduleCronValidation(customCron), [customCron]);

  useEffect(() => {
    onValidityChange?.(preset !== "custom" || customValidation.valid);
  }, [customValidation.valid, onValidityChange, preset]);

  // Sync from external value changes
  useEffect(() => {
    const p = parseCronToPreset(value);
    setPreset(p.preset);
    setHour(p.hour);
    setMinute(p.minute);
    setDayOfWeek(p.dayOfWeek);
    setDayOfMonth(p.dayOfMonth);
    if (p.preset === "custom") setCustomCron(value);
  }, [value]);

  const emitChange = useCallback(
    (p: SchedulePreset, h: string, m: string, dow: string, dom: string, custom: string) => {
      if (p === "custom") {
        onChange(custom);
      } else {
        onChange(buildCron(p, h, m, dow, dom));
      }
    },
    [onChange],
  );

  const handlePresetChange = (newPreset: SchedulePreset) => {
    setPreset(newPreset);
    if (newPreset === "custom") {
      setCustomCron(value);
    } else {
      emitChange(newPreset, hour, minute, dayOfWeek, dayOfMonth, customCron);
    }
  };

  return (
    <div className="space-y-3">
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as SchedulePreset)}>
        <SelectTrigger className="w-full" aria-label={t("components.scheduleEditor.frequencyAria", { defaultValue: "Schedule frequency" })}>
          <SelectValue placeholder={t("components.scheduleEditor.chooseFrequency")} />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {t(`components.scheduleEditor.presets.${p.value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" ? (
        <div className="space-y-1.5">
          <Input
            value={customCron}
            onChange={(e) => {
              const nextCron = e.target.value;
              setCustomCron(nextCron);
              if (getScheduleCronValidation(nextCron).valid) {
                emitChange("custom", hour, minute, dayOfWeek, dayOfMonth, nextCron);
              }
            }}
            placeholder="0 10 * * *"
            aria-label={t("components.scheduleEditor.cronAria", { defaultValue: "Cron expression" })}
            aria-invalid={!customValidation.valid}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("components.scheduleEditor.customHelp")}
          </p>
          <p
            className={customValidation.valid ? "text-xs text-muted-foreground" : "text-xs text-destructive"}
            aria-live="polite"
          >
            {customValidation.message}
            {customValidation.valid && customValidation.nextFires.length > 0
              ? ` ${t("components.scheduleEditor.next", { defaultValue: "Next" })}: ${customValidation.nextFires.map((fire) => fire.toLocaleString()).join(", ")}.`
              : null}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {preset !== "every_minute" && preset !== "every_hour" && (
            <>
              <span className="text-sm text-muted-foreground">{t("components.scheduleEditor.at")}</span>
              <Select
                value={hour}
                onValueChange={(h) => {
                  setHour(h);
                  emitChange(preset, h, minute, dayOfWeek, dayOfMonth, customCron);
                }}
              >
                <SelectTrigger className="w-(--sz-120px)">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {(() => {
                        const hourNumber = Number(h.value);
                        return t(`components.scheduleEditor.hour.${hourNumber >= 12 ? "pm" : "am"}`, {
                          hour: hourNumber % 12 || 12,
                        });
                      })()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">:</span>
              <Select
                value={minute}
                onValueChange={(m) => {
                  setMinute(m);
                  emitChange(preset, hour, m, dayOfWeek, dayOfMonth, customCron);
                }}
              >
                <SelectTrigger className="w-(--sz-80px)">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {preset === "every_hour" && (
            <>
              <span className="text-sm text-muted-foreground">{t("components.scheduleEditor.atMinute")}</span>
              <Select
                value={minute}
                onValueChange={(m) => {
                  setMinute(m);
                  emitChange(preset, hour, m, dayOfWeek, dayOfMonth, customCron);
                }}
              >
                <SelectTrigger className="w-(--sz-80px)">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      :{m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {preset === "weekly" && (
            <>
              <span className="text-sm text-muted-foreground">{t("components.scheduleEditor.on")}</span>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((d) => (
                  <Button
                    key={d.value}
                    type="button"
                    variant={dayOfWeek === d.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    aria-pressed={dayOfWeek === d.value}
                    onClick={() => {
                      setDayOfWeek(d.value);
                      emitChange(preset, hour, minute, d.value, dayOfMonth, customCron);
                    }}
                  >
                    {t(`components.scheduleEditor.days.${d.key}`)}
                  </Button>
                ))}
              </div>
            </>
          )}

          {preset === "monthly" && (
            <>
              <span className="text-sm text-muted-foreground">{t("components.scheduleEditor.onDay")}</span>
              <Select
                value={dayOfMonth}
                onValueChange={(dom) => {
                  setDayOfMonth(dom);
                  emitChange(preset, hour, minute, dayOfWeek, dom, customCron);
                }}
              >
                <SelectTrigger className="w-(--sz-80px)">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_MONTH.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      )}
    </div>
  );
}
