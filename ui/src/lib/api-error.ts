import type { TFunction } from "i18next";
import { ApiError } from "@/api/client";

type ErrorBodyRecord = Record<string, unknown>;

function asRecord(value: unknown): ErrorBodyRecord | null {
  return value && typeof value === "object" ? value as ErrorBodyRecord : null;
}

function readCode(error: unknown): string | null {
  if (error instanceof ApiError && error.code) return error.code;
  const record = asRecord(error);
  if (typeof record?.code === "string" && record.code.trim()) return record.code;
  const directDetails = asRecord(record?.details);
  if (typeof directDetails?.code === "string" && directDetails.code.trim()) return directDetails.code;
  const body = asRecord(record?.body ?? (error instanceof ApiError ? error.body : null));
  if (typeof body?.code === "string" && body.code.trim()) return body.code;
  const nested = asRecord(body?.error);
  if (typeof nested?.code === "string" && nested.code.trim()) return nested.code;
  const details = asRecord(body?.details);
  if (typeof details?.code === "string" && details.code.trim()) return details.code;
  return null;
}

function readMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.trim()) return error.message;
  const record = asRecord(error);
  if (typeof record?.message === "string" && record.message.trim()) return record.message;
  return null;
}

function readStatus(error: unknown): number | null {
  if (error instanceof ApiError) return error.status;
  const record = asRecord(error);
  return typeof record?.status === "number" ? record.status : null;
}

function normalizeCode(code: string): string {
  return code.trim().replace(/[^a-zA-Z0-9_.:-]+/g, "_");
}

const resourceLabels: Record<string, string> = {
  "agent": "agent",
  "approval": "approval",
  "asset": "asset",
  "attachment": "attachment",
  "board api key": "board API key",
  "board claim challenge": "board claim challenge",
  "comment": "comment",
  "company": "company",
  "cli auth challenge": "CLI auth challenge",
  "document": "document",
  "environment": "environment",
  "environment lease": "environment lease",
  "execution workspace": "execution workspace",
  "feedback trace": "feedback trace",
  "file": "file",
  "goal": "goal",
  "heartbeat run": "heartbeat run",
  "import job": "import job",
  "issue": "issue",
  "issue tree hold": "issue tree hold",
  "invite": "invite",
  "invite logo": "invite logo",
  "instance admin role": "instance admin role",
  "instructions file": "instructions file",
  "job": "job",
  "key": "key",
  "label": "label",
  "member": "member",
  "object": "object",
  "parent issue": "parent issue",
  "plugin": "plugin",
  "plugin api route": "plugin API route",
  "plugin ui directory": "plugin UI directory",
  "project": "project",
  "project workspace": "project workspace",
  "provider vault": "provider vault",
  "revision": "revision",
  "root issue": "root issue",
  "routine": "routine",
  "routine trigger": "routine trigger",
  "runtime service": "runtime service",
  "secret": "secret",
  "skill": "skill",
  "tool": "tool",
  "work product": "work product",
  "workspace command": "workspace command",
  "workspace command action": "workspace command action",
  "workspace operation": "workspace operation",
};

function translateResourceLabel(resource: string, t: TFunction): string {
  const normalized = resource.trim().toLowerCase();
  const key = normalized.replaceAll(" ", "_");
  return t(`common.apiErrors.resources.${key}`, {
    defaultValue: resourceLabels[normalized] ?? resource.trim(),
  });
}

function translateKnownMessage(message: string, t: TFunction): string | null {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (lower === "forbidden") return t("common.apiErrors.forbidden", { defaultValue: "You do not have permission to perform this action." });
  if (lower === "access denied") return t("common.apiErrors.forbidden", { defaultValue: "You do not have permission to perform this action." });
  if (lower === "board authentication required") return t("common.apiErrors.boardAuthRequired", { defaultValue: "Board authentication is required." });
  if (lower === "board user context required") return t("common.apiErrors.boardUserRequired", { defaultValue: "A board user context is required." });
  if (lower === "board access required" || lower === "board_access_required") return t("common.apiErrors.boardAccessRequired", { defaultValue: "Board access is required." });
  if (lower === "instance admin required" || lower === "instance admin access required") return t("common.apiErrors.instanceAdminRequired", { defaultValue: "Instance admin access is required." });
  if (lower === "permission denied") return t("common.apiErrors.missingPermission", { defaultValue: "You do not have the required permission." });
  if (lower === "board mutation requires trusted browser origin") return t("common.apiErrors.boardTrustedOriginRequired", { defaultValue: "This board action must come from a trusted browser origin." });
  if (lower.includes("requires board authentication")) return t("common.apiErrors.boardAuthRequired", { defaultValue: "Board authentication is required." });
  if (lower.includes("agents can only manage routines assigned to themselves")) return t("common.apiErrors.routineAgentSelfManageOnly", { defaultValue: "Agents can only manage routines assigned to themselves." });
  if (lower.includes("agents can only assign routines to themselves")) return t("common.apiErrors.routineAgentSelfAssignOnly", { defaultValue: "Agents can only assign routines to themselves." });
  if (lower.includes("agent can only") || lower.includes("only ceo can") || lower.includes("only board users") || lower.includes("only requesting agent") || lower.includes("only the comment author")) {
    return t("common.apiErrors.missingPermission", { defaultValue: "You do not have the required permission." });
  }
  if (lower.includes("login is only supported for claude_local agents")) return t("common.apiErrors.claudeLoginOnly", { defaultValue: "Login is only supported for Claude local agents." });
  if (lower === "document is locked") return t("common.apiErrors.documentLocked", { defaultValue: "This document is locked." });
  if (lower === "issue not found") return t("common.apiErrors.issueNotFound", { defaultValue: "Issue not found." });
  if (lower === "label not found") return t("common.apiErrors.labelNotFound", { defaultValue: "Label not found." });
  const notFoundMatch = normalized.match(/^(.+?) not found$/i);
  if (notFoundMatch?.[1]) {
    return t("common.apiErrors.resourceNotFound", {
      defaultValue: "{{resource}} not found.",
      resource: translateResourceLabel(notFoundMatch[1], t),
    });
  }
  if (lower === "agent authentication required") return t("common.apiErrors.agentAuthRequired", { defaultValue: "Agent authentication is required." });
  if (lower.includes("agent key cannot access another company")) return t("common.apiErrors.agentCompanyAccessDenied", { defaultValue: "This agent key cannot access another company." });
  if (lower === "agent run id required") return t("common.apiErrors.missingRequiredField", { defaultValue: "A required field is missing." });
  if (lower.includes("does not belong to company") || lower.includes("must belong to same company") || lower.includes("must belong to the same company") || lower.includes("object does not belong to company")) return t("common.apiErrors.companyScopeMismatch", { defaultValue: "This resource does not belong to the selected company." });
  if (lower.includes("must belong to the selected project")) return t("common.apiErrors.projectScopeMismatch", { defaultValue: "This resource does not belong to the selected project." });
  if (lower.includes("environment is archived")) return t("common.apiErrors.environmentArchived", { defaultValue: "This environment is archived." });
  if (lower.includes("environment driver") && lower.includes("is not allowed here")) return t("common.apiErrors.environmentDriverNotAllowed", { defaultValue: "This environment driver is not allowed here." });
  if (lower.includes("environment sandbox provider") && lower.includes("is not allowed here")) return t("common.apiErrors.environmentSandboxProviderNotAllowed", { defaultValue: "This sandbox provider is not allowed here." });
  if (lower.includes("cannot remove the last active owner")) return t("common.apiErrors.lastOwnerRequired", { defaultValue: "You cannot remove the last active owner." });
  if (lower.includes("you already belong to this company")) return t("common.apiErrors.alreadyCompanyMember", { defaultValue: "You already belong to this company." });
  if (lower.includes("invite already consumed")) return t("common.apiErrors.inviteConsumed", { defaultValue: "This invite has already been used." });
  if (lower.includes("invite is missing company scope")) return t("common.apiErrors.inviteMissingCompany", { defaultValue: "This invite is missing its company scope." });
  if (lower.includes("join request is not pending")) return t("common.apiErrors.joinRequestNotPending", { defaultValue: "This join request is not pending." });
  if (lower.includes("join request must be approved before key claim")) return t("common.apiErrors.joinRequestNotApproved", { defaultValue: "This join request must be approved before claiming an API key." });
  if (lower.includes("claim secret expired")) return t("common.apiErrors.claimSecretExpired", { defaultValue: "This claim secret has expired." });
  if (lower.includes("claim secret already used")) return t("common.apiErrors.claimSecretUsed", { defaultValue: "This claim secret has already been used." });
  if (lower.includes("api key already claimed")) return t("common.apiErrors.apiKeyAlreadyClaimed", { defaultValue: "This API key has already been claimed." });
  if (lower.includes("invalid claim secret")) return t("common.apiErrors.invalidClaimSecret", { defaultValue: "The claim secret is invalid." });
  if (lower === "request body is required") return t("common.apiErrors.invalidRequestBody", { defaultValue: "The request body is invalid." });
  if (lower.includes("request body must include")) return t("common.apiErrors.invalidRequestBody", { defaultValue: "The request body is invalid." });
  if (lower.includes("request body") && lower.includes("required")) return t("common.apiErrors.invalidRequestBody", { defaultValue: "The request body is invalid." });
  if (lower.includes("invalid document key")) return t("common.apiErrors.invalidDocumentKey", { defaultValue: "The document key is invalid." });
  if (lower.includes("invalid object key")) return t("common.apiErrors.invalidObjectKey", { defaultValue: "The object key is invalid." });
  if (lower.includes("invalid") && (lower.includes("payload") || lower.includes("metadata"))) return t("common.apiErrors.invalidPayload", { defaultValue: "The submitted data is invalid." });
  if (lower.includes("invalid file path")) return t("common.apiErrors.invalidFilePath", { defaultValue: "The file path is invalid." });
  if (lower.includes("file path is required")) return t("common.apiErrors.invalidFilePath", { defaultValue: "The file path is invalid." });
  if (lower.includes("missing file field")) return t("common.apiErrors.missingFile", { defaultValue: "A file is required." });
  if (lower.includes("unsupported file type") || lower.includes("unsupported image type")) return t("common.apiErrors.unsupportedFileType", { defaultValue: "This file type is not supported." });
  if (lower.includes("image is empty") || lower.includes("attachment is empty")) return t("common.apiErrors.emptyFile", { defaultValue: "The uploaded file is empty." });
  if (lower === "file is empty") return t("common.apiErrors.emptyFile", { defaultValue: "The uploaded file is empty." });
  if (lower.includes("unsupported s3 body stream type")) return t("common.apiErrors.unsupportedStorageBody", { defaultValue: "This storage response type is not supported." });
  if (lower.includes("svg could not be sanitized")) return t("common.apiErrors.svgSanitizeFailed", { defaultValue: "The SVG could not be sanitized." });
  if (lower.includes("failed to serve file")) return t("common.apiErrors.fileServeFailed", { defaultValue: "Failed to serve the requested file." });
  if (lower.includes("devuiurl must target localhost")) return t("common.apiErrors.devUiUrlLocalhost", { defaultValue: "The development UI URL must target localhost." });
  if (lower.includes("devuiurl must use http or https protocol")) return t("common.apiErrors.devUiUrlProtocol", { defaultValue: "The development UI URL must use HTTP or HTTPS." });
  if (lower.includes("packageName is required".toLowerCase())) return t("common.apiErrors.packageNameRequired", { defaultValue: "Package name is required." });
  if (lower.includes("packagename cannot be empty")) return t("common.apiErrors.packageNameEmpty", { defaultValue: "Package name cannot be empty." });
  if (lower.includes("packagename contains invalid characters")) return t("common.apiErrors.packageNameInvalid", { defaultValue: "Package name contains invalid characters." });
  if (lower.includes("entitytype must be agents, routines, or monitors")) return t("common.apiErrors.cloudUpstreamEntityTypeInvalid", { defaultValue: "Entity type must be agents, routines, or monitors." });
  if (lower.includes("must be") || lower.includes(" is required") || lower.includes("parameter") && lower.includes("required")) {
    return t("common.apiErrors.missingRequiredField", { defaultValue: "A required field is missing or invalid." });
  }
  if (lower.includes("adapter") && lower.includes("not registered")) return t("common.apiErrors.adapterNotRegistered", { defaultValue: "Adapter is not registered." });
  if (lower.includes("cannot reload built-in adapter")) return t("common.apiErrors.cannotReloadBuiltinAdapter", { defaultValue: "Built-in adapters cannot be reloaded." });
  if (lower.includes("cannot reinstall built-in adapter")) return t("common.apiErrors.cannotReinstallBuiltinAdapter", { defaultValue: "Built-in adapters cannot be reinstalled." });
  if (lower.includes("cannot remove built-in adapter")) return t("common.apiErrors.cannotRemoveBuiltinAdapter", { defaultValue: "Built-in adapters cannot be removed." });
  if (lower.includes("local-path adapters cannot be reinstalled")) return t("common.apiErrors.localPathAdapterCannotReinstall", { defaultValue: "Local-path adapters cannot be reinstalled. Use reload instead." });
  if (lower.includes("npm install failed")) return t("common.apiErrors.npmInstallFailed", { defaultValue: "npm install failed. Check the package name, version, and network access." });
  if (lower.includes("failed to install adapter")) return t("common.apiErrors.adapterInstallFailed", { defaultValue: "Failed to install adapter." });
  if (lower.includes("failed to reload adapter")) return t("common.apiErrors.adapterReloadFailed", { defaultValue: "Failed to reload adapter." });
  if (lower.includes("reinstall failed")) return t("common.apiErrors.adapterReinstallFailed", { defaultValue: "Failed to reinstall adapter." });
  if (lower.includes("issue is checked out by another agent")) return t("common.apiErrors.issueCheckedOut", { defaultValue: "This issue is checked out by another agent." });
  if (lower.includes("issue does not belong to company")) return t("common.apiErrors.issueCompanyMismatch", { defaultValue: "This issue does not belong to the selected company." });
  if (lower.includes("agent cannot mutate another agent")) return t("common.apiErrors.agentCannotMutateOtherIssue", { defaultValue: "This agent cannot update another agent's issue." });
  if (lower.includes("missing permission")) return t("common.apiErrors.missingPermission", { defaultValue: "You do not have the required permission." });
  if (lower.includes("pending approval agents cannot be") || lower.includes("cannot assign work to pending approval agents") || lower.includes("cannot create keys for pending approval agents")) return t("common.apiErrors.pendingApprovalAgentUnavailable", { defaultValue: "Pending approval agents cannot be used for this action." });
  if (lower.includes("terminated agents cannot be") || lower.includes("cannot assign work to terminated agents") || lower.includes("cannot create keys for terminated agents") || lower.includes("cannot pause terminated agent") || lower.includes("cannot resume terminated agent")) return t("common.apiErrors.terminatedAgentUnavailable", { defaultValue: "Terminated agents cannot be used for this action." });
  if (lower.includes("agent is not invokable")) return t("common.apiErrors.agentNotInvokable", { defaultValue: "This agent is not invokable in its current state." });
  if (lower.includes("agent cannot report to itself")) return t("common.apiErrors.agentCannotReportToSelf", { defaultValue: "An agent cannot report to itself." });
  if (lower.includes("reporting relationship would create cycle")) return t("common.apiErrors.reportingCycle", { defaultValue: "That reporting relationship would create a cycle." });
  if (lower.includes("cancelled issues must be restored")) return t("common.apiErrors.cancelledIssueRestoreRequired", { defaultValue: "Cancelled issues must be restored through the restore flow." });
  if (lower.includes("blocked by unresolved blockers")) return t("common.apiErrors.issueBlockedByBlockers", { defaultValue: "This issue is blocked by unresolved blockers." });
  if (lower.includes("blocking relations cannot contain cycles")) return t("common.apiErrors.blockingCycle", { defaultValue: "Blocking relations cannot contain cycles." });
  if (lower.includes("issue cannot be blocked by itself")) return t("common.apiErrors.issueBlockedBySelf", { defaultValue: "An issue cannot be blocked by itself." });
  if (lower.includes("blocked-by issues must belong to the same company")) return t("common.apiErrors.blockerCompanyMismatch", { defaultValue: "Blocked-by issues must belong to the same company." });
  if (lower.includes("issue can only have one assignee")) return t("common.apiErrors.issueOneAssignee", { defaultValue: "An issue can only have one assignee." });
  if (lower.includes("in_progress issues require an assignee")) return t("common.apiErrors.issueInProgressAssigneeRequired", { defaultValue: "In-progress issues require an assignee." });
  if (lower.includes("issue checkout blocked by active subtree pause hold")) return t("common.apiErrors.issuePaused", { defaultValue: "This issue is paused." });
  if (lower.includes("issue checkout conflict")) return t("common.apiErrors.issueCheckoutConflict", { defaultValue: "This issue checkout conflicts with the current run state." });
  if (lower.includes("issue run ownership conflict")) return t("common.apiErrors.issueRunOwnershipConflict", { defaultValue: "This run does not own the issue checkout." });
  if (lower.includes("only assignee can release issue")) return t("common.apiErrors.onlyAssigneeCanReleaseIssue", { defaultValue: "Only the assignee can release this issue." });
  if (lower.includes("only checkout run can release issue")) return t("common.apiErrors.onlyCheckoutRunCanReleaseIssue", { defaultValue: "Only the checkout run can release this issue." });
  if (lower.includes("agent shortname is ambiguous")) return t("common.apiErrors.agentShortnameAmbiguous", { defaultValue: "Agent shortname is ambiguous in this company. Use the agent ID." });
  if (lower.includes("blocked recovery resolution requires")) return t("common.apiErrors.blockedRecoveryResolutionRequiresBlocker", { defaultValue: "Blocked recovery resolution requires an unresolved first-class blocker on the source issue." });
  if (lower.includes("parent issue already has the maximum")) return t("common.apiErrors.parentIssueChildLimit", { defaultValue: "The parent issue already has the maximum number of helper-created child issues." });
  if (lower.includes("comment authortype must match authenticated actor")) return t("common.apiErrors.commentAuthorTypeMismatch", { defaultValue: "Comment author type must match the authenticated actor." });
  if (lower.includes("system comments cannot use user or agent authortype without an author id")) return t("common.apiErrors.systemCommentAuthorRequired", { defaultValue: "System comments need an author id when using a user or agent author type." });
  if (lower.includes("one or more labels are invalid for this company")) return t("common.apiErrors.invalidCompanyLabels", { defaultValue: "One or more labels are invalid for this company." });
  if (lower.includes("attachment comment must belong to same issue and company")) return t("common.apiErrors.attachmentCommentScopeMismatch", { defaultValue: "Attachment comments must belong to the same issue and company." });
  if (lower.includes("follow-up blocked by active subtree pause hold")) return t("common.apiErrors.issuePaused", { defaultValue: "This issue is paused." });
  if (lower.includes("requires an assigned agent")) return t("common.apiErrors.assignedAgentRequired", { defaultValue: "This action requires an assigned agent." });
  if (lower.includes("search rate limit exceeded")) return t("common.apiErrors.searchRateLimited", { defaultValue: "Search is rate limited. Try again in a moment." });
  if (lower.includes("only pending approval agents can be approved")) return t("common.apiErrors.pendingApprovalRequired", { defaultValue: "Only pending approval agents can be approved." });
  if (lower.includes("issue monitor is not ready to dispatch")) return t("common.apiErrors.issueMonitorNotReady", { defaultValue: "This issue monitor is not ready to dispatch." });
  if (lower.includes("issue monitor trigger requires an actor")) return t("common.apiErrors.issueMonitorActorRequired", { defaultValue: "This issue monitor trigger requires an actor." });
  if (lower.includes("issue has no scheduled monitor")) return t("common.apiErrors.issueMonitorMissing", { defaultValue: "This issue has no scheduled monitor." });
  if (lower.includes("issue monitor requires an agent assignee")) return t("common.apiErrors.issueMonitorAssigneeRequired", { defaultValue: "This issue monitor requires an agent assignee." });
  if (lower.includes("issue monitor can only run")) return t("common.apiErrors.issueMonitorStatusInvalid", { defaultValue: "This issue monitor can only run while the issue is in progress or in review." });
  if (lower.includes("issue monitor check is already in progress")) return t("common.apiErrors.issueMonitorAlreadyRunning", { defaultValue: "An issue monitor check is already in progress." });
  if (lower.includes("only the assignee agent or a board user can manage issue monitors")) return t("common.apiErrors.issueMonitorManagePermission", { defaultValue: "Only the assignee agent or a board user can manage issue monitors." });
  if (lower.includes("queued comment")) return t("common.apiErrors.queuedCommentUnavailable", { defaultValue: "The queued comment can no longer be updated." });
  if (lower.includes("follow-up intent requires a comment")) return t("common.apiErrors.commentRequired", { defaultValue: "A comment is required." });
  if (lower.includes("interrupt is only supported")) return t("common.apiErrors.interruptCommentOnly", { defaultValue: "Interrupt is only supported when posting a comment." });
  if (lower.includes("reviewrequest requires an active review or approval stage")) return t("common.apiErrors.approvalActiveReviewRequired", { defaultValue: "This action requires an active review or approval stage." });
  if (lower.includes("unsupported watchdog decision")) return t("common.apiErrors.watchdogDecisionUnsupported", { defaultValue: "This watchdog decision is not supported." });
  if (lower.includes("workspace") && lower.includes("local path")) return t("common.apiErrors.workspaceLocalPathRequired", { defaultValue: "This workspace needs a local path before commands can run." });
  if (lower.includes("workspace command") && lower.includes("not found")) return t("common.apiErrors.workspaceCommandNotFound", { defaultValue: "Workspace command not found." });
  if (lower.includes("runtime service") && lower.includes("not found")) return t("common.apiErrors.runtimeServiceNotFound", { defaultValue: "Runtime service not found." });
  if (lower.includes("selected runtime service is not defined")) return t("common.apiErrors.runtimeServiceNotDefined", { defaultValue: "The selected runtime service is not defined in this workspace config." });
  if (lower.includes("select a workspace job")) return t("common.apiErrors.workspaceJobRequired", { defaultValue: "Select a workspace job to run." });
  if (lower.includes("workspace has no workspace command configuration")) return t("common.apiErrors.workspaceConfigMissing", { defaultValue: "This workspace has no command configuration." });
  if (lower.includes("instructions file path must stay within the bundle root")) return t("common.apiErrors.instructionsPathOutsideBundle", { defaultValue: "Instructions file paths must stay inside the bundle root." });
  if (lower.includes("agent instructions bundle is not configured")) return t("common.apiErrors.instructionsBundleMissing", { defaultValue: "This agent instructions bundle is not configured." });
  if (lower.includes("cannot delete the bundle entry file")) return t("common.apiErrors.instructionsEntryCannotDelete", { defaultValue: "The bundle entry file cannot be deleted." });
  if (lower.includes("cannot delete the legacy prompttemplate pseudo-file")) return t("common.apiErrors.legacyPromptCannotDelete", { defaultValue: "The legacy prompt template pseudo-file cannot be deleted." });
  if (lower.includes("external instructions bundles require an absolute rootpath")) return t("common.apiErrors.instructionsAbsoluteRootRequired", { defaultValue: "External instructions bundles require an absolute root path." });
  if (lower.includes("local folder key is not declared")) return t("common.apiErrors.localFolderKeyUnknown", { defaultValue: "This local folder key is not declared by the plugin manifest." });
  if (lower.includes("local folder relative paths must stay inside") || lower.includes("local folder path traversal")) return t("common.apiErrors.localFolderPathTraversal", { defaultValue: "Local folder paths must stay inside the configured root." });
  if (lower.includes("local folder symlink escape")) return t("common.apiErrors.localFolderSymlinkEscape", { defaultValue: "Local folder symlink escape is not allowed." });
  if (lower.includes("local folder is not configured or readable")) return t("common.apiErrors.localFolderNotReadable", { defaultValue: "This local folder is not configured or readable." });
  if (lower.includes("local folder is not healthy")) return t("common.apiErrors.localFolderUnhealthy", { defaultValue: "This local folder is not healthy." });
  if (lower.includes("plugin bridge is not enabled") || lower.includes("plugin stream bridge is not enabled")) return t("common.apiErrors.pluginBridgeDisabled", { defaultValue: "The plugin bridge is not enabled." });
  if (lower.includes("plugin tool dispatch is not enabled")) return t("common.apiErrors.pluginToolDispatchDisabled", { defaultValue: "Plugin tool dispatch is not enabled." });
  if (lower.includes("job scheduling is not enabled")) return t("common.apiErrors.jobSchedulingDisabled", { defaultValue: "Job scheduling is not enabled." });
  if (lower.includes("webhook ingestion is not enabled")) return t("common.apiErrors.webhookIngestionDisabled", { defaultValue: "Webhook ingestion is not enabled." });
  if (lower.includes("plugin api routes accept json requests only")) return t("common.apiErrors.pluginJsonOnly", { defaultValue: "Plugin API routes accept JSON requests only." });
  if (lower.includes("plugin api request body is too large")) return t("common.apiErrors.pluginBodyTooLarge", { defaultValue: "Plugin API request body is too large." });
  if (lower.includes("plugin does not declare a ui bundle")) return t("common.apiErrors.pluginUiBundleMissing", { defaultValue: "This plugin does not declare a UI bundle." });
  if (lower.includes("plugin does not expose scoped api routes")) return t("common.apiErrors.pluginScopedRoutesMissing", { defaultValue: "This plugin does not expose scoped API routes." });
  if (lower.includes("plugin installed but manifest is missing") || lower.includes("plugin manifest is missing")) return t("common.apiErrors.pluginManifestMissing", { defaultValue: "Plugin manifest is missing." });
  if (lower.includes("plugin installed but not found in registry")) return t("common.apiErrors.pluginInstalledMissing", { defaultValue: "Plugin was installed but is not available in the registry." });
  if (lower.includes("plugin scoped api routes are not enabled")) return t("common.apiErrors.pluginScopedRoutesDisabled", { defaultValue: "Plugin scoped API routes are not enabled." });
  if (lower.includes("plugin worker is not running")) return t("common.apiErrors.pluginWorkerNotRunning", { defaultValue: "Plugin worker is not running." });
  if (lower.includes("plugin is not ready")) return t("common.apiErrors.pluginNotReady", { defaultValue: "Plugin is not ready." });
  if (lower.includes("unable to resolve company for plugin api route")) return t("common.apiErrors.pluginRouteCompanyMissing", { defaultValue: "Unable to resolve the company for this plugin API route." });
  if (lower.includes("dev_server_supervisor_unavailable")) return t("common.apiErrors.devServerUnavailable", { defaultValue: "The development server supervisor is unavailable." });
  if (lower.includes("restart_not_required")) return t("common.apiErrors.restartNotRequired", { defaultValue: "Restart is not required." });
  if (lower.includes("use /api/agents/:id/permissions for permission changes")) return t("common.apiErrors.usePermissionsEndpoint", { defaultValue: "Use the agent permissions endpoint for permission changes." });
  if (lower.includes("database backup already in progress")) return t("common.apiErrors.databaseBackupInProgress", { defaultValue: "A database backup is already in progress." });
  if (lower.includes("cloud sync is not enabled")) return t("common.apiErrors.cloudSyncDisabled", { defaultValue: "Cloud sync is not enabled." });
  if (lower.includes("new budget must exceed current observed spend")) return t("common.apiErrors.budgetIncreaseRequired", { defaultValue: "The new budget must exceed the current observed spend." });
  if (lower.includes("budget scope does not belong to company")) return t("common.apiErrors.budgetScopeCompanyMismatch", { defaultValue: "This budget scope does not belong to the selected company." });
  if (lower.includes("aws secrets manager provider vault is disabled")) return t("common.apiErrors.providerVaultDisabled", { defaultValue: "This provider vault is disabled." });
  if (lower.includes("aws secrets manager provider vault runtime is locked")) return t("common.apiErrors.providerVaultRuntimeLocked", { defaultValue: "This provider vault runtime is locked." });
  if (lower.includes("aws secrets manager provider vault requires")) return t("common.apiErrors.providerVaultConfigMissing", { defaultValue: "This provider vault is missing required configuration." });
  if (lower.includes("aws secrets manager provider requires secret context")) return t("common.apiErrors.secretContextRequired", { defaultValue: "Secret context is required for managed values." });
  if (lower.includes("invalid aws secrets manager material") || lower.includes("invalid local_encrypted secret material")) return t("common.apiErrors.invalidSecretMaterial", { defaultValue: "The secret material is invalid." });
  if (lower.includes("local_encrypted does not support external reference secrets")) return t("common.apiErrors.localEncryptedNoExternalReference", { defaultValue: "The local encrypted provider does not support external reference secrets." });
  return null;
}

export function formatApiError(error: unknown, t: TFunction, fallback?: string): string {
  const code = readCode(error);
  if (code) {
    const key = `common.apiErrors.codes.${normalizeCode(code)}`;
    const translated = t(key, { defaultValue: "" });
    if (translated.trim()) return translated;
  }

  const message = readMessage(error);
  if (message) {
    const translated = translateKnownMessage(message, t);
    if (translated) return translated;
  }

  const status = readStatus(error);
  if (status === 400) return t("common.apiErrors.badRequest", { defaultValue: "The request was invalid." });
  if (status === 401) return t("common.apiErrors.unauthorized", { defaultValue: "Sign in is required." });
  if (status === 403) return t("common.apiErrors.forbidden", { defaultValue: "You do not have permission to perform this action." });
  if (status === 404) return t("common.apiErrors.notFound", { defaultValue: "The requested resource was not found." });
  if (status === 409) return t("common.apiErrors.conflict", { defaultValue: "This action conflicts with the current state. Refresh and try again." });
  if (status === 413) return t("common.apiErrors.payloadTooLarge", { defaultValue: "The request body is too large." });
  if (status === 415) return t("common.apiErrors.unsupportedMediaType", { defaultValue: "This request format is not supported." });
  if (status === 422) return t("common.apiErrors.unprocessable", { defaultValue: "The submitted data could not be processed." });
  if (status === 429) return t("common.apiErrors.rateLimited", { defaultValue: "Too many requests. Try again in a moment." });
  if (status === 501) return t("common.apiErrors.notImplemented", { defaultValue: "This feature is not available yet." });
  if (status === 503) return t("common.apiErrors.serviceUnavailable", { defaultValue: "This service is temporarily unavailable." });
  if (status && status >= 500) return t("common.apiErrors.serverError", { defaultValue: "The server hit an error. Try again in a moment." });

  if (error instanceof Error && message) return message;
  return fallback ?? message ?? t("common.unknownError", { defaultValue: "Unknown error" });
}
