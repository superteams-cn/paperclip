import type { AdapterEnvironmentCheck, AdapterEnvironmentCheckLevel } from "@paperclipai/shared";
import type { TFunction } from "i18next";

function adapterNameFromCode(code: string): string {
  if (code.startsWith("claude_")) return "Claude";
  if (code.startsWith("codex_")) return "Codex";
  if (code.startsWith("cursor_cloud_")) return "Cursor Cloud";
  if (code.startsWith("cursor_")) return "Cursor";
  if (code.startsWith("gemini_")) return "Gemini";
  if (code.startsWith("grok_")) return "Grok";
  if (code.startsWith("opencode_")) return "OpenCode";
  if (code.startsWith("openclaw_gateway_")) return "OpenClaw Gateway";
  if (code.startsWith("pi_")) return "Pi";
  if (code.startsWith("process_")) return "Process";
  if (code.startsWith("http_")) return "HTTP";
  if (code.startsWith("acpx_")) return "ACPX";
  return "";
}

export function formatAdapterEnvironmentLevel(level: AdapterEnvironmentCheckLevel, t: TFunction): string {
  if (level === "info") return t("common.adapterEnvironment.levels.info", { defaultValue: "Info" });
  if (level === "warn") return t("common.adapterEnvironment.levels.warn", { defaultValue: "Warning" });
  return t("common.adapterEnvironment.levels.error", { defaultValue: "Error" });
}

export function formatAdapterEnvironmentCheckMessage(check: AdapterEnvironmentCheck, t: TFunction): string {
  const code = check.code;
  const adapter = adapterNameFromCode(code);
  const options = { adapter, defaultValue: check.message };

  if (code === "environment_not_found") return t("common.adapterEnvironment.checks.environmentNotFound", options);
  if (code === "environment_target_unavailable") return t("common.adapterEnvironment.checks.environmentTargetUnavailable", options);
  if (code === "environment_target_failed") return t("common.adapterEnvironment.checks.environmentTargetFailed", options);
  if (code === "environment_lease_acquire_failed") return t("common.adapterEnvironment.checks.environmentLeaseAcquireFailed", options);
  if (code === "environment_workspace_realize_failed") return t("common.adapterEnvironment.checks.environmentWorkspaceRealizeFailed", options);
  if (code === "environment_target_unsupported") return t("common.adapterEnvironment.checks.environmentTargetUnsupported", options);

  if (code.endsWith("_environment_target")) return t("common.adapterEnvironment.checks.adapterEnvironmentTarget", options);
  if (code.endsWith("_cwd_valid")) return t("common.adapterEnvironment.checks.cwdValid", options);
  if (code.endsWith("_cwd_invalid")) return t("common.adapterEnvironment.checks.cwdInvalid", options);
  if (code.endsWith("_command_resolvable")) return t("common.adapterEnvironment.checks.commandResolvable", options);
  if (code.endsWith("_command_unresolvable")) return t("common.adapterEnvironment.checks.commandUnresolvable", options);
  if (code.endsWith("_command_missing") || code.endsWith("_custom_command_missing")) return t("common.adapterEnvironment.checks.commandMissing", options);
  if (code.endsWith("_command_present")) return t("common.adapterEnvironment.checks.commandPresent", options);
  if (code.endsWith("_command_skipped")) return t("common.adapterEnvironment.checks.commandSkipped", options);

  if (code.endsWith("_api_key_present") || code.endsWith("_auth_present") || code.endsWith("_native_auth_present")) return t("common.adapterEnvironment.checks.authPresent", options);
  if (code.endsWith("_api_key_missing") || code.endsWith("_auth_missing") || code.endsWith("_credentials_missing")) return t("common.adapterEnvironment.checks.authMissing", options);
  if (code.endsWith("_auth_failed")) return t("common.adapterEnvironment.checks.authFailed", options);
  if (code.includes("_hello_probe_timed_out") || code.includes("_probe_timed_out")) return t("common.adapterEnvironment.checks.probeTimedOut", options);
  if (code.includes("_hello_probe_auth_required")) return t("common.adapterEnvironment.checks.probeAuthRequired", options);
  if (code.includes("_hello_probe_failed") || code.includes("_probe_failed") || code.includes("_probe_error")) return t("common.adapterEnvironment.checks.probeFailed", options);
  if (code.includes("_hello_probe_passed") || code.includes("_probe_ok") || code.includes("_probe_passed")) return t("common.adapterEnvironment.checks.probePassed", options);
  if (code.includes("_hello_probe_skipped_custom_command")) return t("common.adapterEnvironment.checks.probeSkippedCustomCommand", options);
  if (code.includes("_hello_probe_unexpected_output")) return t("common.adapterEnvironment.checks.probeUnexpectedOutput", options);

  if (code.includes("_models_discovered")) return t("common.adapterEnvironment.checks.modelsDiscovered", options);
  if (code.includes("_models_empty")) return t("common.adapterEnvironment.checks.modelsEmpty", options);
  if (code.includes("_models_discovery_failed")) return t("common.adapterEnvironment.checks.modelsDiscoveryFailed", options);
  if (code.endsWith("_model_configured")) return t("common.adapterEnvironment.checks.modelConfigured", options);
  if (code.endsWith("_model_required")) return t("common.adapterEnvironment.checks.modelRequired", options);
  if (code.endsWith("_model_not_found") || code.endsWith("_model_invalid") || code.includes("_model_unavailable")) return t("common.adapterEnvironment.checks.modelInvalid", options);
  if (code.includes("_model_validation_skipped_remote")) return t("common.adapterEnvironment.checks.modelValidationSkippedRemote", options);

  if (code === "http_url_missing") return t("common.adapterEnvironment.checks.httpUrlMissing", options);
  if (code === "http_url_invalid") return t("common.adapterEnvironment.checks.httpUrlInvalid", options);
  if (code === "http_url_protocol_invalid") return t("common.adapterEnvironment.checks.httpUrlProtocolInvalid", options);
  if (code === "http_url_valid") return t("common.adapterEnvironment.checks.httpUrlValid", options);
  if (code === "http_method_configured") return t("common.adapterEnvironment.checks.httpMethodConfigured", options);
  if (code === "http_endpoint_probe_unexpected_status") return t("common.adapterEnvironment.checks.httpEndpointUnexpectedStatus", options);

  return check.message;
}

export function formatAdapterEnvironmentCheckHint(check: AdapterEnvironmentCheck, t: TFunction): string | null {
  if (!check.hint) return null;
  if (check.code === "environment_lease_acquire_failed") {
    return t("common.adapterEnvironment.hints.environmentCredentialsQuota", { defaultValue: "Check the environment's provider credentials and quota." });
  }
  return check.hint;
}
