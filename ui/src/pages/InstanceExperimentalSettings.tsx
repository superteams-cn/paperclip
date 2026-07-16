import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Clock, FlaskConical, Play, Search } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type {
  InstanceExperimentalSettings,
  IssueGraphLivenessAutoRecoveryPreview,
  PatchInstanceExperimentalSettings,
} from "@paperclipai/shared";
import { instanceSettingsApi } from "@/api/instanceSettings";
import { getWorktreeInstanceId, isWorktreeRuntime } from "../lib/worktree-branding";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { formatApiError } from "../lib/api-error";
import { formatIssueGraphLivenessReason } from "../lib/api-feedback-format";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function issueHref(identifier: string | null, issueId: string) {
  if (!identifier) return `/issues/${issueId}`;
  const prefix = identifier.split("-")[0] || "PAP";
  return `/${prefix}/issues/${identifier}`;
}

function formatRecoveryState(state: string, t: TFunction) {
  return t(`pages.instanceExperimental.recoveryStates.${state}`, { defaultValue: state.replace(/_/g, " ") });
}

type WorktreeRunExecutionDisplayState =
  | { kind: "off" }
  | { kind: "armed"; activatedAt: string }
  | { kind: "fail_closed"; reason: "missing_cutoff" | "missing_instance_id" | "instance_mismatch" };

/**
 * Mirror of the server's `resolveWorktreeRunExecutionActivation` fail-closed
 * ladder (server/src/services/instance-settings.ts) so the card never claims a
 * copied/legacy row is arming execution. The derived fields are display-only —
 * the PATCH the toggle sends still writes just the boolean.
 */
function resolveWorktreeRunExecutionDisplayState(
  settings:
    | Pick<
        InstanceExperimentalSettings,
        | "enableWorktreeRunExecution"
        | "worktreeRunExecutionActivatedAt"
        | "worktreeRunExecutionActivationInstanceId"
      >
    | undefined,
  currentInstanceId: string | null,
): WorktreeRunExecutionDisplayState {
  if (settings?.enableWorktreeRunExecution !== true) return { kind: "off" };
  if (!settings.worktreeRunExecutionActivatedAt) return { kind: "fail_closed", reason: "missing_cutoff" };
  if (!currentInstanceId) return { kind: "fail_closed", reason: "missing_instance_id" };
  if (settings.worktreeRunExecutionActivationInstanceId !== currentInstanceId) {
    return { kind: "fail_closed", reason: "instance_mismatch" };
  }
  return { kind: "armed", activatedAt: settings.worktreeRunExecutionActivatedAt };
}

function formatActivationTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// PAP-11233: keep Conference Room code intact, but hide the user-facing opt-in for now.
const SHOW_CONFERENCE_ROOM_EXPERIMENTAL_SETTING = false;

function RecoveryPreviewDialog({
  preview,
  open,
  onOpenChange,
  onEnableOnly,
  onEnableAndRun,
  isPending,
  t,
}: {
  preview: IssueGraphLivenessAutoRecoveryPreview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnableOnly: () => void;
  onEnableAndRun: () => void;
  isPending: boolean;
  t: TFunction;
}) {
  const count = preview?.recoverableFindings ?? 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("pages.instanceExperimental.recovery.confirmTitle")}</DialogTitle>
          <DialogDescription>
            {preview
              ? t("pages.instanceExperimental.recovery.matchSummary", {
                  count,
                  hours: preview.lookbackHours,
                })
              : t("pages.instanceExperimental.recovery.checkingCandidates")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-(--sz-calc-36) space-y-3 overflow-y-auto pr-1">
          {preview && preview.items.length === 0 ? (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              {t("pages.instanceExperimental.recovery.noneNow")}
            </div>
          ) : null}

          {preview?.items.map((item) => (
            <Card key={item.incidentKey} className="block px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={issueHref(item.identifier, item.issueId)}
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  {item.identifier ?? item.issueId}
                </a>
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {formatRecoveryState(item.state, t)}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatIssueGraphLivenessReason(item, t)}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {t("pages.instanceExperimental.recovery.target")}{" "}
                <a
                  href={issueHref(item.recoveryIdentifier, item.recoveryIssueId)}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {item.recoveryIdentifier ?? item.recoveryIssueId}
                </a>
              </div>
            </Card>
          ))}
        </div>

        {preview && preview.skippedOutsideLookback > 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("pages.instanceExperimental.recovery.skippedOutsideLookback", {
              count: preview.skippedOutsideLookback,
            })}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button variant="outline" onClick={onEnableOnly} disabled={isPending || !preview}>
            {t("pages.instanceExperimental.recovery.enableOnly")}
          </Button>
          <Button onClick={onEnableAndRun} disabled={isPending || !preview}>
            {count > 0 ? t("pages.instanceExperimental.recovery.enableAndCreate", { count }) : t("pages.instanceExperimental.recovery.enable")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InstanceExperimentalSettings() {
  const { t } = useTranslation();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [lookbackHoursDraft, setLookbackHoursDraft] = useState("24");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<IssueGraphLivenessAutoRecoveryPreview | null>(null);

  function closeRecoveryPreview() {
    setPreviewDialogOpen(false);
    setPendingPreview(null);
  }

  useEffect(() => {
    setBreadcrumbs([
      { label: t("nav.settings", { defaultValue: "Settings" }), href: "/company/settings" },
      { label: t("nav.instanceSettings", { defaultValue: "Instance settings" }), href: "/company/settings/instance/general" },
      { label: t("nav.experimental", { defaultValue: "Experimental" }) },
    ]);
  }, [setBreadcrumbs, t]);

  const experimentalQuery = useQuery({
    queryKey: queryKeys.instance.experimentalSettings,
    queryFn: () => instanceSettingsApi.getExperimental(),
  });

  const toggleMutation = useMutation<
    InstanceExperimentalSettings,
    Error,
    PatchInstanceExperimentalSettings,
    { previousSettings?: InstanceExperimentalSettings }
  >({
    mutationFn: async (patch: PatchInstanceExperimentalSettings) =>
      instanceSettingsApi.updateExperimental(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.instance.experimentalSettings });
      const previousSettings = queryClient.getQueryData<InstanceExperimentalSettings>(
        queryKeys.instance.experimentalSettings,
      );
      if (previousSettings) {
        queryClient.setQueryData<InstanceExperimentalSettings>(
          queryKeys.instance.experimentalSettings,
          { ...previousSettings, ...patch },
        );
      }
      return { previousSettings };
    },
    onSuccess: async (updatedSettings) => {
      setActionError(null);
      queryClient.setQueryData(queryKeys.instance.experimentalSettings, updatedSettings);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.instance.experimentalSettings }),
        queryClient.invalidateQueries({ queryKey: ["built-in-agents"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      ]);
    },
    onError: (error, _patch, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.instance.experimentalSettings, context.previousSettings);
      }
      setActionError(error instanceof Error ? error.message : t("pages.instanceExperimental.updateFailed", { defaultValue: "Failed to update experimental settings." }));
    },
  });

  const previewMutation = useMutation({
    mutationFn: async (lookbackHours: number) =>
      instanceSettingsApi.previewIssueGraphLivenessAutoRecovery({ lookbackHours }),
    onSuccess: (preview) => {
      setActionError(null);
      setPendingPreview(preview);
      setPreviewDialogOpen(true);
    },
    onError: (error) => {
      setActionError(formatApiError(error, t, t("pages.instanceExperimental.previewFailed")));
    },
  });

  const runRecoveryMutation = useMutation({
    mutationFn: async (lookbackHours: number) =>
      instanceSettingsApi.runIssueGraphLivenessAutoRecovery({ lookbackHours }),
    onSuccess: async () => {
      setActionError(null);
      closeRecoveryPreview();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.instance.experimentalSettings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      ]);
    },
    onError: (error) => {
      setActionError(formatApiError(error, t, t("pages.instanceExperimental.createRecoveryFailed")));
    },
  });

  useEffect(() => {
    const next = experimentalQuery.data?.issueGraphLivenessAutoRecoveryLookbackHours;
    if (typeof next === "number") {
      setLookbackHoursDraft(String(next));
    }
  }, [experimentalQuery.data?.issueGraphLivenessAutoRecoveryLookbackHours]);

  if (experimentalQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">{t("pages.instanceExperimental.loading")}</div>;
  }

  if (experimentalQuery.error) {
    return (
      <div className="text-sm text-destructive">
        {formatApiError(experimentalQuery.error, t, t("pages.instanceExperimental.loadFailed"))}
      </div>
    );
  }

  const inWorktree = isWorktreeRuntime();
  const enableWorktreeRunExecution = experimentalQuery.data?.enableWorktreeRunExecution === true;
  const worktreeRunExecutionState = resolveWorktreeRunExecutionDisplayState(
    experimentalQuery.data,
    getWorktreeInstanceId(),
  );
  const enableEnvironments = experimentalQuery.data?.enableEnvironments === true;
  const enableIsolatedWorkspaces = experimentalQuery.data?.enableIsolatedWorkspaces === true;
  const enableApps = experimentalQuery.data?.enableApps === true;
  // Streamlined left navigation is now the standard sidebar (PAP-12472); the
  // experimental opt-out was retired, so it no longer surfaces a toggle here.
  const enableConferenceRoomChat = experimentalQuery.data?.enableConferenceRoomChat === true;
  const enableIssuePlanDecompositions =
    experimentalQuery.data?.enableIssuePlanDecompositions === true;
  const enableExperimentalFileViewer =
    experimentalQuery.data?.enableExperimentalFileViewer === true;
  const enableTaskWatchdogs = experimentalQuery.data?.enableTaskWatchdogs === true;
  const enableCloudSync = experimentalQuery.data?.enableCloudSync === true;
  const enableExternalObjects = experimentalQuery.data?.enableExternalObjects === true;
  const enableBuiltInAgents = experimentalQuery.data?.enableBuiltInAgents === true;
  const enableDecisions = experimentalQuery.data?.enableDecisions === true;
  const enableGoalsSidebarLink = experimentalQuery.data?.enableGoalsSidebarLink === true;
  const enableCases = experimentalQuery.data?.enableCases === true;
  const enableServerInfoDebugView = experimentalQuery.data?.enableServerInfoDebugView === true;
  const enableSmokeLab = experimentalQuery.data?.enableSmokeLab === true;
  const autoRestartDevServerWhenIdle = experimentalQuery.data?.autoRestartDevServerWhenIdle === true;
  const enableIssueGraphLivenessAutoRecovery =
    experimentalQuery.data?.enableIssueGraphLivenessAutoRecovery === true;
  const lookbackHours =
    experimentalQuery.data?.issueGraphLivenessAutoRecoveryLookbackHours ?? 24;
  const parsedLookbackHours = Number.parseInt(lookbackHoursDraft, 10);
  const lookbackHoursIsValid =
    Number.isInteger(parsedLookbackHours) && parsedLookbackHours >= 1 && parsedLookbackHours <= 720;
  const recoveryActionPending =
    toggleMutation.isPending || previewMutation.isPending || runRecoveryMutation.isPending;

  function previewForEnable() {
    if (!lookbackHoursIsValid) {
      setActionError(t("pages.instanceExperimental.lookbackInvalid"));
      return;
    }
    closeRecoveryPreview();
    previewMutation.mutate(parsedLookbackHours);
  }

  function enableOnly() {
    if (!lookbackHoursIsValid) return;
    closeRecoveryPreview();
    toggleMutation.mutate({
      enableIssueGraphLivenessAutoRecovery: true,
      issueGraphLivenessAutoRecoveryLookbackHours: parsedLookbackHours,
    });
  }

  function enableAndRun() {
    if (!lookbackHoursIsValid) return;
    closeRecoveryPreview();
    toggleMutation.mutate({
      enableIssueGraphLivenessAutoRecovery: true,
      issueGraphLivenessAutoRecoveryLookbackHours: parsedLookbackHours,
    }, {
      onSuccess: () => runRecoveryMutation.mutate(parsedLookbackHours),
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">{t("nav.experimental")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("pages.instanceExperimental.description")}
        </p>
      </div>

      <div
        role="alert"
        className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">{t("pages.instanceExperimental.warningTitle", { defaultValue: "Experimental features may break at any time." })}</p>
            <p className="text-muted-foreground">
              {t("pages.instanceExperimental.warningDescription")}
            </p>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {inWorktree ? (
        <Card className="block p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.worktreeRun.title", { defaultValue: "Run tasks in this worktree" })}</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {t("pages.instanceExperimental.worktreeRun.description")}
                </p>
              </div>
              <ToggleSwitch
                checked={enableWorktreeRunExecution}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ enableWorktreeRunExecution: checked })
                }
                disabled={toggleMutation.isPending}
                aria-label={t("pages.instanceExperimental.worktreeRun.toggle", { defaultValue: "Toggle worktree run execution setting" })}
              />
            </div>

            {worktreeRunExecutionState.kind === "armed" ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-foreground">
                <Play className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  {t("pages.instanceExperimental.worktreeRun.runningAfter", { time: formatActivationTimestamp(worktreeRunExecutionState.activatedAt) })}
                </span>
              </div>
            ) : null}

            {worktreeRunExecutionState.kind === "fail_closed" ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{t("pages.instanceExperimental.worktreeRun.suppressed")}</p>
                  <p className="text-muted-foreground">
                    {worktreeRunExecutionState.reason === "instance_mismatch"
                      ? t("pages.instanceExperimental.worktreeRun.instanceMismatch")
                      : t("pages.instanceExperimental.worktreeRun.missingCutoff")}{" "}
                    {t("pages.instanceExperimental.worktreeRun.rearmHint")}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.apps.title")}</h2>
              <Badge variant="secondary">{t("nav.experimental")}</Badge>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.apps.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableApps}
            onCheckedChange={() => toggleMutation.mutate({ enableApps: !enableApps })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.apps.toggle")}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.cases.title")}</h2>
              <Badge variant="secondary">{t("nav.experimental")}</Badge>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.cases.description")}
            </p>
            <p className="max-w-2xl text-xs text-muted-foreground">
              {t("pages.instanceExperimental.cases.disableHint")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableCases}
            onCheckedChange={() => toggleMutation.mutate({ enableCases: !enableCases })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.cases.toggle", { defaultValue: "Toggle cases experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.environments.title")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.environments.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableEnvironments}
            onCheckedChange={() => toggleMutation.mutate({ enableEnvironments: !enableEnvironments })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.environments.toggle")}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.builtInAgents.title", { defaultValue: "Built-in Agents" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.builtInAgents.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableBuiltInAgents}
            onCheckedChange={() => toggleMutation.mutate({ enableBuiltInAgents: !enableBuiltInAgents })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.builtInAgents.toggle", { defaultValue: "Toggle built-in agents experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.fileViewer.title", { defaultValue: "Experimental File Viewer" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.fileViewer.description", { defaultValue: "Show task detail controls for browsing and previewing workspace files relative to a task." })}
            </p>
          </div>
          <ToggleSwitch
            checked={enableExperimentalFileViewer}
            onCheckedChange={() =>
              toggleMutation.mutate({
                enableExperimentalFileViewer: !enableExperimentalFileViewer,
              })
            }
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.fileViewer.toggle", { defaultValue: "Toggle experimental file viewer setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.externalObjects.title", { defaultValue: "Enable External Objects" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.externalObjects.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableExternalObjects}
            onCheckedChange={() => toggleMutation.mutate({ enableExternalObjects: !enableExternalObjects })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.externalObjects.toggle", { defaultValue: "Toggle external objects experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.decisions.title")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.decisions.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableDecisions}
            onCheckedChange={() => toggleMutation.mutate({ enableDecisions: !enableDecisions })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.decisions.toggle", { defaultValue: "Toggle decisions experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.goalsSidebarLink.title", { defaultValue: "Goals Sidebar Link" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.goalsSidebarLink.description", { defaultValue: "Restore the Goals item in the main sidebar while the goals surface is being evaluated." })}
            </p>
          </div>
          <ToggleSwitch
            checked={enableGoalsSidebarLink}
            onCheckedChange={() => toggleMutation.mutate({ enableGoalsSidebarLink: !enableGoalsSidebarLink })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.goalsSidebarLink.toggle", { defaultValue: "Toggle goals sidebar link experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.workspaces.title")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.workspaces.description", { defaultValue: "Show execution workspace controls in project configuration and allow isolated workspace behavior for new and existing task runs." })}
            </p>
          </div>
          <ToggleSwitch
            checked={enableIsolatedWorkspaces}
            onCheckedChange={() => toggleMutation.mutate({ enableIsolatedWorkspaces: !enableIsolatedWorkspaces })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.workspaces.toggle")}
          />
        </div>
      </Card>

      {SHOW_CONFERENCE_ROOM_EXPERIMENTAL_SETTING ? (
        <Card className="block p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.conferenceRoom.title", { defaultValue: "Conference Room Chat" })}</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {t("pages.instanceExperimental.conferenceRoom.description")}
              </p>
            </div>
            <ToggleSwitch
              checked={enableConferenceRoomChat}
              onCheckedChange={() =>
                toggleMutation.mutate({
                  enableConferenceRoomChat: !enableConferenceRoomChat,
                })
              }
              disabled={toggleMutation.isPending}
              aria-label={t("pages.instanceExperimental.conferenceRoom.toggle", { defaultValue: "Toggle conference room chat experimental setting" })}
            />
          </div>
        </Card>
      ) : null}

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.planDecomposition.title", { defaultValue: "Task Plan Decomposition Panel" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.planDecomposition.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableIssuePlanDecompositions}
            onCheckedChange={() =>
              toggleMutation.mutate({
                enableIssuePlanDecompositions: !enableIssuePlanDecompositions,
              })
            }
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.planDecomposition.toggle", { defaultValue: "Toggle task plan decomposition panel experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.taskWatchdogs.title", { defaultValue: "Task Watchdogs" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.taskWatchdogs.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableTaskWatchdogs}
            onCheckedChange={(checked) =>
              toggleMutation.mutate({
                enableTaskWatchdogs: checked,
              })
            }
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.taskWatchdogs.toggle", { defaultValue: "Toggle task watchdogs experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.cloudSync.title")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.cloudSync.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableCloudSync}
            onCheckedChange={() => toggleMutation.mutate({ enableCloudSync: !enableCloudSync })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.cloudSync.toggle")}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.serverInfoDebug.title", { defaultValue: "Server Info Debug View" })}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.serverInfoDebug.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableServerInfoDebugView}
            onCheckedChange={() =>
              toggleMutation.mutate({
                enableServerInfoDebugView: !enableServerInfoDebugView,
              })
            }
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.serverInfoDebug.toggle", { defaultValue: "Toggle server info debug view experimental setting" })}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.smokeLab.title")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.smokeLab.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={enableSmokeLab}
            onCheckedChange={() => toggleMutation.mutate({ enableSmokeLab: !enableSmokeLab })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.smokeLab.toggle")}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.autoRestart.title")}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("pages.instanceExperimental.autoRestart.description")}
            </p>
          </div>
          <ToggleSwitch
            checked={autoRestartDevServerWhenIdle}
            onCheckedChange={() => toggleMutation.mutate({ autoRestartDevServerWhenIdle: !autoRestartDevServerWhenIdle })}
            disabled={toggleMutation.isPending}
            aria-label={t("pages.instanceExperimental.autoRestart.toggle")}
          />
        </div>
      </Card>

      <Card className="block p-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold">{t("pages.instanceExperimental.recovery.title", { defaultValue: "Auto-Create Recovery Tasks" })}</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {t("pages.instanceExperimental.recovery.description", { defaultValue: "Let the heartbeat scheduler create recovery tasks for task dependency chains found inside the configured lookback window." })}
              </p>
            </div>
            <ToggleSwitch
              checked={enableIssueGraphLivenessAutoRecovery}
              onCheckedChange={() => {
                if (enableIssueGraphLivenessAutoRecovery) {
                  toggleMutation.mutate({ enableIssueGraphLivenessAutoRecovery: false });
                  return;
                }
                previewForEnable();
              }}
              disabled={recoveryActionPending}
              aria-label={t("pages.instanceExperimental.recovery.toggle", { defaultValue: "Toggle task graph liveness auto-recovery" })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-(--gtc-35) sm:items-end">
            <label className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {t("pages.instanceExperimental.recovery.lookbackHours")}
              </span>
              <Input
                type="number"
                min={1}
                max={720}
                step={1}
                value={lookbackHoursDraft}
                onChange={(event) => setLookbackHoursDraft(event.target.value)}
                aria-invalid={!lookbackHoursIsValid}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (!lookbackHoursIsValid) {
                    setActionError(t("pages.instanceExperimental.lookbackInvalid"));
                    return;
                  }
                  toggleMutation.mutate({
                    issueGraphLivenessAutoRecoveryLookbackHours: parsedLookbackHours,
                  });
                }}
                disabled={recoveryActionPending || parsedLookbackHours === lookbackHours}
              >
                {t("pages.instanceExperimental.recovery.saveHours")}
              </Button>
              <Button
                variant="outline"
                onClick={previewForEnable}
                disabled={recoveryActionPending}
              >
                <Search className="h-4 w-4" />
                {t("pages.instanceExperimental.recovery.preview")}
              </Button>
              <Button
                onClick={() => {
                  if (!lookbackHoursIsValid) {
                    setActionError(t("pages.instanceExperimental.lookbackInvalid"));
                    return;
                  }
                  runRecoveryMutation.mutate(parsedLookbackHours);
                }}
                disabled={recoveryActionPending || !enableIssueGraphLivenessAutoRecovery}
              >
                <Play className="h-4 w-4" />
                {t("pages.instanceExperimental.recovery.runNow")}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("pages.instanceExperimental.recovery.currentWindow", { count: lookbackHours })}
          </p>
        </div>
      </Card>

      {previewDialogOpen ? (
        <RecoveryPreviewDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              closeRecoveryPreview();
            }
          }}
          preview={pendingPreview}
          onEnableOnly={enableOnly}
          onEnableAndRun={enableAndRun}
          isPending={recoveryActionPending}
          t={t}
        />
      ) : null}
    </div>
  );
}
