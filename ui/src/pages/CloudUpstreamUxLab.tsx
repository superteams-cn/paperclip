import { useMemo } from "react";
import type { TFunction } from "i18next";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  FileJson,
  History,
  Loader2,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import type {
  CloudUpstreamActivationDecision,
  CloudUpstreamActivationEntityType,
  CloudUpstreamConflict,
  CloudUpstreamConnection,
  CloudUpstreamPreview,
  CloudUpstreamRun,
  CloudUpstreamStep,
  CloudUpstreamSummaryCount,
  CloudUpstreamWarning,
} from "@paperclipai/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n";
import {
  formatCloudUpstreamRunEventMessage,
  formatCloudUpstreamWarningDetail,
  formatCloudUpstreamWarningTitle,
} from "@/lib/api-feedback-format";
import { useLocation } from "@/lib/router";

type FixtureStateKey =
  | "settings-pane"
  | "connect-wizard"
  | "schema-mismatch"
  | "preview"
  | "preview-clean"
  | "progress"
  | "retry"
  | "finish";

const STEPS: CloudUpstreamStep[] = [
  "connect",
  "scan",
  "preview",
  "push",
  "verify",
  "activate",
];

const ACTIVATION_CATEGORIES: Array<{
  key: CloudUpstreamActivationEntityType;
}> = [
  { key: "agents" },
  { key: "routines" },
  { key: "monitors" },
];

const PARSE_ORDER: FixtureStateKey[] = [
  "settings-pane",
  "connect-wizard",
  "schema-mismatch",
  "preview",
  "preview-clean",
  "progress",
  "retry",
  "finish",
];

export function CloudUpstreamUxLab() {
  const location = useLocation();
  const { t } = useTranslation();
  const { state, showChrome } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = (params.get("state") ?? "settings-pane") as FixtureStateKey;
    return {
      state: PARSE_ORDER.includes(raw) ? raw : "settings-pane",
      showChrome: params.get("chrome") === "on",
    };
  }, [location.search]);

  const fixture = useMemo(() => buildFixture(state, t), [state, t]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {showChrome ? <FixtureNav active={state} /> : null}
      <CloudUpstreamRender fixture={fixture} />
    </div>
  );
}

function FixtureNav({ active }: { active: FixtureStateKey }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <div className="mb-1 font-semibold uppercase tracking-wide">
        {t("pages.cloudUpstream.uxLab.navTitle")}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {PARSE_ORDER.map((key) => (
          <a
            key={key}
            href={`?state=${key}`}
            className={
              active === key
                ? "rounded bg-primary/10 px-2 py-0.5 font-medium text-primary"
                : "rounded px-2 py-0.5 hover:bg-accent/40"
            }
          >
            {t(`pages.cloudUpstream.uxLab.fixtures.${key}`)}
          </a>
        ))}
      </div>
    </div>
  );
}

interface Fixture {
  selectedCompanyName: string;
  connection: CloudUpstreamConnection | null;
  preview: CloudUpstreamPreview | null;
  latestRun: CloudUpstreamRun | null;
  history: CloudUpstreamRun[];
  notice: string | null;
  actionError: string | null;
}

function CloudUpstreamRender({ fixture }: { fixture: Fixture }) {
  const { t } = useTranslation();
  const { connection, preview, latestRun, history, notice, actionError, selectedCompanyName } = fixture;
  const activeStep: CloudUpstreamStep = latestRun?.activeStep
    ?? (preview ? "preview" : connection?.tokenStatus === "connected" ? "scan" : "connect");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">{t("pages.cloudUpstream.title")}</h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("pages.cloudUpstream.description", { company: selectedCompanyName })}
          </p>
        </div>
        {connection?.target.origin ? (
          <Button variant="outline" size="sm" asChild>
            <a href={connection.target.origin} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t("pages.cloudUpstream.openCloud")}
            </a>
          </Button>
        ) : null}
      </div>

      {notice ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {notice}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

        <Stepper activeStep={activeStep} />

      <section className="space-y-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("pages.cloudUpstream.connection")}
        </div>
        <div className="rounded-md border border-border px-4 py-4">
          {connection ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <div className="text-sm font-medium">
                  {connection.target.stackDisplayName ?? connection.target.stackSlug ?? connection.target.stackId}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("pages.cloudUpstream.uxLab.connectionMeta", {
                    product: connection.target.product,
                    origin: connection.target.origin,
                    tokenStatus: connection.tokenStatus,
                  })}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {t("pages.cloudUpstream.schemaMaxChunk", {
                    schema: connection.target.schemaMajor,
                    chunk: formatBytes(connection.target.maxChunkBytes),
                  })}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4" />
                {t("pages.cloudUpstream.previewPush")}
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                defaultValue="https://paperclip.paperclip.app/PC521D/dashboard"
                placeholder="https://paperclip.paperclip.app/PC521D/dashboard"
                aria-label={t("pages.cloudUpstream.stackUrlAria")}
                autoFocus
              />
              <Button disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("pages.cloudUpstream.uxLab.discovering")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {preview ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("pages.cloudUpstream.preview")}
            </div>
            <Button disabled={!preview.schemaCompatible}>
              <CloudUpload className="h-4 w-4" />
              {t("pages.cloudUpstream.pushToCloud")}
            </Button>
          </div>
          <SummaryGrid summary={preview.summary} />
          <WarningsPanel warnings={preview.warnings} />
          <ConflictTable conflicts={preview.conflicts} />
        </section>
      ) : null}

      {latestRun ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("pages.cloudUpstream.progressAndFinish")}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <FileJson className="h-4 w-4" />
                {t("pages.cloudUpstream.downloadReport")}
              </Button>
              {latestRun.status === "failed" || latestRun.status === "cancelled" ? (
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4" />
                  {t("common.tryAgain")}
                </Button>
              ) : latestRun.status === "succeeded" ? (
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4" />
                  {t("pages.cloudUpstream.rerun")}
                </Button>
              ) : null}
            </div>
          </div>
          <div className="rounded-md border border-border px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium capitalize">
                  {t(`pages.cloudUpstream.runStatuses.${latestRun.status}`)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("pages.cloudUpstream.uxLab.runMeta", {
                    id: latestRun.id.slice(0, 8),
                    status: latestRun.completedAt
                      ? t("pages.cloudUpstream.completedAt", { date: formatDate(latestRun.completedAt) })
                      : t("pages.cloudUpstream.inProgress"),
                  })}
                </div>
              </div>
              <div className="text-sm tabular-nums">{latestRun.progressPercent}%</div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${latestRun.progressPercent}%` }} />
            </div>
            <div className="mt-4 divide-y divide-border">
              {latestRun.events.map((event) => (
                <div key={event.id} className="grid gap-2 py-2 text-sm sm:grid-cols-[7rem_8rem_1fr]">
                  <span className="text-xs text-muted-foreground">{formatDate(event.at)}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {t(`pages.cloudUpstream.phases.${event.phase}`)}
                  </span>
                  <span>{formatCloudUpstreamRunEventMessage(event, t)}</span>
                </div>
              ))}
            </div>
          </div>

          {latestRun.status === "succeeded" ? <ActivationChecklist run={latestRun} /> : null}
        </section>
      ) : null}

      {history.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            {t("pages.cloudUpstream.history")}
          </div>
          <div className="divide-y divide-border rounded-md border border-border">
            {history.map((run) => (
              <div
                key={run.id}
                className="grid w-full gap-1 px-4 py-3 text-left text-sm hover:bg-accent/40 sm:grid-cols-[1fr_auto]"
              >
                <span>
                  {t("pages.cloudUpstream.historyRun", {
                    id: run.id.slice(0, 8),
                    status: t(`pages.cloudUpstream.runStatuses.${run.status}`),
                  })}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(run.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stepper({ activeStep }: { activeStep: CloudUpstreamStep }) {
  const { t } = useTranslation();
  const activeIndex = STEPS.findIndex((step) => step === activeStep);
  return (
    <div className="grid gap-2 rounded-md border border-border px-3 py-3 sm:grid-cols-6">
      {STEPS.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;
        return (
          <div key={step} className="flex items-center gap-2 text-xs">
            {complete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <span className={active ? "h-4 w-4 rounded-full border-2 border-primary" : "h-4 w-4 rounded-full border border-border"} />
            )}
            <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
              {t(`pages.cloudUpstream.steps.${step}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SummaryGrid({ summary }: { summary: CloudUpstreamSummaryCount[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {summary.map((item) => (
        <div key={item.key} className="rounded-md border border-border px-3 py-2">
          <div className="text-lg font-semibold tabular-nums">{item.count}</div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function WarningsPanel({ warnings }: { warnings: CloudUpstreamWarning[] }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        {t("pages.cloudUpstream.warnings")}
      </div>
      <div className="divide-y divide-border">
        {warnings.map((warning) => (
          <div key={warning.code} className="grid gap-2 py-2 sm:grid-cols-[1.25rem_12rem_1fr]">
            <AlertTriangle className={warning.severity === "blocker" ? "h-4 w-4 text-destructive" : "h-4 w-4 text-amber-600"} />
            <div className="text-sm font-medium">{formatCloudUpstreamWarningTitle(warning, t)}</div>
            <div className="text-sm text-muted-foreground">{formatCloudUpstreamWarningDetail(warning, t)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConflictTable({ conflicts }: { conflicts: CloudUpstreamConflict[] }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <div className="mb-2 text-sm font-medium">{t("pages.cloudUpstream.conflicts")}</div>
      {conflicts.length === 0 ? (
        <div className="text-sm text-muted-foreground">{t("pages.cloudUpstream.noTargetConflicts")}</div>
      ) : (
        <div className="divide-y divide-border">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="grid gap-2 py-2 text-sm sm:grid-cols-[8rem_1fr_1fr_8rem]">
              <span className="text-muted-foreground">
                {t(`pages.cloudUpstream.uxLab.entityTypes.${conflict.entityType}`)}
              </span>
              <span>{conflict.sourceLabel}</span>
              <span>{conflict.targetLabel}</span>
              <span className="capitalize">
                {t(`pages.cloudUpstream.uxLab.plannedActions.${conflict.plannedAction}`)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivationChecklist({ run }: { run: CloudUpstreamRun }) {
  const { t } = useTranslation();
  const rows = buildActivationRows(run, t);
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <div className="mb-2 text-sm font-medium">{t("pages.cloudUpstream.activationChecklist")}</div>
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const activated = row.status === "activated";
          return (
            <div key={row.key} className="grid gap-2 py-2 text-sm sm:grid-cols-[8rem_1fr_auto] sm:items-center">
              <div>
                <div className="font-medium">{t(`pages.cloudUpstream.activation.entities.${row.key}.label`)}</div>
                <div className="text-xs text-muted-foreground">{row.statusLabel}</div>
              </div>
              <div className="text-muted-foreground">
                {row.count === 0
                  ? t("pages.cloudUpstream.activation.noneImported", { entity: row.pluralLabel })
                  : row.detail}
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button variant={activated ? "secondary" : "default"} size="sm" disabled={row.count === 0 || activated}>
                  {activated ? t("pages.cloudUpstream.activated") : t("pages.cloudUpstream.activate")}
                </Button>
                <Button variant="ghost" size="sm" disabled={activated}>
                  {t("pages.cloudUpstream.keepPaused")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildActivationRows(run: CloudUpstreamRun, t: TFunction) {
  const decisions = decisionsFromReport(run.report);
  return ACTIVATION_CATEGORIES.map((category) => {
    const decision = decisions[category.key];
    const count = summaryCount(run.summary, category.key);
    const status = decision?.status === "activated" ? "activated" : "paused";
    const pluralLabel = t(`pages.cloudUpstream.activation.entities.${category.key}.${count === 1 ? "singular" : "plural"}`);
    return {
      ...category,
      count,
      pluralLabel,
      status,
      detail: t("pages.cloudUpstream.activation.pausedDetail", {
        count,
        entity: pluralLabel,
        detail: t(`pages.cloudUpstream.activation.entities.${category.key}.detail`),
      }),
      statusLabel: status === "activated"
        ? t("pages.cloudUpstream.activation.statusActivated", { count })
        : count === 0
          ? t("pages.cloudUpstream.activation.statusImportedZero")
          : t("pages.cloudUpstream.activation.statusPaused", { count }),
    };
  });
}

function decisionsFromReport(report: Record<string, unknown>): Partial<Record<CloudUpstreamActivationEntityType, CloudUpstreamActivationDecision>> {
  const value = optionalRecord(report.activationChecklist);
  const decisions: Partial<Record<CloudUpstreamActivationEntityType, CloudUpstreamActivationDecision>> = {};
  for (const key of ["agents", "routines", "monitors"] as const) {
    const item = optionalRecord(value[key]);
    if (!item) continue;
    decisions[key] = {
      entityType: key,
      count: typeof item.count === "number" ? item.count : 0,
      status: item.status === "activated" ? "activated" : "paused",
      activatedAt: typeof item.activatedAt === "string" ? item.activatedAt : null,
    };
  }
  return decisions;
}

function summaryCount(summary: CloudUpstreamSummaryCount[], key: CloudUpstreamActivationEntityType): number {
  return summary.find((item) => item.key === key)?.count ?? 0;
}

function optionalRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) return `${Math.round(value / (1024 * 1024))} MiB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KiB`;
  return `${value} B`;
}

const STACK_TARGET = {
  stackId: "stk_2vKqz9D8mNFqQ7Rp",
  stackSlug: "paperclip-prod",
  stackDisplayName: "Paperclip Prod",
  companyId: "co_4hT2yX",
  primaryHost: "paperclip.paperclip.app",
  origin: "https://paperclip.paperclip.app",
  product: "paperclip-cloud",
  schemaMajor: 7,
  maxChunkBytes: 5 * 1024 * 1024,
};

const STACK_TARGET_SCHEMA_BEHIND = {
  ...STACK_TARGET,
  schemaMajor: 5,
};

function connectedConnection(target = STACK_TARGET): CloudUpstreamConnection {
  return {
    id: "cu_conn_8d3f1b6a",
    companyId: "co_4hT2yX",
    remoteUrl: "https://paperclip.paperclip.app/PC521D/dashboard",
    target,
    tokenStatus: "connected",
    scopes: ["upstream.push", "upstream.preview"],
    authorizedGlobalUserId: "user_9pXqYzAbCdEf",
    expiresAt: "2026-08-18T19:00:00.000Z",
    createdAt: "2026-05-18T18:45:00.000Z",
    updatedAt: "2026-05-18T19:02:18.000Z",
    lastRunId: null,
  };
}

function previewSummary(t: TFunction): CloudUpstreamSummaryCount[] {
  return [
    { key: "users", label: t("pages.cloudUpstream.uxLab.summary.users"), count: 14 },
    { key: "agents", label: t("pages.cloudUpstream.uxLab.summary.agents"), count: 6 },
    { key: "routines", label: t("pages.cloudUpstream.uxLab.summary.routines"), count: 4 },
    { key: "monitors", label: t("pages.cloudUpstream.uxLab.summary.monitors"), count: 2 },
  ];
}

function previewWarningsNormal(t: TFunction): CloudUpstreamWarning[] {
  return [
    {
      code: "imported_automations_paused",
      severity: "warning",
      title: t("pages.cloudUpstream.uxLab.warnings.automationsPaused.title"),
      detail: t("pages.cloudUpstream.uxLab.warnings.automationsPaused.detail"),
    },
    {
      code: "unmatched_users_import_as_historical_authors",
      severity: "warning",
      title: t("pages.cloudUpstream.uxLab.warnings.historicalAuthors.title"),
      detail: t("pages.cloudUpstream.uxLab.warnings.historicalAuthors.detail"),
    },
    {
      code: "secret_values_redacted",
      severity: "warning",
      title: t("pages.cloudUpstream.uxLab.warnings.secretValues.title"),
      detail: t("pages.cloudUpstream.uxLab.warnings.secretValues.detail"),
    },
  ];
}

function previewWarningsSchema(t: TFunction): CloudUpstreamWarning[] {
  return [
    {
      code: "schema_mismatch",
      severity: "blocker",
      title: t("pages.cloudUpstream.uxLab.warnings.schemaMismatch.title"),
      detail: t("pages.cloudUpstream.uxLab.warnings.schemaMismatch.detail"),
    },
    ...previewWarningsNormal(t),
  ];
}

function previewConflicts(t: TFunction): CloudUpstreamConflict[] {
  return [
    {
      id: "conflict_user_serena",
      entityType: "user",
      sourceLabel: t("pages.cloudUpstream.uxLab.conflictData.serenaSource"),
      targetLabel: t("pages.cloudUpstream.uxLab.conflictData.serenaTarget"),
      plannedAction: "create",
      reason: t("pages.cloudUpstream.uxLab.conflictData.serenaReason"),
    },
    {
      id: "conflict_user_dotta",
      entityType: "user",
      sourceLabel: "dotta@magicmachine.co",
      targetLabel: t("pages.cloudUpstream.uxLab.conflictData.dottaTarget"),
      plannedAction: "update",
      reason: t("pages.cloudUpstream.uxLab.conflictData.dottaReason"),
    },
    {
      id: "conflict_agent_qa",
      entityType: "agent",
      sourceLabel: "QA · qa-bot",
      targetLabel: t("pages.cloudUpstream.uxLab.conflictData.qaTarget"),
      plannedAction: "update",
      reason: t("pages.cloudUpstream.uxLab.conflictData.qaReason"),
    },
    {
      id: "conflict_routine_nightly_reports",
      entityType: "routine",
      sourceLabel: t("pages.cloudUpstream.uxLab.conflictData.nightlySource"),
      targetLabel: t("pages.cloudUpstream.uxLab.conflictData.newInCloud"),
      plannedAction: "create",
      reason: t("pages.cloudUpstream.uxLab.conflictData.nightlyReason"),
    },
  ];
}

function basePreview(t: TFunction): CloudUpstreamPreview {
  return {
    connectionId: "cu_conn_8d3f1b6a",
    sourceCompanyId: "co_local_pc521d",
    target: STACK_TARGET,
    schemaCompatible: true,
    summary: previewSummary(t),
    warnings: previewWarningsNormal(t),
    conflicts: previewConflicts(t),
    generatedAt: "2026-05-18T19:03:14.000Z",
  };
}

function schemaMismatchPreview(t: TFunction): CloudUpstreamPreview {
  return {
    ...basePreview(t),
    target: STACK_TARGET_SCHEMA_BEHIND,
    schemaCompatible: false,
    summary: [],
    conflicts: [],
    warnings: previewWarningsSchema(t),
  };
}

function cleanPreview(t: TFunction): CloudUpstreamPreview {
  return {
    ...basePreview(t),
    conflicts: [],
    warnings: previewWarningsNormal(t).slice(0, 1),
  };
}

function progressEvents(t: TFunction) {
  return [
    { id: "evt_01", at: "2026-05-18T19:10:02.000Z", phase: "scan" as CloudUpstreamStep, type: "completed" as const, message: t("pages.cloudUpstream.uxLab.events.scanned") },
    { id: "evt_02", at: "2026-05-18T19:10:11.000Z", phase: "preview" as CloudUpstreamStep, type: "completed" as const, message: t("pages.cloudUpstream.uxLab.events.previewGenerated") },
    { id: "evt_03", at: "2026-05-18T19:10:31.000Z", phase: "push" as CloudUpstreamStep, type: "created" as const, message: t("pages.cloudUpstream.uxLab.events.usersPushed") },
    { id: "evt_04", at: "2026-05-18T19:10:48.000Z", phase: "push" as CloudUpstreamStep, type: "updated" as const, message: t("pages.cloudUpstream.uxLab.events.agentsPushed") },
    { id: "evt_05", at: "2026-05-18T19:10:58.000Z", phase: "push" as CloudUpstreamStep, type: "updated" as const, message: t("pages.cloudUpstream.uxLab.events.routinesPushed") },
    { id: "evt_06", at: "2026-05-18T19:11:09.000Z", phase: "push" as CloudUpstreamStep, type: "created" as const, message: t("pages.cloudUpstream.uxLab.events.monitorsPushed") },
    { id: "evt_07", at: "2026-05-18T19:11:18.000Z", phase: "verify" as CloudUpstreamStep, type: "updated" as const, message: t("pages.cloudUpstream.uxLab.events.verifyingChecksums") },
  ];
}

function runningRun(t: TFunction): CloudUpstreamRun {
  return {
    id: "run_3kQ8mNpW9bX2zL4Y",
    connectionId: "cu_conn_8d3f1b6a",
    companyId: "co_local_pc521d",
    status: "running",
    activeStep: "push",
    progressPercent: 62,
    dryRun: false,
    summary: previewSummary(t),
    warnings: previewWarningsNormal(t),
    conflicts: previewConflicts(t),
    events: progressEvents(t),
    targetUrl: "https://paperclip.paperclip.app/PC521D/dashboard",
    report: {},
    retryOfRunId: null,
    createdAt: "2026-05-18T19:10:01.000Z",
    updatedAt: "2026-05-18T19:11:18.000Z",
    completedAt: null,
  };
}

function failedRun(t: TFunction): CloudUpstreamRun {
  return {
    id: "run_5fXqR2bT7aD8zP1K",
    connectionId: "cu_conn_8d3f1b6a",
    companyId: "co_local_pc521d",
    status: "failed",
    activeStep: "push",
    progressPercent: 78,
    dryRun: false,
    summary: previewSummary(t),
    warnings: previewWarningsNormal(t),
    conflicts: previewConflicts(t),
    events: [
      ...progressEvents(t),
      {
        id: "evt_08",
        at: "2026-05-18T19:11:30.000Z",
        phase: "push",
        type: "failed",
        message: t("pages.cloudUpstream.uxLab.events.applyRejected"),
      },
    ],
    targetUrl: "https://paperclip.paperclip.app/PC521D/dashboard",
    report: { ledgerCheckpoint: "chunk-3" },
    retryOfRunId: null,
    createdAt: "2026-05-18T19:10:01.000Z",
    updatedAt: "2026-05-18T19:11:30.000Z",
    completedAt: null,
  };
}

function succeededRun(t: TFunction): CloudUpstreamRun {
  return {
    id: "run_7aBcD9eFgH2iJ3kL",
    connectionId: "cu_conn_8d3f1b6a",
    companyId: "co_local_pc521d",
    status: "succeeded",
    activeStep: "activate",
    progressPercent: 100,
    dryRun: false,
    summary: previewSummary(t),
    warnings: previewWarningsNormal(t),
    conflicts: previewConflicts(t),
    events: [
      ...progressEvents(t),
      {
        id: "evt_08",
        at: "2026-05-18T19:11:25.000Z",
        phase: "verify",
        type: "completed",
        message: t("pages.cloudUpstream.uxLab.events.ledgerMatched"),
      },
      {
        id: "evt_09",
        at: "2026-05-18T19:11:31.000Z",
        phase: "activate",
        type: "completed",
        message: t("pages.cloudUpstream.uxLab.events.activationPending"),
      },
    ],
    targetUrl: "https://paperclip.paperclip.app/PC521D/dashboard",
    report: {
      activationChecklist: {
        agents: { count: 6, status: "paused", activatedAt: null },
        routines: { count: 4, status: "paused", activatedAt: null },
        monitors: { count: 2, status: "paused", activatedAt: null },
      },
    },
    retryOfRunId: null,
    createdAt: "2026-05-18T19:10:01.000Z",
    updatedAt: "2026-05-18T19:11:31.000Z",
    completedAt: "2026-05-18T19:11:31.000Z",
  };
}

function buildFixture(state: FixtureStateKey, t: TFunction): Fixture {
  switch (state) {
    case "settings-pane":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(),
        preview: null,
        latestRun: null,
        history: [],
        notice: t("pages.cloudUpstream.connectionApproved"),
        actionError: null,
      };
    case "connect-wizard":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: null,
        preview: null,
        latestRun: null,
        history: [],
        notice: null,
        actionError: null,
      };
    case "schema-mismatch":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(STACK_TARGET_SCHEMA_BEHIND),
        preview: schemaMismatchPreview(t),
        latestRun: null,
        history: [],
        notice: null,
        actionError: t("pages.cloudUpstream.uxLab.schemaMismatchError"),
      };
    case "preview":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(),
        preview: basePreview(t),
        latestRun: null,
        history: [],
        notice: null,
        actionError: null,
      };
    case "preview-clean":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(),
        preview: cleanPreview(t),
        latestRun: null,
        history: [],
        notice: t("pages.cloudUpstream.uxLab.previewCompletedClean"),
        actionError: null,
      };
    case "progress":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(),
        preview: null,
        latestRun: runningRun(t),
        history: [],
        notice: null,
        actionError: null,
      };
    case "retry":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(),
        preview: null,
        latestRun: failedRun(t),
        history: [
          { ...failedRun(t), id: "run_9pYqXwVtSrQ" },
        ],
        notice: null,
        actionError: t("pages.cloudUpstream.uxLab.retryError"),
      };
    case "finish":
      return {
        selectedCompanyName: t("pages.cloudUpstream.uxLab.companyName"),
        connection: connectedConnection(),
        preview: null,
        latestRun: succeededRun(t),
        history: [
          { ...succeededRun(t), id: "run_aZcXvBnMqWeR" },
        ],
        notice: t("pages.cloudUpstream.pushRunCompleted"),
        actionError: null,
      };
  }
}
