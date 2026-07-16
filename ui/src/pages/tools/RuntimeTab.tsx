import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Loader2, RotateCw, Server, Square } from "lucide-react";
import type {
  ToolConnection,
  ToolRuntimeAlertRecommendation,
  ToolRuntimeMetricSnapshot,
  ToolRuntimeSlot,
} from "@paperclipai/shared";
import { humanizeConnectionDisplayName, isToolConnectionAttentionHealth } from "@paperclipai/shared";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/lib/router";
import { queryKeys } from "@/lib/queryKeys";
import { toolsApi } from "@/api/tools";
import { ApiError } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { EmptyState } from "@/components/EmptyState";
import { t as translate, useTranslation } from "@/i18n";
import { ToolsPageHeader, LoadingState, ErrorState, RelativeTime } from "./shared";

/** Working / Needs attention / Off — the only status vocabulary on this surface. */
type RowStatus = "working" | "attention" | "off";

/**
 * A running-app row: a runtime slot joined to the connection it powers so we can
 * humanize its name and link to its `/apps/:connectionId` page. Status is derived
 * from the connection's health via `isToolConnectionAttentionHealth()` (with a
 * slot-health fallback) so the Apps index, app detail, and Health never disagree.
 */
interface RuntimeRow {
  slot: ToolRuntimeSlot;
  connection: ToolConnection | null;
  name: string;
  isLocal: boolean;
  status: RowStatus;
}

/** A health value that means the runtime slot itself is unhealthy. */
function slotHealthNeedsAttention(health: string | null | undefined): boolean {
  return health === "error" || health === "unhealthy" || health === "failed" || health === "degraded";
}

function rowStatusFor(slot: ToolRuntimeSlot, connection: ToolConnection | null): RowStatus {
  if (slot.status === "stopped" || slot.status === "disabled") return "off";
  if (connection && isToolConnectionAttentionHealth(connection.healthStatus)) return "attention";
  if (slot.status === "failed" || slot.status === "error") return "attention";
  if (slotHealthNeedsAttention(slot.healthStatus)) return "attention";
  return "working";
}

const STATUS_WORD: Record<RowStatus, string> = {
  get working() { return translate("tools.runtime.status.working"); },
  get attention() { return translate("tools.runtime.status.attention"); },
  get off() { return translate("common.off"); },
};

/** Filled dot (working) / triangle (needs attention) / hollow dot (off). */
function StatusMarker({ status }: { status: RowStatus }) {
  if (status === "attention") {
    return <span className="text-amber-600 dark:text-amber-400">▲</span>;
  }
  if (status === "off") {
    return <span className="inline-block h-2.5 w-2.5 rounded-full border border-muted-foreground/50" />;
  }
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />;
}

function humanizeRowName(slot: ToolRuntimeSlot, connection: ToolConnection | null): string {
  if (connection) return humanizeConnectionDisplayName(connection);
  return humanizeConnectionDisplayName(slot.commandTemplateKey ?? slot.providerRef ?? slot.id.slice(0, 8));
}

/** Plain-words latency: "about 1.2s" / "about 240ms" / "—". */
function formatTypicalLatency(ms: number | null | undefined): string {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "—";
  if (ms >= 950) return translate("tools.runtime.aboutSeconds", { value: (ms / 1000).toFixed(1) });
  return translate("tools.runtime.aboutMilliseconds", { value: Math.round(ms) });
}

/** How the slot runs, in plain words. */
function howItRuns(slot: ToolRuntimeSlot): string {
  return slot.runtimeKind === "local_stdio" ? translate("tools.runtime.how.local") : translate("tools.runtime.how.remote");
}

/** Humanize the owner scope into a plain phrase. */
function scopeLabel(scope: string | null | undefined): string {
  switch (scope) {
    case "company":
      return translate("tools.runtime.scope.company");
    case "project":
    case "project_workspace":
      return translate("tools.runtime.scope.project");
    case "execution_workspace":
    case "issue":
      return translate("tools.runtime.scope.task");
    case "agent":
      return translate("tools.runtime.scope.agent");
    default:
      return scope ? scope.replace(/[_-]+/g, " ") : "—";
  }
}

/** Plain-words trust tier — quarantined local code reads as such; remote is provider-side. */
function trustTierLabel(slot: ToolRuntimeSlot): string {
  if (slot.runtimeKind !== "local_stdio") return translate("tools.runtime.trust.providerVerified");
  const quarantined =
    slot.status === "failed" ||
    slot.status === "error" ||
    slot.healthStatus === "error" ||
    slot.healthStatus === "unhealthy";
  return quarantined ? translate("tools.runtime.trust.quarantined") : translate("tools.runtime.trust.localTrusted");
}

/**
 * Plain-language translation for each supervisor alert. The runbook/severity
 * vocabulary stays out of these — it lives in the card's "Technical details".
 * `action` picks the one suggested button: restart the failing app, or a link to
 * the surface where the admin resolves it.
 */
type AlertAction = "restart" | "reviewApps" | "reviewActivity";
const ALERT_COPY: Record<string, { title: string; body: (a: ToolRuntimeAlertRecommendation) => string; action: AlertAction }> = {
  mcp_runtime_stuck_starting_slot: {
    get title() { return translate("tools.runtime.alerts.stuckStarting.title"); },
    body: () => translate("tools.runtime.alerts.stuckStarting.body"),
    action: "restart",
  },
  mcp_runtime_stuck_running_slot: {
    get title() { return translate("tools.runtime.alerts.notResponding.title"); },
    body: () => translate("tools.runtime.alerts.notResponding.body"),
    action: "restart",
  },
  mcp_runtime_high_timeout_rate: {
    get title() { return translate("tools.runtime.alerts.slow.title"); },
    body: (a) => translate("tools.runtime.alerts.slow.body", { observed: a.observed.toLowerCase() }),
    action: "reviewActivity",
  },
  mcp_runtime_high_error_rate: {
    get title() { return translate("tools.runtime.alerts.failures.title"); },
    body: (a) => translate("tools.runtime.alerts.failures.body", { observed: a.observed.toLowerCase() }),
    action: "reviewActivity",
  },
  mcp_runtime_capacity_deferrals_repeated: {
    get title() { return translate("tools.runtime.alerts.capacity.title"); },
    body: (a) => translate("tools.runtime.alerts.capacity.body", { observed: a.observed.toLowerCase() }),
    action: "reviewActivity",
  },
  mcp_runtime_restart_storm: {
    get title() { return translate("tools.runtime.alerts.restarting.title"); },
    body: (a) => translate("tools.runtime.alerts.restarting.body", { observed: a.observed.toLowerCase() }),
    action: "restart",
  },
  mcp_runtime_connection_health_degraded: {
    get title() { return translate("tools.runtime.alerts.reconnect.title"); },
    body: () => translate("tools.runtime.alerts.reconnect.body"),
    action: "reviewApps",
  },
  mcp_runtime_missing_secret_failures: {
    get title() { return translate("tools.runtime.alerts.missingKey.title"); },
    body: () => translate("tools.runtime.alerts.missingKey.body"),
    action: "reviewApps",
  },
  mcp_runtime_audit_write_failures: {
    get title() { return translate("tools.runtime.alerts.logging.title"); },
    body: () => translate("tools.runtime.alerts.logging.body"),
    action: "reviewActivity",
  },
};

function plainAlertTitle(alert: ToolRuntimeAlertRecommendation): string {
  return ALERT_COPY[alert.name]?.title ?? alert.description;
}
function plainAlertBody(alert: ToolRuntimeAlertRecommendation): string {
  return ALERT_COPY[alert.name]?.body(alert) ?? alert.observed;
}
function alertAction(alert: ToolRuntimeAlertRecommendation): AlertAction {
  return ALERT_COPY[alert.name]?.action ?? "reviewActivity";
}

interface ConfirmTarget {
  kind: "stop" | "restart";
  slotId: string;
  name: string;
}

/** One plain-number summary card with an optional ops-vocabulary tooltip. */
function SummaryCard({
  label,
  value,
  note,
  detail,
}: {
  label: string;
  value: string;
  note?: string;
  detail?: string;
}) {
  const labelEl = detail ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help border-b border-dotted border-muted-foreground/40 text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{detail}</TooltipContent>
    </Tooltip>
  ) : (
    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
  );
  return (
    <Card className="py-0">
      <CardContent className="space-y-1.5 px-5 py-4">
        <div>{labelEl}</div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{note ?? " "}</div>
      </CardContent>
    </Card>
  );
}

function LivePill() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          {translate("tools.runtime.live")}
        </span>
      </TooltipTrigger>
      <TooltipContent>{translate("tools.runtime.liveHint")}</TooltipContent>
    </Tooltip>
  );
}

/** Card-level "Technical details" / row-level expander toggle. */
function Disclosure({ open, label }: { open: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
      {label}
    </span>
  );
}

export function RuntimeTab({ companyId }: { companyId: string }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { pushToast } = useToast();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openAlertDetails, setOpenAlertDetails] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);

  const slots = useQuery({
    queryKey: queryKeys.tools.runtimeSlots(companyId),
    queryFn: () => toolsApi.listRuntimeSlots(companyId),
    refetchInterval: 15_000,
  });
  const health = useQuery({
    queryKey: queryKeys.tools.runtimeHealth(companyId),
    queryFn: () => toolsApi.getRuntimeHealth(companyId),
    refetchInterval: 15_000,
  });
  const connections = useQuery({
    queryKey: queryKeys.tools.connections(companyId),
    queryFn: () => toolsApi.listConnections(companyId),
    refetchInterval: 15_000,
  });

  const invalidateRuntime = () => {
    qc.invalidateQueries({ queryKey: queryKeys.tools.runtimeSlots(companyId) });
    qc.invalidateQueries({ queryKey: queryKeys.tools.runtimeHealth(companyId) });
    qc.invalidateQueries({ queryKey: queryKeys.tools.connections(companyId) });
  };

  const stopSlot = useMutation({
    mutationFn: (slotId: string) => toolsApi.stopRuntimeSlot(companyId, slotId),
    onSuccess: () => {
      invalidateRuntime();
      pushToast({ title: t("tools.runtime.toasts.stopped"), tone: "success" });
    },
    onError: (err) =>
      pushToast({ title: t("tools.runtime.toasts.stopFailed"), body: err instanceof ApiError ? err.message : String(err), tone: "error" }),
    onSettled: () => setConfirm(null),
  });

  const restartSlot = useMutation({
    mutationFn: (slotId: string) => toolsApi.restartRuntimeSlot(companyId, slotId),
    onSuccess: () => {
      invalidateRuntime();
      pushToast({ title: t("tools.runtime.toasts.restarted"), tone: "success" });
    },
    onError: (err) =>
      pushToast({ title: t("tools.runtime.toasts.restartFailed"), body: err instanceof ApiError ? err.message : String(err), tone: "error" }),
    onSettled: () => setConfirm(null),
  });

  const rows = useMemo<RuntimeRow[]>(() => {
    const list = slots.data?.runtimeSlots ?? [];
    const byId = new Map((connections.data?.connections ?? []).map((c) => [c.id, c] as const));
    return list.map((slot) => {
      const connection = slot.connectionId ? byId.get(slot.connectionId) ?? null : null;
      return {
        slot,
        connection,
        name: humanizeRowName(slot, connection),
        isLocal: slot.runtimeKind === "local_stdio",
        status: rowStatusFor(slot, connection),
      };
    });
  }, [slots.data, connections.data]);

  if (slots.isLoading || health.isLoading || connections.isLoading) return <LoadingState />;
  if (slots.error || health.error) {
    return (
      <ErrorState
        error={slots.error ?? health.error}
        onRetry={() => {
          slots.refetch();
          health.refetch();
          connections.refetch();
        }}
      />
    );
  }

  const metrics = health.data?.metrics as ToolRuntimeMetricSnapshot | undefined;
  const firingAlerts = (health.data?.alerts ?? []).filter((a) => a.status === "firing");

  const workingCount = rows.filter((r) => r.status === "working").length;
  const attentionCount = rows.filter((r) => r.status === "attention").length;
  const totalCount = rows.length;
  const localAttentionRow = rows.find((r) => r.status === "attention" && r.isLocal) ?? null;

  const errors = (metrics?.toolFailuresLastHour ?? 0) + (metrics?.toolTimeoutsLastHour ?? 0);

  const beginRestart = (row: RuntimeRow) =>
    setConfirm({ kind: "restart", slotId: row.slot.id, name: row.name });
  const beginStop = (row: RuntimeRow) => setConfirm({ kind: "stop", slotId: row.slot.id, name: row.name });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <ToolsPageHeader title={t("tools.runtime.title")} description={t("tools.runtime.description")} />
        <LivePill />
      </div>

      {/* Summary strip — plain words; ops vocabulary lives in tooltips. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label={t("tools.runtime.summary.appsRunning")}
          value={totalCount === 0 ? t("common.none") : t("tools.runtime.summary.workingCount", { working: workingCount, total: totalCount })}
          note={
            totalCount === 0
              ? t("tools.runtime.summary.startOnDemand")
              : attentionCount > 0
                ? t("tools.runtime.summary.needsAttention", { count: attentionCount })
                : t("tools.runtime.summary.allWorking")
          }
        />
        <SummaryCard
          label={t("tools.runtime.summary.typicalResponse")}
          value={formatTypicalLatency(metrics?.averageToolLatencyMsLastHour)}
          note={
            metrics?.averageToolLatencyMsLastHour == null
              ? t("tools.runtime.summary.noCalls")
              : (metrics?.timeoutRateLastHour ?? 0) >= 10
                ? t("tools.runtime.summary.slower")
                : t("tools.runtime.summary.acrossApps")
          }
          detail={t("tools.runtime.summary.latencyDetail", { latency: formatTypicalLatency(metrics?.p95ToolLatencyMsLastHour), rate: metrics?.timeoutRateLastHour ?? 0 })}
        />
        <SummaryCard
          label={t("tools.runtime.summary.errors")}
          value={String(errors)}
          note={errors === 0 ? t("common.none") : t("tools.runtime.summary.acrossYourApps")}
          detail={t("tools.runtime.summary.errorDetail", { failed: metrics?.toolFailuresLastHour ?? 0, timedOut: metrics?.toolTimeoutsLastHour ?? 0, waited: metrics?.capacityDeferralsLastHour ?? 0 })}
        />
      </div>

      {/* Needs-attention cards — one per firing supervisor alert, in plain words. */}
      {firingAlerts.map((alert) => {
        const action = alertAction(alert);
        const detailsOpen = openAlertDetails[alert.name] ?? false;
        return (
          <Card key={alert.name} className="overflow-hidden border-foreground/30 py-0">
            <CardContent className="relative space-y-3 py-4 pl-6">
              <span className="absolute inset-y-0 left-0 w-1.5 bg-foreground" />
              <div>
                <p className="text-base font-bold text-foreground">▲ {plainAlertTitle(alert)}</p>
                <p className="mt-1 max-w-2xl text-sm text-foreground/80">{plainAlertBody(alert)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {action === "restart" && localAttentionRow ? (
                  <Button size="sm" onClick={() => beginRestart(localAttentionRow)}>
                    <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                    {t("tools.runtime.restartApp", { app: localAttentionRow.name })}
                  </Button>
                ) : action === "reviewApps" ? (
                  <Button size="sm" asChild>
                    <Link to="/apps/attention">{t("tools.runtime.reviewApps")}</Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <Link to="/apps/advanced/audit">{t("tools.runtime.reviewActivity")}</Link>
                  </Button>
                )}
                <button
                  type="button"
                  className="text-left"
                  onClick={() => setOpenAlertDetails((s) => ({ ...s, [alert.name]: !detailsOpen }))}
                >
                  <Disclosure open={detailsOpen} label={t("tools.runtime.technicalDetails")} />
                </button>
              </div>
              {detailsOpen ? (
                <dl className="grid grid-cols-1 gap-x-8 gap-y-2 rounded-md bg-muted/40 p-3 text-xs sm:grid-cols-2">
                  <Fact label={t("tools.runtime.details.alert")} value={<span className="font-mono">{alert.name}</span>} />
                  <Fact label={t("tools.runtime.details.severity")} value={alert.severity} />
                  <Fact label={t("tools.runtime.details.threshold")} value={alert.threshold} />
                  <Fact label={t("tools.runtime.details.observed")} value={alert.observed} />
                  <Fact label={t("tools.runtime.details.firstResponder")} value={alert.firstResponderAction} />
                  <Fact label={t("tools.runtime.details.runbook")} value={<span className="font-mono">{alert.runbookSection || health.data?.runbookPath}</span>} />
                </dl>
              ) : null}
            </CardContent>
          </Card>
        );
      })}

      {/* Status table — one row per running app. */}
      {totalCount === 0 ? (
        <EmptyState
          icon={Server}
          message={t("tools.runtime.empty.title")}
          description={t("tools.runtime.empty.description")}
        />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0 py-0">
            <div className="px-5 pb-1 pt-4">
              <h3 className="text-base font-bold text-foreground">{t("tools.runtime.runningApps")}</h3>
              <p className="text-xs text-muted-foreground">{t("tools.runtime.runningAppsHint")}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-2.5">{t("tools.runtime.table.app")}</th>
                  <th className="px-3 py-2.5">{t("common.status")}</th>
                  <th className="px-3 py-2.5">{t("tools.runtime.table.lastUsed")}</th>
                  <th className="px-5 py-2.5 text-right">{t("tools.runtime.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const open = expanded[row.slot.id] ?? false;
                  const busy =
                    (stopSlot.isPending && stopSlot.variables === row.slot.id) ||
                    (restartSlot.isPending && restartSlot.variables === row.slot.id);
                  return (
                    <RuntimeRowView
                      key={row.slot.id}
                      row={row}
                      open={open}
                      busy={busy}
                      onToggle={() => setExpanded((s) => ({ ...s, [row.slot.id]: !open }))}
                      onRestart={() => beginRestart(row)}
                      onStop={() => beginStop(row)}
                    />
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        {t("tools.runtime.remoteHint")}
      </p>

      <ConfirmDialog
        target={confirm}
        pending={stopSlot.isPending || restartSlot.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "restart") restartSlot.mutate(confirm.slotId);
          else stopSlot.mutate(confirm.slotId);
        }}
      />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

function RuntimeRowView({
  row,
  open,
  busy,
  onToggle,
  onRestart,
  onStop,
}: {
  row: RuntimeRow;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onRestart: () => void;
  onStop: () => void;
}) {
  const { slot, connection, name, isLocal, status } = row;
  const canControl = isLocal && status !== "off";
  return (
    <>
      <tr className="cursor-pointer align-middle hover:bg-accent/40" onClick={onToggle}>
        <td className="px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
            <StatusMarker status={status} />
            {connection ? (
              <Link
                to={`/apps/${connection.id}`}
                className="font-semibold text-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {name}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{name}</span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <span className={status === "attention" ? "font-semibold text-foreground" : "text-foreground"}>
            {STATUS_WORD[status]}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <RelativeTime value={slot.lastUsedAt} />
        </td>
        <td className="px-5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
          {isLocal ? (
            <Button size="sm" variant="outline" disabled={busy || status === "off"} onClick={onRestart}>
              {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCw className="mr-1.5 h-3.5 w-3.5" />}
              {translate("tools.runtime.actions.restart")}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">{translate("tools.runtime.providerSide")}</span>
          )}
        </td>
      </tr>
      {open ? (
        <tr className="bg-muted/40">
          <td colSpan={4} className="px-5 py-4">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
              <Fact label={translate("tools.runtime.row.slotKey")} value={<span className="font-mono text-xs">{slot.slotKey ?? slot.commandTemplateKey ?? slot.id}</span>} />
              <Fact label={translate("tools.runtime.row.howItRuns")} value={howItRuns(slot)} />
              <Fact label={translate("tools.runtime.row.processId")} value={slot.processId ?? "—"} />
              <Fact label={translate("tools.runtime.row.scope")} value={scopeLabel(slot.ownerScopeType)} />
              <Fact label={translate("tools.runtime.row.trustTier")} value={trustTierLabel(slot)} />
              <Fact label={translate("tools.runtime.row.started")} value={<RelativeTime value={slot.lastStartedAt ?? slot.startedAt} />} />
            </dl>
            {slot.lastError ? (
              <p className="mt-3 text-xs text-destructive">{translate("tools.runtime.row.lastError", { error: slot.lastError })}</p>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
              {canControl ? (
                <>
                  <Button size="sm" variant="outline" disabled={busy} onClick={onStop}>
                    {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Square className="mr-1.5 h-3.5 w-3.5" fill="currentColor" />}
                    {translate("tools.runtime.actions.stop")}
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={onRestart}>
                    {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCw className="mr-1.5 h-3.5 w-3.5" />}
                    {translate("tools.runtime.actions.restart")}
                  </Button>
                </>
              ) : !isLocal ? (
                <p className="text-xs text-muted-foreground">
                  {translate("tools.runtime.row.remoteNoControl")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{translate("tools.runtime.row.offHint")}</p>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ConfirmDialog({
  target,
  pending,
  onCancel,
  onConfirm,
}: {
  target: ConfirmTarget | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isRestart = target?.kind === "restart";
  return (
    <Dialog open={!!target} onOpenChange={(o) => (!o ? onCancel() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {translate(isRestart ? "tools.runtime.confirm.restartTitle" : "tools.runtime.confirm.stopTitle", { app: target?.name })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-foreground">
          {isRestart ? (
            <>
              <p>
                {translate("tools.runtime.confirm.restartDescription", { app: target?.name })}
              </p>
              <p className="text-xs text-muted-foreground">{translate("tools.runtime.confirm.restartHint")}</p>
            </>
          ) : (
            <>
              <p>
                {translate("tools.runtime.confirm.stopDescription", { app: target?.name })}
              </p>
              <p className="text-xs text-muted-foreground">
                {translate("tools.runtime.confirm.stopHint")}
              </p>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {translate("common.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            {translate(isRestart ? "tools.runtime.actions.restart" : "tools.runtime.actions.stop")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
