import type {
  AgentWakeupSkipped,
  CloudUpstreamPreview,
  CloudUpstreamRunEvent,
  CompanySecretProviderConfig,
  CompanySkillProjectScanConflict,
  CompanySkillUpdateStatus,
  ExecutionWorkspaceCloseAction,
  IssueGraphLivenessAutoRecoveryPreviewItem,
  IssueRetryNowResponse,
  IssueTreePreviewWarning,
  RemoteSecretImportConflict,
  SecretProviderConfigHealthResponse,
} from "@paperclipai/shared";
import type { TFunction } from "i18next";
import type { PluginLocalFolderProblem } from "@/api/plugins";
import type { SecretProviderHealthResponse } from "@/api/secrets";

type CloudUpstreamWarning = CloudUpstreamPreview["warnings"][number];
type CloudUpstreamConflict = CloudUpstreamPreview["conflicts"][number];

export function formatPluginHealthCheckName(name: string, t: TFunction): string {
  return t(`common.apiFeedback.pluginHealth.${name}`, {
    defaultValue: name.replaceAll("_", " "),
  });
}

export function formatPluginLocalFolderProblem(problem: PluginLocalFolderProblem, t: TFunction): string {
  return t(`common.apiFeedback.pluginLocalFolderProblems.${problem.code}`, {
    defaultValue: problem.message,
  });
}

export function formatIssueTreePreviewWarning(warning: IssueTreePreviewWarning, t: TFunction): string {
  return t(`common.apiFeedback.issueTreeWarnings.${warning.code}`, {
    defaultValue: warning.message,
  });
}

export function formatCloudUpstreamWarningTitle(warning: CloudUpstreamWarning, t: TFunction): string {
  return t(`common.apiFeedback.cloudUpstreamWarnings.${warning.code}.title`, {
    defaultValue: warning.title,
  });
}

export function formatCloudUpstreamWarningDetail(warning: CloudUpstreamWarning, t: TFunction): string {
  return t(`common.apiFeedback.cloudUpstreamWarnings.${warning.code}.detail`, {
    defaultValue: warning.detail,
  });
}

export function formatCloudUpstreamRunEventMessage(event: CloudUpstreamRunEvent, t: TFunction): string {
  const message = event.message.trim();
  const chunksMatch = message.match(/^Uploaded (\d+) manifest chunks?\.$/);
  if (chunksMatch?.[1]) {
    return t("common.apiFeedback.cloudUpstreamEvents.manifestChunksUploaded", {
      defaultValue: "Uploaded {{count}} manifest chunks.",
      count: Number(chunksMatch[1]),
    });
  }

  const retryMatch = message.match(/^Retrying run (.+?) with the same import ledger idempotency key\.$/);
  if (retryMatch?.[1]) {
    return t("common.apiFeedback.cloudUpstreamEvents.retryingRun", {
      defaultValue: "Retrying run {{runId}} with the same import ledger idempotency key.",
      runId: retryMatch[1],
    });
  }

  const activatedMatch = message.match(/^Activated (\d+) imported (.+)\.$/);
  if (activatedMatch?.[1] && activatedMatch[2]) {
    return t("common.apiFeedback.cloudUpstreamEvents.activatedImported", {
      defaultValue: "Activated {{count}} imported {{label}}.",
      count: Number(activatedMatch[1]),
      label: activatedMatch[2],
    });
  }

  if (message.startsWith("Cloud importer ")) {
    return t("common.apiFeedback.cloudUpstreamEvents.cloudImporterUpdated", {
      defaultValue: "Cloud importer reported progress.",
    });
  }

  const knownKey = [
    ["Connected to the target Paperclip Cloud stack.", "connected"],
    ["Scanned the local company inventory.", "scannedInventory"],
    ["Generated the transfer manifest.", "generatedManifest"],
    ["Created or resumed the cloud import ledger run.", "createdLedgerRun"],
    ["Pushed mapped objects without duplicate creation.", "pushedMappedObjects"],
    ["Verified the cloud import ledger and generated a run report.", "verifiedLedger"],
    ["Activation checklist is ready for manual unpause decisions.", "activationChecklistReady"],
    ["Push cancelled locally before remote apply completed.", "pushCancelledLocally"],
    [
      "Marked failed on server startup because the previous process stopped while the cloud upstream run was in progress.",
      "markedFailedOnStartup",
    ],
  ].find(([known]) => known === message)?.[1];

  if (knownKey) {
    return t(`common.apiFeedback.cloudUpstreamEvents.${knownKey}`, {
      defaultValue: event.message,
    });
  }

  return event.message;
}

export function formatCloudUpstreamConflictEntityType(conflict: CloudUpstreamConflict, t: TFunction): string {
  const normalized = conflict.entityType.trim().replaceAll("-", "_");
  return t(`common.apiFeedback.cloudUpstreamConflicts.entityTypes.${normalized}`, {
    defaultValue: conflict.entityType,
  });
}

export function formatCloudUpstreamConflictPlannedAction(conflict: CloudUpstreamConflict, t: TFunction): string {
  return t(`common.apiFeedback.cloudUpstreamConflicts.plannedActions.${conflict.plannedAction}`, {
    defaultValue: conflict.plannedAction,
  });
}

export function formatSecretProviderHealthMessage(
  entry: SecretProviderHealthResponse["providers"][number],
  t: TFunction,
): string {
  const code = typeof entry.details?.code === "string" ? entry.details.code : null;
  if (code) {
    return t(`common.apiFeedback.secretProviderHealth.${code}`, {
      defaultValue: entry.message,
    });
  }
  if (entry.status === "ok") {
    return t("common.apiFeedback.secretProviderHealth.provider_ready", {
      defaultValue: entry.message,
    });
  }
  return entry.message;
}

export function formatSecretProviderConfigHealthMessage(config: CompanySecretProviderConfig, t: TFunction): string | null {
  const message = config.healthMessage;
  const code = config.healthDetails?.code;
  if (code) {
    return t(`common.apiFeedback.secretProviderHealth.${code}`, {
      defaultValue: message ?? config.healthDetails?.message ?? "",
    });
  }
  if (config.healthStatus === "ready") {
    return t("common.apiFeedback.secretProviderHealth.provider_ready", {
      defaultValue: message ?? "Provider vault is ready.",
    });
  }
  return message;
}

export function formatSecretProviderConfigHealthResponseMessage(
  response: SecretProviderConfigHealthResponse,
  t: TFunction,
): string {
  const code = response.details?.code;
  if (code) {
    return t(`common.apiFeedback.secretProviderHealth.${code}`, {
      defaultValue: response.message,
    });
  }
  if (response.status === "ready") {
    return t("common.apiFeedback.secretProviderHealth.provider_ready", {
      defaultValue: response.message,
    });
  }
  return response.message;
}

export function formatSecretProviderHealthGuidance(guidance: string, t: TFunction): string {
  const knownKey = [
    [
      "Draft metadata may be saved, but create, rotate, and resolve stay unavailable.",
      "draftMetadataOnly",
    ],
  ].find(([known]) => known === guidance)?.[1];
  if (!knownKey) return guidance;
  return t(`common.apiFeedback.secretProviderGuidance.${knownKey}`, {
    defaultValue: guidance,
  });
}

export function formatSecretProviderDiscoveryWarning(warning: string, t: TFunction): string {
  const knownKey = [
    [
      "No stable namespace signal was found in the sampled AWS secret names or tags.",
      "noStableNamespace",
    ],
    [
      "No common environment tag was found in the sampled AWS secrets.",
      "noCommonEnvironmentTag",
    ],
    [
      "No common owner/team tag was found in the sampled AWS secrets.",
      "noCommonOwnerTag",
    ],
    [
      "Sampled AWS secrets use multiple KMS keys; choose the intended KMS key before saving.",
      "multipleKmsKeys",
    ],
    [
      "Sample includes Paperclip-managed secrets for this company; do not import them as external references.",
      "paperclipManagedSamples",
    ],
    [
      "AWS Secrets Manager returned no metadata samples for this draft provider vault config.",
      "noMetadataSamples",
    ],
    [
      "Additional AWS secret name groups were omitted from this preview; refine the query to inspect them.",
      "additionalGroupsOmitted",
    ],
  ].find(([known]) => known === warning.trim())?.[1];

  if (!knownKey) return warning;
  return t(`common.apiFeedback.secretProviderDiscoveryWarnings.${knownKey}`, {
    defaultValue: warning,
  });
}

export function formatRemoteSecretImportConflict(conflict: RemoteSecretImportConflict, t: TFunction): string {
  if (conflict.type === "exact_reference") {
    return t("common.apiFeedback.remoteSecretImportConflicts.exact_reference", {
      defaultValue: "An existing secret already links this exact provider reference.",
    });
  }
  if (conflict.type === "name") {
    const name = conflict.message.match(/^Secret name already exists: (.+)$/)?.[1] ?? "";
    return t("common.apiFeedback.remoteSecretImportConflicts.name", {
      defaultValue: "Secret name already exists{{name}}.",
      name: name ? `: ${name}` : "",
    });
  }
  if (conflict.type === "key") {
    const key = conflict.message.match(/^Secret key already exists: (.+)$/)?.[1] ?? "";
    return t("common.apiFeedback.remoteSecretImportConflicts.key", {
      defaultValue: "Secret key already exists{{key}}.",
      key: key ? `: ${key}` : "",
    });
  }
  if (conflict.type === "provider_guardrail") {
    return t("common.apiFeedback.remoteSecretImportConflicts.provider_guardrail", {
      defaultValue: "Provider rejected this external reference.",
    });
  }
  return conflict.message;
}

export function formatCompanySkillUpdateReason(status: CompanySkillUpdateStatus, t: TFunction): string | null {
  const reason = status.reason?.trim();
  if (!reason) return null;
  const knownKey = [
    ["Only GitHub-managed skills support update checks.", "githubManagedOnly"],
    ["This GitHub skill does not have enough metadata to track updates.", "missingTrackingMetadata"],
  ].find(([known]) => known === reason)?.[1];
  if (!knownKey) return reason;
  return t(`common.apiFeedback.companySkills.updateStatus.${knownKey}`, {
    defaultValue: reason,
  });
}

export function formatAgentSkillSnapshotWarning(warning: string, t: TFunction): string {
  if (warning.trim() === "This adapter does not implement skill sync yet.") {
    return t("common.apiFeedback.agentSkillSnapshotWarnings.skillSyncUnsupported", {
      defaultValue: warning,
    });
  }
  return warning;
}

export function formatCompanySkillProjectScanConflict(
  conflict: CompanySkillProjectScanConflict,
  t: TFunction,
): string {
  const keyMatch = conflict.reason.match(/^Skill key (.+) already points at (.+)\.$/);
  if (keyMatch?.[1] && keyMatch[2]) {
    return t("common.apiFeedback.companySkills.scanConflicts.skillKeyAlreadyPointsAt", {
      defaultValue: "Skill key {{key}} already points at {{source}}.",
      key: keyMatch[1],
      source: keyMatch[2],
    });
  }

  const slugMatch = conflict.reason.match(/^Slug (.+) is already in use by (.+)\.$/);
  if (slugMatch?.[1] && slugMatch[2]) {
    return t("common.apiFeedback.companySkills.scanConflicts.slugAlreadyInUse", {
      defaultValue: "Slug {{slug}} is already in use by {{source}}.",
      slug: slugMatch[1],
      source: slugMatch[2],
    });
  }

  return conflict.reason;
}

export function formatCompanySkillProjectScanWarning(warning: string, t: TFunction): string {
  const missingPathMatch = warning.match(/^Skipped (.+) \/ (.+): no local workspace path is configured\.$/);
  if (missingPathMatch?.[1] && missingPathMatch[2]) {
    return t("common.apiFeedback.companySkills.scanWarnings.noLocalWorkspacePath", {
      defaultValue: "Skipped {{project}} / {{workspace}}: no local workspace path is configured.",
      project: missingPathMatch[1],
      workspace: missingPathMatch[2],
    });
  }

  const unavailablePathMatch = warning.match(/^Skipped (.+) \/ (.+): local workspace path is not available at (.+)\.$/);
  if (unavailablePathMatch?.[1] && unavailablePathMatch[2] && unavailablePathMatch[3]) {
    return t("common.apiFeedback.companySkills.scanWarnings.workspacePathUnavailable", {
      defaultValue: "Skipped {{project}} / {{workspace}}: local workspace path is not available at {{path}}.",
      project: unavailablePathMatch[1],
      workspace: unavailablePathMatch[2],
      path: unavailablePathMatch[3],
    });
  }

  const skippedDirMatch = warning.match(/^Skipped (.+): (.+)$/);
  if (skippedDirMatch?.[1] && skippedDirMatch[2]) {
    return t("common.apiFeedback.companySkills.scanWarnings.directorySkipped", {
      defaultValue: "Skipped {{path}}: {{reason}}",
      path: skippedDirMatch[1],
      reason: skippedDirMatch[2],
    });
  }

  return warning;
}

function formatCompanyPortabilityWarningReason(reason: string, t: TFunction): string {
  const knownKey = [
    ["it is not an object", "notObject"],
    ["it has no body", "missingBody"],
    ["it is system-dependent", "systemDependent"],
    ["it contains system-dependent paths", "systemDependentPaths"],
  ].find(([known]) => known === reason)?.[1];
  if (!knownKey) return reason;
  return t(`common.apiFeedback.companyPortabilityWarnings.reasons.${knownKey}`, {
    defaultValue: reason,
  });
}

function formatCompanyPortabilityMetadata(metadata: string, t: TFunction): string {
  return t(`common.apiFeedback.companyPortabilityWarnings.metadata.${metadata}`, {
    defaultValue: metadata,
  });
}

function formatCompanyPortabilityKind(kind: string, t: TFunction): string {
  const normalized = kind.trim().toLowerCase().replaceAll(" ", "_");
  return t(`common.apiFeedback.companyPortabilityWarnings.kinds.${normalized}`, {
    defaultValue: kind,
  });
}

function formatCompanyPortabilityLogoAction(action: string, t: TFunction): string {
  return t(`common.apiFeedback.companyPortabilityWarnings.logoActions.${action}`, {
    defaultValue: action,
  });
}

function formatCompanyPortabilityRoutineReason(reason: string, t: TFunction): string {
  const unsupportedFrequencyMatch = reason.match(/^uses unsupported legacy recurrence frequency "(.+)"$/);
  if (unsupportedFrequencyMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineReasons.unsupportedFrequency", {
      defaultValue: "uses unsupported legacy recurrence frequency \"{{frequency}}\"",
      frequency: unsupportedFrequencyMatch[1],
    });
  }
  const key = [
    ["uses legacy recurrence without frequency", "missingFrequency"],
    ["uses legacy recurrence with an invalid interval", "invalidInterval"],
    ["has an invalid legacy startsAt/timezone combination", "invalidStartsAtTimezone"],
    ["uses legacy recurrence with an invalid time", "invalidTime"],
    ["uses unsupported legacy daily recurrence constraints", "unsupportedDailyConstraints"],
    ["uses legacy weekly recurrence with interval > 1", "weeklyIntervalTooLarge"],
    ["uses legacy weekly recurrence without weekdays", "weeklyMissingWeekdays"],
    ["uses legacy monthly recurrence with interval > 1", "monthlyIntervalTooLarge"],
    ["uses legacy ordinal monthly recurrence", "ordinalMonthlyUnsupported"],
    ["uses legacy monthly recurrence without monthDays", "monthlyMissingMonthDays"],
    ["uses legacy yearly recurrence with interval > 1", "yearlyIntervalTooLarge"],
    ["uses legacy yearly recurrence without month/monthDay anchors", "yearlyMissingAnchors"],
  ].find(([known]) => known === reason)?.[1];
  if (!key) return reason;
  return t(`common.apiFeedback.companyPortabilityErrors.routineReasons.${key}`, {
    defaultValue: reason,
  });
}

export function formatCompanyPortabilityWarning(warning: string, t: TFunction): string {
  const pathOverrideMatch = warning.match(/^(.+) PATH override was omitted from export because it is system-dependent\.$/);
  if (pathOverrideMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.pathOverrideOmitted", {
      defaultValue: "{{scope}} PATH override was omitted from export because it is system-dependent.",
      scope: pathOverrideMatch[1],
    });
  }

  const envDefaultMatch = warning.match(/^(.+) env (.+) default was exported as system-dependent\.$/);
  if (envDefaultMatch?.[1] && envDefaultMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.envDefaultSystemDependent", {
      defaultValue: "{{scope}} env {{key}} default was exported as system-dependent.",
      scope: envDefaultMatch[1],
      key: envDefaultMatch[2],
    });
  }

  const commandOmittedMatch = warning.match(/^Agent (.+) command (.+) was omitted from export because it is system-dependent\.$/);
  if (commandOmittedMatch?.[1] && commandOmittedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.agentCommandOmitted", {
      defaultValue: "Agent {{agent}} command {{command}} was omitted from export because it is system-dependent.",
      agent: commandOmittedMatch[1],
      command: commandOmittedMatch[2],
    });
  }

  const commentsIgnoredMatch = warning.match(/^(.+) comments were ignored because they are not an array\.$/);
  if (commentsIgnoredMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.commentsNotArray", {
      defaultValue: "{{source}} comments were ignored because they are not an array.",
      source: commentsIgnoredMatch[1],
    });
  }

  const commentIgnoredMatch = warning.match(/^(.+) comment (\d+) was ignored because (.+)\.$/);
  if (commentIgnoredMatch?.[1] && commentIgnoredMatch[2] && commentIgnoredMatch[3]) {
    return t("common.apiFeedback.companyPortabilityWarnings.commentIgnored", {
      defaultValue: "{{source}} comment {{index}} was ignored because {{reason}}.",
      source: commentIgnoredMatch[1],
      index: commentIgnoredMatch[2],
      reason: formatCompanyPortabilityWarningReason(commentIgnoredMatch[3], t),
    });
  }

  const commentMetadataMatch = warning.match(/^(.+) comment (\d+) has invalid (presentation|hidden) metadata and was ignored\.$/);
  if (commentMetadataMatch?.[1] && commentMetadataMatch[2] && commentMetadataMatch[3]) {
    return t("common.apiFeedback.companyPortabilityWarnings.commentMetadataIgnored", {
      defaultValue: "{{source}} comment {{index}} has invalid {{metadata}} metadata and was ignored.",
      source: commentMetadataMatch[1],
      index: commentMetadataMatch[2],
      metadata: formatCompanyPortabilityMetadata(commentMetadataMatch[3], t),
    });
  }

  const defaultWorkspaceMatch = warning.match(/^Project (.+) default workspace (.+) was omitted from export because that workspace is not portable\.$/);
  if (defaultWorkspaceMatch?.[1] && defaultWorkspaceMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.defaultWorkspaceOmitted", {
      defaultValue: "Project {{project}} default workspace {{workspace}} was omitted from export because that workspace is not portable.",
      project: defaultWorkspaceMatch[1],
      workspace: defaultWorkspaceMatch[2],
    });
  }

  const missingWorkspaceKeyMatch = warning.match(/^Project (.+) references missing workspace key (.+); imported execution workspace policy without a default workspace\.$/);
  if (missingWorkspaceKeyMatch?.[1] && missingWorkspaceKeyMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.missingWorkspaceKey", {
      defaultValue: "Project {{project}} references missing workspace key {{workspace}}; imported execution workspace policy without a default workspace.",
      project: missingWorkspaceKeyMatch[1],
      workspace: missingWorkspaceKeyMatch[2],
    });
  }

  const workspaceRepoMatch = warning.match(/^Project (.+) workspace (.+) was omitted from export because it does not have a portable repoUrl\.$/);
  if (workspaceRepoMatch?.[1] && workspaceRepoMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.workspaceRepoUrlOmitted", {
      defaultValue: "Project {{project}} workspace {{workspace}} was omitted from export because it does not have a portable repoUrl.",
      project: workspaceRepoMatch[1],
      workspace: workspaceRepoMatch[2],
    });
  }

  const workspaceSystemDependentMatch = warning.match(/^Project (.+) workspace (.+) (setupCommand|cleanupCommand|metadata) was omitted from export because (.+)\.$/);
  if (
    workspaceSystemDependentMatch?.[1]
    && workspaceSystemDependentMatch[2]
    && workspaceSystemDependentMatch[3]
    && workspaceSystemDependentMatch[4]
  ) {
    return t("common.apiFeedback.companyPortabilityWarnings.workspaceFieldOmitted", {
      defaultValue: "Project {{project}} workspace {{workspace}} {{field}} was omitted from export because {{reason}}.",
      project: workspaceSystemDependentMatch[1],
      workspace: workspaceSystemDependentMatch[2],
      field: workspaceSystemDependentMatch[3],
      reason: formatCompanyPortabilityWarningReason(workspaceSystemDependentMatch[4], t),
    });
  }

  const routineLegacyMatch = warning.match(/^Recurring task (.+) uses legacy recurrence end bounds; Paperclip will import the routine trigger without those limits\.$/);
  if (routineLegacyMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.legacyRecurrenceBounds", {
      defaultValue: "Recurring task {{issue}} uses legacy recurrence end bounds; Paperclip will import the routine trigger without those limits.",
      issue: routineLegacyMatch[1],
    });
  }

  const selectorMatch = warning.match(/^(Agent|Project|Issue|Project-issues|Skill) selector "(.+)" was not found and was skipped\.$/);
  if (selectorMatch?.[1] && selectorMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.selectorNotFound", {
      defaultValue: "{{kind}} selector \"{{selector}}\" was not found and was skipped.",
      kind: formatCompanyPortabilityKind(selectorMatch[1], t),
      selector: selectorMatch[2],
    });
  }

  const missingPackageFileMatch = warning.match(/^Referenced (company logo|agent|skill|project|task) file is missing from package: (.+)$/);
  if (missingPackageFileMatch?.[1] && missingPackageFileMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.referencedFileMissing", {
      defaultValue: "Referenced {{kind}} file is missing from package: {{path}}",
      kind: formatCompanyPortabilityKind(missingPackageFileMatch[1], t),
      path: missingPackageFileMatch[2],
    });
  }

  const markdownKindMatch = warning.match(/^(Agent|Project|Task) markdown (.+) does not declare kind: (agent|project|task) in frontmatter\.$/);
  if (markdownKindMatch?.[1] && markdownKindMatch[2] && markdownKindMatch[3]) {
    return t("common.apiFeedback.companyPortabilityWarnings.markdownKindMissing", {
      defaultValue: "{{kind}} markdown {{path}} does not declare kind: {{expectedKind}} in frontmatter.",
      kind: formatCompanyPortabilityKind(markdownKindMatch[1], t),
      path: markdownKindMatch[2],
      expectedKind: formatCompanyPortabilityKind(markdownKindMatch[3], t),
    });
  }

  if (warning === "GitHub ref main not found; falling back to master.") {
    return t("common.apiFeedback.companyPortabilityWarnings.githubMainFallback", {
      defaultValue: warning,
    });
  }

  const failedCompanyLogoMatch = warning.match(/^Failed to (fetch|export|import) company logo (.+): (.+)$/);
  if (failedCompanyLogoMatch?.[1] && failedCompanyLogoMatch[2] && failedCompanyLogoMatch[3]) {
    return t("common.apiFeedback.companyPortabilityWarnings.companyLogoFailed", {
      defaultValue: "Failed to {{action}} company logo {{logo}}: {{reason}}",
      action: formatCompanyPortabilityLogoAction(failedCompanyLogoMatch[1], t),
      logo: failedCompanyLogoMatch[2],
      reason: failedCompanyLogoMatch[3],
    });
  }

  if (warning === "Skipped company logo from export because storage is unavailable.") {
    return t("common.apiFeedback.companyPortabilityWarnings.companyLogoExportStorageUnavailable", {
      defaultValue: warning,
    });
  }

  if (warning === "Skipped company logo import because storage is unavailable.") {
    return t("common.apiFeedback.companyPortabilityWarnings.companyLogoImportStorageUnavailable", {
      defaultValue: warning,
    });
  }

  const companyLogoAssetMissingMatch = warning.match(/^Skipped company logo (.+) because the asset record was not found\.$/);
  if (companyLogoAssetMissingMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.companyLogoAssetMissing", {
      defaultValue: "Skipped company logo {{asset}} because the asset record was not found.",
      asset: companyLogoAssetMissingMatch[1],
    });
  }

  const companyLogoImportMissingMatch = warning.match(/^Skipped company logo import because (.+) is missing from the package\.$/);
  if (companyLogoImportMissingMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.companyLogoImportMissing", {
      defaultValue: "Skipped company logo import because {{path}} is missing from the package.",
      path: companyLogoImportMissingMatch[1],
    });
  }

  const companyLogoUnsupportedMatch = warning.match(/^Skipped company logo import for (.+) because the file type is unsupported\.$/);
  if (companyLogoUnsupportedMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.companyLogoUnsupported", {
      defaultValue: "Skipped company logo import for {{path}} because the file type is unsupported.",
      path: companyLogoUnsupportedMatch[1],
    });
  }

  const agentSkillMissingMatch = warning.match(/^Agent (.+) references skill (.+), but that skill is not present in the package\.$/);
  if (agentSkillMissingMatch?.[1] && agentSkillMissingMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.agentSkillMissing", {
      defaultValue: "Agent {{agent}} references skill {{skill}}, but that skill is not present in the package.",
      agent: agentSkillMissingMatch[1],
      skill: agentSkillMissingMatch[2],
    });
  }

  const taskProjectWorkspaceMissingMatch = warning.match(/^Task (.+) references workspace key (.+), but its project is not present in the package\.$/);
  if (taskProjectWorkspaceMissingMatch?.[1] && taskProjectWorkspaceMissingMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.taskProjectWorkspaceMissing", {
      defaultValue: "Task {{task}} references workspace key {{workspace}}, but its project is not present in the package.",
      task: taskProjectWorkspaceMissingMatch[1],
      workspace: taskProjectWorkspaceMissingMatch[2],
    });
  }

  const taskWorkspaceMissingMatch = warning.match(/^Task (.+) references missing project workspace key (.+)\.$/);
  if (taskWorkspaceMissingMatch?.[1] && taskWorkspaceMissingMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.taskWorkspaceMissing", {
      defaultValue: "Task {{task}} references missing project workspace key {{workspace}}.",
      task: taskWorkspaceMissingMatch[1],
      workspace: taskWorkspaceMissingMatch[2],
    });
  }

  const taskWorkspaceNotImportedMatch = warning.match(/^Task (.+) references workspace key (.+), but that workspace was not imported\.$/);
  if (taskWorkspaceNotImportedMatch?.[1] && taskWorkspaceNotImportedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.taskWorkspaceNotImported", {
      defaultValue: "Task {{task}} references workspace key {{workspace}}, but that workspace was not imported.",
      task: taskWorkspaceNotImportedMatch[1],
      workspace: taskWorkspaceNotImportedMatch[2],
    });
  }

  const envInputMatch = warning.match(/^Environment input (.+) is system-dependent and may need manual adjustment after import\.$/);
  if (envInputMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.envInputSystemDependent", {
      defaultValue: "Environment input {{input}} is system-dependent and may need manual adjustment after import.",
      input: envInputMatch[1],
    });
  }

  const existingSkillSafeMatch = warning.match(/^Existing skill "(.+)" matched during safe import and will (be skipped|be renamed) instead of overwritten\.$/);
  if (existingSkillSafeMatch?.[1] && existingSkillSafeMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.existingSkillSafeImport", {
      defaultValue: "Existing skill \"{{skill}}\" matched during safe import and will {{action}} instead of overwritten.",
      skill: existingSkillSafeMatch[1],
      action: t(`common.apiFeedback.companyPortabilityWarnings.actions.${existingSkillSafeMatch[2].replaceAll(" ", "_")}`, {
        defaultValue: existingSkillSafeMatch[2],
      }),
    });
  }

  const existingSkillOverwriteMatch = warning.match(/^Existing skill "(.+)" \((.+)\) will be overwritten by import\.$/);
  if (existingSkillOverwriteMatch?.[1] && existingSkillOverwriteMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.existingSkillOverwrite", {
      defaultValue: "Existing skill \"{{skill}}\" ({{key}}) will be overwritten by import.",
      skill: existingSkillOverwriteMatch[1],
      key: existingSkillOverwriteMatch[2],
    });
  }

  const existingEntityOverwriteMatch = warning.match(/^Existing (agent|project) "(.+)" \((.+)\) will be overwritten by import\.$/);
  if (existingEntityOverwriteMatch?.[1] && existingEntityOverwriteMatch[2] && existingEntityOverwriteMatch[3]) {
    return t("common.apiFeedback.companyPortabilityWarnings.existingEntityOverwrite", {
      defaultValue: "Existing {{kind}} \"{{name}}\" ({{slug}}) will be overwritten by import.",
      kind: formatCompanyPortabilityKind(existingEntityOverwriteMatch[1], t),
      name: existingEntityOverwriteMatch[2],
      slug: existingEntityOverwriteMatch[3],
    });
  }

  const skillSkippedMatch = warning.match(/^Skipped skill (.+); existing skill (.+) was kept\.$/);
  if (skillSkippedMatch?.[1] && skillSkippedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.skillSkippedExistingKept", {
      defaultValue: "Skipped skill {{source}}; existing skill {{target}} was kept.",
      source: skillSkippedMatch[1],
      target: skillSkippedMatch[2],
    });
  }

  const skillRenamedMatch = warning.match(/^Imported skill (.+) as (.+) to avoid overwriting an existing skill\.$/);
  if (skillRenamedMatch?.[1] && skillRenamedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.skillRenamed", {
      defaultValue: "Imported skill {{source}} as {{target}} to avoid overwriting an existing skill.",
      source: skillRenamedMatch[1],
      target: skillRenamedMatch[2],
    });
  }

  const missingAgentsMarkdownMatch = warning.match(/^Missing AGENTS markdown for (.+); imported with an empty managed bundle\.$/);
  if (missingAgentsMarkdownMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.missingAgentsMarkdown", {
      defaultValue: "Missing AGENTS markdown for {{agent}}; imported with an empty managed bundle.",
      agent: missingAgentsMarkdownMatch[1],
    });
  }

  const skippedUpdateMatch = warning.match(/^Skipped update for missing (agent|project) (.+)\.$/);
  if (skippedUpdateMatch?.[1] && skippedUpdateMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.skippedMissingUpdate", {
      defaultValue: "Skipped update for missing {{kind}} {{id}}.",
      kind: formatCompanyPortabilityKind(skippedUpdateMatch[1], t),
      id: skippedUpdateMatch[2],
    });
  }

  const materializeBundleFailedMatch = warning.match(/^Failed to materialize instructions bundle for (.+): (.+)$/);
  if (materializeBundleFailedMatch?.[1] && materializeBundleFailedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.materializeBundleFailed", {
      defaultValue: "Failed to materialize instructions bundle for {{agent}}: {{reason}}",
      agent: materializeBundleFailedMatch[1],
      reason: materializeBundleFailedMatch[2],
    });
  }

  const assignManagerFailedMatch = warning.match(/^Could not assign manager (.+) for imported agent (.+)\.$/);
  if (assignManagerFailedMatch?.[1] && assignManagerFailedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.assignManagerFailed", {
      defaultValue: "Could not assign manager {{manager}} for imported agent {{agent}}.",
      manager: assignManagerFailedMatch[1],
      agent: assignManagerFailedMatch[2],
    });
  }

  const projectWorkspaceCreateFailedMatch = warning.match(/^Project (.+) workspace (.+) could not be created during import\.$/);
  if (projectWorkspaceCreateFailedMatch?.[1] && projectWorkspaceCreateFailedMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.projectWorkspaceCreateFailed", {
      defaultValue: "Project {{project}} workspace {{workspace}} could not be created during import.",
      project: projectWorkspaceCreateFailedMatch[1],
      workspace: projectWorkspaceCreateFailedMatch[2],
    });
  }

  const taskDowngradedMatch = warning.match(/^Task (.+) was downgraded to todo because its assignee could not be imported as assignable work\.$/);
  if (taskDowngradedMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.taskDowngraded", {
      defaultValue: "Task {{task}} was downgraded to todo because its assignee could not be imported as assignable work.",
      task: taskDowngradedMatch[1],
    });
  }

  const commentSystemAgentMatch = warning.match(/^Comment on task (.+) was imported as a system comment because author agent (.+) was not imported\.$/);
  if (commentSystemAgentMatch?.[1] && commentSystemAgentMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.commentSystemAgentMissing", {
      defaultValue: "Comment on task {{task}} was imported as a system comment because author agent {{agent}} was not imported.",
      task: commentSystemAgentMatch[1],
      agent: commentSystemAgentMatch[2],
    });
  }

  const commentSystemUserMatch = warning.match(/^Comment on task (.+) was imported as a system comment because no importing user was available\.$/);
  if (commentSystemUserMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityWarnings.commentSystemNoUser", {
      defaultValue: "Comment on task {{task}} was imported as a system comment because no importing user was available.",
      task: commentSystemUserMatch[1],
    });
  }

  const tasksWorkspaceExportMatch = warning.match(/^Tasks (.+) reference workspace (.+), but that workspace could not be exported portably\.$/);
  if (tasksWorkspaceExportMatch?.[1] && tasksWorkspaceExportMatch[2]) {
    return t("common.apiFeedback.companyPortabilityWarnings.tasksWorkspaceNotPortable", {
      defaultValue: "Tasks {{tasks}} reference workspace {{workspace}}, but that workspace could not be exported portably.",
      tasks: tasksWorkspaceExportMatch[1],
      workspace: tasksWorkspaceExportMatch[2],
    });
  }

  const noAgentsSelected = "No agents selected for import.";
  if (warning === noAgentsSelected) {
    return t("common.apiFeedback.companyPortabilityWarnings.noAgentsSelected", {
      defaultValue: noAgentsSelected,
    });
  }

  return warning;
}

export function formatCompanyPortabilityError(error: string, t: TFunction): string {
  const normalized = error.trim();

  if (normalized === "Manifest does not include company metadata.") {
    return t("common.apiFeedback.companyPortabilityErrors.manifestCompanyMissing", {
      defaultValue: normalized,
    });
  }

  const selectedAgentMissingMatch = normalized.match(/^Selected agent slug not found in manifest: (.+)$/);
  if (selectedAgentMissingMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityErrors.selectedAgentMissing", {
      defaultValue: "Selected agent slug not found in manifest: {{slug}}",
      slug: selectedAgentMissingMatch[1],
    });
  }

  const missingMarkdownMatch = normalized.match(/^Missing markdown file for (agent|project|task) (.+): (.+)$/);
  if (missingMarkdownMatch?.[1] && missingMarkdownMatch[2] && missingMarkdownMatch[3]) {
    return t("common.apiFeedback.companyPortabilityErrors.missingMarkdown", {
      defaultValue: "Missing markdown file for {{kind}} {{slug}}: {{path}}",
      kind: formatCompanyPortabilityKind(missingMarkdownMatch[1], t),
      slug: missingMarkdownMatch[2],
      path: missingMarkdownMatch[3],
    });
  }

  const routineMissingMatch = normalized.match(/^Recurring task (.+) must declare (a project|an assignee) to import as a routine\.$/);
  if (routineMissingMatch?.[1] && routineMissingMatch[2]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineMissingField", {
      defaultValue: "Recurring task {{task}} must declare {{field}} to import as a routine.",
      task: routineMissingMatch[1],
      field: t(`common.apiFeedback.companyPortabilityErrors.fields.${routineMissingMatch[2].replaceAll(" ", "_")}`, {
        defaultValue: routineMissingMatch[2],
      }),
    });
  }

  const routineLegacyTriggerMatch = normalized.match(/^Recurring task (\S+) (.+); add \.paperclip\.yaml routines\.(.+)\.triggers\.$/);
  if (routineLegacyTriggerMatch?.[1] && routineLegacyTriggerMatch[2]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineLegacyTriggerInvalid", {
      defaultValue: "Recurring task {{task}} {{reason}}; add .paperclip.yaml routines.{{routine}}.triggers.",
      task: routineLegacyTriggerMatch[1],
      reason: formatCompanyPortabilityRoutineReason(routineLegacyTriggerMatch[2], t),
      routine: routineLegacyTriggerMatch[3] ?? routineLegacyTriggerMatch[1],
    });
  }

  const routineUnsupportedPolicyMatch = normalized.match(/^Recurring task (.+) uses unsupported routine (concurrencyPolicy|catchUpPolicy) "(.+)"\.$/);
  if (routineUnsupportedPolicyMatch?.[1] && routineUnsupportedPolicyMatch[2] && routineUnsupportedPolicyMatch[3]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineUnsupportedPolicy", {
      defaultValue: "Recurring task {{task}} uses unsupported routine {{field}} \"{{value}}\".",
      task: routineUnsupportedPolicyMatch[1],
      field: routineUnsupportedPolicyMatch[2],
      value: routineUnsupportedPolicyMatch[3],
    });
  }

  const routineUnsupportedTriggerMatch = normalized.match(/^Recurring task (.+) uses unsupported trigger kind "(.+)"\.$/);
  if (routineUnsupportedTriggerMatch?.[1] && routineUnsupportedTriggerMatch[2]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineUnsupportedTrigger", {
      defaultValue: "Recurring task {{task}} uses unsupported trigger kind \"{{kind}}\".",
      task: routineUnsupportedTriggerMatch[1],
      kind: routineUnsupportedTriggerMatch[2],
    });
  }

  const scheduleMissingMatch = normalized.match(/^Recurring task (.+) has a schedule trigger missing cronExpression\/timezone\.$/);
  if (scheduleMissingMatch?.[1]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineScheduleMissing", {
      defaultValue: "Recurring task {{task}} has a schedule trigger missing cronExpression/timezone.",
      task: scheduleMissingMatch[1],
    });
  }

  const scheduleInvalidMatch = normalized.match(/^Recurring task (.+) has an invalid schedule trigger: (.+)$/);
  if (scheduleInvalidMatch?.[1] && scheduleInvalidMatch[2]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineScheduleInvalid", {
      defaultValue: "Recurring task {{task}} has an invalid schedule trigger: {{reason}}",
      task: scheduleInvalidMatch[1],
      reason: scheduleInvalidMatch[2],
    });
  }

  const webhookSigningMatch = normalized.match(/^Recurring task (.+) uses unsupported webhook signingMode "(.+)"\.$/);
  if (webhookSigningMatch?.[1] && webhookSigningMatch[2]) {
    return t("common.apiFeedback.companyPortabilityErrors.routineWebhookSigningUnsupported", {
      defaultValue: "Recurring task {{task}} uses unsupported webhook signingMode \"{{mode}}\".",
      task: webhookSigningMatch[1],
      mode: webhookSigningMatch[2],
    });
  }

  return formatCompanyPortabilityWarning(error, t);
}

export function formatExecutionWorkspaceCloseFeedback(message: string, t: TFunction): string {
  const trimmed = message.trim();
  const gitInspectNoPath = "Workspace has no local path, so Paperclip cannot inspect git status before close.";
  if (trimmed === gitInspectNoPath) {
    return t("common.apiFeedback.executionWorkspaceClose.noLocalPath", {
      defaultValue: gitInspectNoPath,
    });
  }

  const gitMissingPathMatch = trimmed.match(/^Workspace path "(.+)" does not exist, so Paperclip cannot inspect git status before close\.$/);
  if (gitMissingPathMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.workspacePathMissing", {
      defaultValue: "Workspace path \"{{path}}\" does not exist, so Paperclip cannot inspect git status before close.",
      path: gitMissingPathMatch[1],
    });
  }

  const gitInspectFailedMatch = trimmed.match(/^Could not inspect git status for "(.+)": (.+)$/);
  if (gitInspectFailedMatch?.[1] && gitInspectFailedMatch[2]) {
    return t("common.apiFeedback.executionWorkspaceClose.gitInspectFailed", {
      defaultValue: "Could not inspect git status for \"{{path}}\": {{reason}}",
      path: gitInspectFailedMatch[1],
      reason: gitInspectFailedMatch[2],
    });
  }

  const gitStatusFailedMatch = trimmed.match(/^Could not read git working tree status for "(.+)": (.+)$/);
  if (gitStatusFailedMatch?.[1] && gitStatusFailedMatch[2]) {
    return t("common.apiFeedback.executionWorkspaceClose.gitStatusFailed", {
      defaultValue: "Could not read git working tree status for \"{{path}}\": {{reason}}",
      path: gitStatusFailedMatch[1],
      reason: gitStatusFailedMatch[2],
    });
  }

  const compareFailedMatch = trimmed.match(/^Could not compare this workspace against (.+): (.+)$/);
  if (compareFailedMatch?.[1] && compareFailedMatch[2]) {
    return t("common.apiFeedback.executionWorkspaceClose.gitCompareFailed", {
      defaultValue: "Could not compare this workspace against {{baseRef}}: {{reason}}",
      baseRef: compareFailedMatch[1],
      reason: compareFailedMatch[2],
    });
  }

  const mergeCheckFailedMatch = trimmed.match(/^Could not determine whether this workspace is merged into (.+): (.+)$/);
  if (mergeCheckFailedMatch?.[1] && mergeCheckFailedMatch[2]) {
    return t("common.apiFeedback.executionWorkspaceClose.gitMergeCheckFailed", {
      defaultValue: "Could not determine whether this workspace is merged into {{baseRef}}: {{reason}}",
      baseRef: mergeCheckFailedMatch[1],
      reason: mergeCheckFailedMatch[2],
    });
  }

  if (trimmed === "This workspace is still linked to an open issue.") {
    return t("common.apiFeedback.executionWorkspaceClose.openIssueLinked", {
      defaultValue: trimmed,
      count: 1,
    });
  }

  const openIssuesMatch = trimmed.match(/^This workspace is still linked to (\d+) open issues\.$/);
  if (openIssuesMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.openIssueLinked", {
      defaultValue: "This workspace is still linked to {{count}} open issues.",
      count: Number(openIssuesMatch[1]),
    });
  }

  const sharedOpenIssuesMatch = trimmed.match(/^(This workspace is still linked to (?:an open issue|\d+ open issues)\.) Archiving it will detach this shared workspace session from those issues, but keep the underlying project workspace available\.$/);
  if (sharedOpenIssuesMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.sharedOpenIssues", {
      defaultValue: "{{linkedIssueMessage}} Archiving it will detach this shared workspace session from those issues, but keep the underlying project workspace available.",
      linkedIssueMessage: formatExecutionWorkspaceCloseFeedback(sharedOpenIssuesMatch[1], t),
    });
  }

  if (trimmed === "This shared workspace session points at project workspace infrastructure. Archiving it only removes the session record.") {
    return t("common.apiFeedback.executionWorkspaceClose.sharedWorkspaceSession", {
      defaultValue: trimmed,
    });
  }

  const runtimeServicesMatch = trimmed.match(/^Closing this workspace will stop (\d+) attached runtime services?\.$/);
  if (runtimeServicesMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.stopRuntimeServices", {
      defaultValue: "Closing this workspace will stop {{count}} attached runtime service.",
      count: Number(runtimeServicesMatch[1]),
    });
  }

  const dirtyTrackedMatch = trimmed.match(/^The workspace has (\d+) modified tracked files?\.$/);
  if (dirtyTrackedMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.modifiedTrackedFiles", {
      defaultValue: "The workspace has {{count}} modified tracked file.",
      count: Number(dirtyTrackedMatch[1]),
    });
  }

  const untrackedMatch = trimmed.match(/^The workspace has (\d+) untracked files?\.$/);
  if (untrackedMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.untrackedFiles", {
      defaultValue: "The workspace has {{count}} untracked file.",
      count: Number(untrackedMatch[1]),
    });
  }

  const aheadMatch = trimmed.match(/^This workspace is (\d+) commits? ahead of (.+) and is not merged\.$/);
  if (aheadMatch?.[1] && aheadMatch[2]) {
    return t("common.apiFeedback.executionWorkspaceClose.aheadNotMerged", {
      defaultValue: "This workspace is {{count}} commit ahead of {{baseRef}} and is not merged.",
      count: Number(aheadMatch[1]),
      baseRef: aheadMatch[2],
    });
  }

  const behindMatch = trimmed.match(/^This workspace is (\d+) commits? behind (.+)\.$/);
  if (behindMatch?.[1] && behindMatch[2]) {
    return t("common.apiFeedback.executionWorkspaceClose.behindBase", {
      defaultValue: "This workspace is {{count}} commit behind {{baseRef}}.",
      count: Number(behindMatch[1]),
      baseRef: behindMatch[2],
    });
  }

  const keepProjectWorkspaceMatch = trimmed.match(/^Paperclip will archive this workspace but keep "(.+)" because it contains the project workspace\.$/);
  if (keepProjectWorkspaceMatch?.[1]) {
    return t("common.apiFeedback.executionWorkspaceClose.keepProjectWorkspacePath", {
      defaultValue: "Paperclip will archive this workspace but keep \"{{path}}\" because it contains the project workspace.",
      path: keepProjectWorkspaceMatch[1],
    });
  }

  return message;
}

export function formatExecutionWorkspaceCloseActionLabel(action: ExecutionWorkspaceCloseAction, t: TFunction): string {
  return t(`common.apiFeedback.executionWorkspaceCloseActions.${action.kind}.label`, {
    defaultValue: action.label,
  });
}

export function formatExecutionWorkspaceCloseActionDescription(action: ExecutionWorkspaceCloseAction, t: TFunction): string {
  if (action.kind === "stop_runtime_services") {
    const countMatch = action.description.match(/^(\d+) runtime services will be stopped before cleanup\.$/);
    if (countMatch?.[1]) {
      return t("common.apiFeedback.executionWorkspaceCloseActions.stop_runtime_services.description", {
        defaultValue: "{{count}} runtime services will be stopped before cleanup.",
        count: Number(countMatch[1]),
      });
    }
    const serviceMatch = action.description.match(/^(.+) will be stopped before cleanup\.$/);
    if (serviceMatch?.[1]) {
      return t("common.apiFeedback.executionWorkspaceCloseActions.stop_runtime_services.descriptionWithName", {
        defaultValue: "{{service}} will be stopped before cleanup.",
        service: serviceMatch[1],
      });
    }
  }

  if (action.kind === "git_worktree_remove") {
    const pathMatch = action.description.match(/^Paperclip will run git worktree cleanup for (.+)\.$/);
    if (pathMatch?.[1]) {
      return t("common.apiFeedback.executionWorkspaceCloseActions.git_worktree_remove.description", {
        defaultValue: "Paperclip will run git worktree cleanup for {{path}}.",
        path: pathMatch[1],
      });
    }
  }

  if (action.kind === "remove_local_directory") {
    const pathMatch = action.description.match(/^Paperclip will remove the runtime-created directory at (.+)\.$/);
    if (pathMatch?.[1]) {
      return t("common.apiFeedback.executionWorkspaceCloseActions.remove_local_directory.description", {
        defaultValue: "Paperclip will remove the runtime-created directory at {{path}}.",
        path: pathMatch[1],
      });
    }
  }

  return t(`common.apiFeedback.executionWorkspaceCloseActions.${action.kind}.description`, {
    defaultValue: action.description,
  });
}

export function formatPluginConfigTestMessage(message: string | null | undefined, t: TFunction): string | null {
  const trimmed = message?.trim();
  if (!trimmed) return null;
  if (trimmed === "This plugin does not support configuration testing.") {
    return t("common.apiFeedback.pluginConfigTest.unsupported", {
      defaultValue: trimmed,
    });
  }
  if (trimmed === "Configuration validation failed.") {
    return t("common.apiFeedback.pluginConfigTest.validationFailed", {
      defaultValue: trimmed,
    });
  }
  if (trimmed.startsWith("Warnings: ")) {
    return t("common.apiFeedback.pluginConfigTest.warnings", {
      defaultValue: "Warnings: {{warnings}}",
      warnings: trimmed.slice("Warnings: ".length),
    });
  }
  return trimmed;
}

export function formatWakeupSkippedMessage(response: AgentWakeupSkipped, t: TFunction): string {
  if (response.reason === "issue_execution_deferred") {
    if (response.executionAgentName) {
      return t("common.apiFeedback.wakeupSkipped.issueExecutionDeferredWithAgent", {
        defaultValue: "Wakeup was deferred because this issue is already being executed by {{agent}}.",
        agent: response.executionAgentName,
      });
    }
    return t("common.apiFeedback.wakeupSkipped.issueExecutionDeferred", {
      defaultValue: "Wakeup was deferred because this issue already has an active execution run.",
    });
  }
  if (response.reason === "wakeup_skipped") {
    return t("common.apiFeedback.wakeupSkipped.generic", {
      defaultValue: response.message ?? "Wakeup was skipped.",
    });
  }
  return response.message ?? t("common.apiFeedback.wakeupSkipped.generic", {
    defaultValue: "Wakeup was skipped.",
  });
}

function issueGraphItemLabel(
  issue: IssueGraphLivenessAutoRecoveryPreviewItem["dependencyPath"][number] | null | undefined,
): string {
  return issue?.identifier ?? issue?.title ?? issue?.issueId ?? "";
}

export function formatIssueGraphLivenessReason(
  item: IssueGraphLivenessAutoRecoveryPreviewItem,
  t: TFunction,
): string {
  const source = issueGraphItemLabel(item.dependencyPath[0]) || item.identifier || item.issueId;
  const blocker = issueGraphItemLabel(item.dependencyPath[item.dependencyPath.length - 1]) || item.recoveryIdentifier || item.recoveryIssueId;

  if (item.state === "invalid_review_participant") {
    return t("common.apiFeedback.issueGraphLiveness.invalidReviewParticipant", {
      defaultValue: "{{issue}} is in review, but its current participant cannot be resolved.",
      issue: blocker || source,
    });
  }
  if (item.state === "in_review_without_action_path") {
    return t("common.apiFeedback.issueGraphLiveness.inReviewWithoutActionPath", {
      defaultValue: "{{issue}} is in review with an agent assignee but no owner for the next action.",
      issue: blocker || source,
    });
  }
  if (item.state === "blocked_by_cancelled_issue") {
    return t("common.apiFeedback.issueGraphLiveness.blockedByCancelledIssue", {
      defaultValue: "{{source}} is still blocked by cancelled issue {{blocker}}.",
      source,
      blocker,
    });
  }
  if (item.state === "blocked_by_assigned_backlog_issue") {
    return t("common.apiFeedback.issueGraphLiveness.blockedByAssignedBacklogIssue", {
      defaultValue: "{{source}} is blocked by assigned backlog issue {{blocker}} with no active next action.",
      source,
      blocker,
    });
  }
  if (item.state === "blocked_by_unassigned_issue") {
    return t("common.apiFeedback.issueGraphLiveness.blockedByUnassignedIssue", {
      defaultValue: "{{source}} is blocked by unassigned issue {{blocker}} with no user owner.",
      source,
      blocker,
    });
  }
  if (item.state === "blocked_by_uninvokable_assignee") {
    return t("common.apiFeedback.issueGraphLiveness.blockedByUninvokableAssignee", {
      defaultValue: "{{source}} is blocked by {{blocker}}, but its assignee is not invokable.",
      source,
      blocker,
    });
  }

  return item.reason;
}

export function formatIssueRetryNowMessage(response: IssueRetryNowResponse, t: TFunction): string {
  if (response.outcome === "promoted") {
    return t("common.apiFeedback.issueRetryNow.promoted", {
      defaultValue: "Scheduled retry was promoted to the queued run pool.",
    });
  }
  if (response.outcome === "already_promoted") {
    return t("common.apiFeedback.issueRetryNow.alreadyPromoted", {
      defaultValue: "Scheduled retry was already promoted.",
    });
  }
  if (response.outcome === "no_scheduled_retry") {
    return t("common.apiFeedback.issueRetryNow.noScheduledRetry", {
      defaultValue: "No live scheduled retry exists for this issue.",
    });
  }

  const message = response.message.trim();
  const terminalMatch = message.match(/^Scheduled retry suppressed because issue reached terminal status \((.+)\)$/);
  if (terminalMatch?.[1]) {
    return t("common.apiFeedback.issueRetryNow.gateSuppressed.issueTerminalStatus", {
      defaultValue: "Scheduled retry was suppressed because the issue reached terminal status ({{status}}).",
      status: terminalMatch[1],
    });
  }

  const maxTurnStatusMatch = message.match(/^Scheduled max-turn continuation suppressed because issue is no longer in_progress \(current status: (.+)\)$/);
  if (maxTurnStatusMatch?.[1]) {
    return t("common.apiFeedback.issueRetryNow.gateSuppressed.maxTurnIssueNotInProgress", {
      defaultValue: "Scheduled max-turn continuation was suppressed because the issue is no longer in progress (current status: {{status}}).",
      status: maxTurnStatusMatch[1],
    });
  }

  const knownGateKey = [
    ["Scheduled retry suppressed because the agent is not invokable", "agentNotInvokable"],
    ["Scheduled retry suppressed because the target issue no longer exists", "issueNotFound"],
    ["Scheduled retry suppressed because issue ownership changed", "issueReassigned"],
    ["Scheduled max-turn continuation suppressed because the issue execution lock belongs to a different run", "executionLockChanged"],
    ["Scheduled retry suppressed because the issue is waiting on another review participant", "reviewParticipantChanged"],
    ["Scheduled retry suppressed because the issue is held by an active subtree pause hold", "issuePaused"],
    ["Scheduled retry suppressed because issue dependencies are still blocked", "dependenciesBlocked"],
    ["Scheduled retry suppressed because the agent no longer exists", "agentNotFound"],
  ].find(([known]) => known === message)?.[1];

  if (knownGateKey) {
    return t(`common.apiFeedback.issueRetryNow.gateSuppressed.${knownGateKey}`, {
      defaultValue: response.message,
    });
  }

  return response.message;
}
