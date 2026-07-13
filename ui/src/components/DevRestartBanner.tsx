import { useEffect, useState } from "react";
import { AlertTriangle, RotateCcw, TimerReset } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { healthApi, type DevServerHealthStatus } from "../api/health";
import { Badge } from "@/components/ui/badge";
import { formatApiError } from "../lib/api-error";

const RESTART_PENDING_RESET_MS = 30_000;

function formatRelativeTimestamp(value: string | null, t: TFunction): string | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return null;

  const deltaMs = Date.now() - timestamp;
  if (deltaMs < 60_000) return t("components.devRestart.justNow");
  const deltaMinutes = Math.round(deltaMs / 60_000);
  if (deltaMinutes < 60) return t("components.devRestart.minutesAgo", { count: deltaMinutes });
  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) return t("components.devRestart.hoursAgo", { count: deltaHours });
  const deltaDays = Math.round(deltaHours / 24);
  return t("components.devRestart.daysAgo", { count: deltaDays });
}

function describeReason(devServer: DevServerHealthStatus, t: TFunction): string {
  if (devServer.reason === "backend_changes_and_pending_migrations") {
    return t("components.devRestart.reasons.backendAndMigrations");
  }
  if (devServer.reason === "pending_migrations") {
    return t("components.devRestart.reasons.pendingMigrations");
  }
  return t("components.devRestart.reasons.backendChanged");
}

export function DevRestartBanner({ devServer }: { devServer?: DevServerHealthStatus }) {
  const { t } = useTranslation();
  const [restartPending, setRestartPending] = useState(false);
  useEffect(() => {
    if (!restartPending) return;
    const timeout = window.setTimeout(() => {
      setRestartPending(false);
    }, RESTART_PENDING_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [restartPending]);

  if (!devServer?.enabled || !devServer.restartRequired) return null;

  const currentDevServer = devServer;
  const changedAt = formatRelativeTimestamp(devServer.lastChangedAt, t);
  const sample = devServer.changedPathsSample.slice(0, 3);
  const activeRunLabel = t("components.devRestart.liveRuns", { count: devServer.activeRunCount });

  async function requestRestartNow() {
    const warning =
      currentDevServer.activeRunCount > 0
        ? t("components.devRestart.confirmWithRuns", { activeRunLabel })
        : t("components.devRestart.confirm");
    if (!window.confirm(warning)) return;

    setRestartPending(true);
    try {
      await healthApi.requestDevServerRestart();
    } catch (error) {
      setRestartPending(false);
      window.alert(formatApiError(error, t, t("components.devRestart.requestFailed")));
    }
  }

  return (
    <div className="border-b border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex flex-col gap-3 px-3 py-2.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-(--tracking-caps)">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{t("components.devRestart.title")}</span>
            {devServer.autoRestartEnabled ? (
              <Badge variant="ghost" className="bg-amber-900/10 text-(length:--text-nano) tracking-(--tracking-eyebrow) dark:bg-amber-100/10">
                {t("components.devRestart.autoRestartOn")}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm">
            {describeReason(devServer, t)}
            {changedAt ? t("components.devRestart.updatedAt", { changedAt }) : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-amber-900/80 dark:text-amber-100/75">
            {sample.length > 0 ? (
              <span>
                {t("components.devRestart.changed", { paths: sample.join(", ") })}
                {devServer.changedPathCount > sample.length
                  ? t("components.devRestart.more", { count: devServer.changedPathCount - sample.length })
                  : ""}
              </span>
            ) : null}
            {devServer.pendingMigrations.length > 0 ? (
              <span>
                {t("components.devRestart.pendingMigrations", { migrations: devServer.pendingMigrations.slice(0, 2).join(", ") })}
                {devServer.pendingMigrations.length > 2
                  ? t("components.devRestart.more", { count: devServer.pendingMigrations.length - 2 })
                  : ""}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium md:justify-end">
          {devServer.waitingForIdle ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-3 py-1.5 dark:bg-amber-100/10">
              <TimerReset className="h-3.5 w-3.5" />
              <span>{t("components.devRestart.waitingForRuns", { activeRunLabel })}</span>
            </div>
          ) : devServer.autoRestartEnabled ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-3 py-1.5 dark:bg-amber-100/10">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("components.devRestart.autoRestartIdle")}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-3 py-1.5 dark:bg-amber-100/10">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t("components.devRestart.manualRestartBefore")} <code>pnpm dev:once</code> {t("components.devRestart.manualRestartAfter")}</span>
            </div>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-amber-950 px-3 py-1.5 text-xs font-semibold text-amber-50 transition-colors hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
            onClick={() => {
              void requestRestartNow();
            }}
            disabled={restartPending}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{restartPending ? t("components.devRestart.restartRequested") : t("components.devRestart.restartNow")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
