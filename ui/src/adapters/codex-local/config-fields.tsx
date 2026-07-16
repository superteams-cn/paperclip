import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  ToggleField,
  DraftInput,
  DraftNumberInput,
  help,
} from "../../components/agent-config-primitives";
import { ChoosePathButton } from "../../components/PathInstructionsModal";
import { LocalWorkspaceRuntimeFields } from "../local-workspace-runtime-fields";
import {
  CODEX_LOCAL_FAST_MODE_SUPPORTED_MODELS,
  isCodexLocalFastModeSupported,
  isCodexLocalManualModel,
} from "@paperclipai/adapter-codex-local";
import { useTranslation } from "react-i18next";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

export function CodexLocalConfigFields({
  mode,
  isCreate,
  adapterType,
  values,
  set,
  config,
  eff,
  mark,
  models,
  hideInstructionsFile,
}: AdapterConfigFieldsProps) {
  const { t } = useTranslation();
  const rawEngine = isCreate
    ? values!.codexEngine ?? "auto"
    : eff("adapterConfig", "engine", String(config.engine ?? "auto"));
  const engine = rawEngine === "acp" || rawEngine === "cli" ? rawEngine : "auto";
  const acpSelected = engine === "acp";
  const bypassEnabled =
    config.dangerouslyBypassApprovalsAndSandbox === true || config.dangerouslyBypassSandbox === true;
  const fastModeEnabled = isCreate
    ? Boolean(values!.fastMode)
    : eff("adapterConfig", "fastMode", Boolean(config.fastMode));
  const currentModel = isCreate
    ? String(values!.model ?? "")
    : eff("adapterConfig", "model", String(config.model ?? ""));
  const fastModeManualModel = isCodexLocalManualModel(currentModel);
  const fastModeSupported = isCodexLocalFastModeSupported(currentModel);
  const supportedModelsLabel = CODEX_LOCAL_FAST_MODE_SUPPORTED_MODELS.join(", ");
  const fastModeMessage = fastModeManualModel
    ? t("adapters.configFields.fastModeManual")
    : fastModeSupported
      ? t("adapters.configFields.fastModeSupported")
      : t("adapters.configFields.fastModeUnsupported", { models: supportedModelsLabel });

  return (
    <>
      <Field label={t("adapters.configFields.executionEngine", { defaultValue: "Execution engine" })} hint={t("adapters.codexLocal.executionEngineHint", { defaultValue: "Auto uses ACP when prerequisites pass and falls back to Codex CLI with diagnostics." })}>
        <select
          className={inputClass}
          value={engine}
          onChange={(e) => {
            const value = e.target.value === "acp" ? "acp" : e.target.value === "cli" ? "cli" : "auto";
            isCreate
              ? set!({ codexEngine: value })
              : mark("adapterConfig", "engine", value === "auto" ? undefined : value);
          }}
        >
          <option value="auto">{t("adapters.codexLocal.engineAutoAcpPreferred", { defaultValue: "Auto (ACP preferred)" })}</option>
          <option value="cli">{t("adapters.codexLocal.engineCodexCli", { defaultValue: "Codex CLI" })}</option>
          <option value="acp">ACP</option>
        </select>
      </Field>
      {acpSelected && (
        <>
          <Field
            label={t("adapters.configFields.acpServerCommand", { defaultValue: "ACP server command" })}
            hint={t("adapters.codexLocal.acpServerCommandHint", { defaultValue: "Optional override for the Codex ACP server command. Defaults to the package-local codex-acp binary." })}
          >
            <DraftInput
              value={
                isCreate
                  ? values!.codexAcpAgentCommand ?? ""
                  : eff("adapterConfig", "agentCommand", String(config.agentCommand ?? ""))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ codexAcpAgentCommand: v })
                  : mark("adapterConfig", "agentCommand", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="codex-acp"
            />
          </Field>
          <Field label={t("adapters.configFields.acpSessionMode", { defaultValue: "ACP session mode" })} hint={t("adapters.configFields.acpSessionModeHint", { defaultValue: "Persistent keeps ACP session state between runs. One-shot starts fresh each run." })}>
            <select
              className={inputClass}
              value={
                isCreate
                  ? values!.codexAcpMode ?? "persistent"
                  : eff("adapterConfig", "mode", String(config.mode ?? "persistent"))
              }
              onChange={(e) => {
                const value = e.target.value === "oneshot" ? "oneshot" : "persistent";
                isCreate
                  ? set!({ codexAcpMode: value })
                  : mark("adapterConfig", "mode", value);
              }}
            >
              <option value="persistent">{t("adapters.configFields.acpModePersistent", { defaultValue: "Persistent" })}</option>
              <option value="oneshot">{t("adapters.codexLocal.modeOneShot", { defaultValue: "One-shot" })}</option>
            </select>
          </Field>
          <Field
            label={t("adapters.configFields.acpNonInteractivePermissions", { defaultValue: "ACP non-interactive permissions" })}
            hint={t("adapters.configFields.acpNonInteractivePermissionsHint", { defaultValue: "Fallback if the ACP agent asks for input outside an interactive session." })}
          >
            <select
              className={inputClass}
              value={
                isCreate
                  ? values!.codexAcpNonInteractivePermissions ?? "deny"
                  : eff("adapterConfig", "nonInteractivePermissions", String(config.nonInteractivePermissions ?? "deny"))
              }
              onChange={(e) => {
                const value = e.target.value === "fail" ? "fail" : "deny";
                isCreate
                  ? set!({ codexAcpNonInteractivePermissions: value })
                  : mark("adapterConfig", "nonInteractivePermissions", value);
              }}
            >
              <option value="deny">{t("adapters.configFields.permissionsDeny", { defaultValue: "Deny" })}</option>
              <option value="fail">{t("adapters.configFields.permissionsFail", { defaultValue: "Fail" })}</option>
            </select>
          </Field>
          <Field
            label={t("adapters.configFields.acpStateDirectory", { defaultValue: "ACP state directory" })}
            hint={t("adapters.configFields.acpStateDirectoryHint", { defaultValue: "Optional ACP session state directory. Defaults to Paperclip-managed company/agent scoped storage." })}
          >
            <div className="flex items-center gap-2">
              <DraftInput
                value={
                  isCreate
                    ? values!.codexAcpStateDir ?? ""
                    : eff("adapterConfig", "stateDir", String(config.stateDir ?? ""))
                }
                onCommit={(v) =>
                  isCreate
                    ? set!({ codexAcpStateDir: v })
                    : mark("adapterConfig", "stateDir", v || undefined)
                }
                immediate
                className={inputClass}
                placeholder="/path/to/acp-state"
              />
              <ChoosePathButton />
            </div>
          </Field>
          <Field
            label={t("adapters.configFields.acpWarmProcessIdleMs", { defaultValue: "ACP warm process idle ms" })}
            hint={t("adapters.configFields.acpWarmProcessIdleMsHint", { defaultValue: "Defaults to 0, which closes the ACP process after each run while retaining persistent session state." })}
          >
            {isCreate ? (
              <input
                type="number"
                className={inputClass}
                value={values!.codexAcpWarmHandleIdleMs ?? 0}
                onChange={(e) => set!({ codexAcpWarmHandleIdleMs: Number(e.target.value) })}
              />
            ) : (
              <DraftNumberInput
                value={eff(
                  "adapterConfig",
                  "warmHandleIdleMs",
                  Number(config.warmHandleIdleMs ?? 0),
                )}
                onCommit={(v) => mark("adapterConfig", "warmHandleIdleMs", v || 0)}
                immediate
                className={inputClass}
              />
            )}
          </Field>
        </>
      )}
      {!hideInstructionsFile && (
        <Field
          label={t("adapters.configFields.agentInstructionsFile")}
          hint={t("adapters.configFields.agentInstructionsFileHintCodex")}
        >
          <div className="flex items-center gap-2">
            <DraftInput
              value={
                isCreate
                  ? values!.instructionsFilePath ?? ""
                  : eff(
                      "adapterConfig",
                      "instructionsFilePath",
                      String(config.instructionsFilePath ?? ""),
                    )
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ instructionsFilePath: v })
                  : mark("adapterConfig", "instructionsFilePath", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="/absolute/path/to/AGENTS.md"
            />
            <ChoosePathButton />
          </div>
        </Field>
      )}
      <ToggleField
        label={t("adapters.configFields.bypassSandbox")}
        hint={t("pages.agents.config.help.dangerouslyBypassSandbox", { defaultValue: help.dangerouslyBypassSandbox })}
        checked={
          isCreate
            ? values!.dangerouslyBypassSandbox
            : eff(
                "adapterConfig",
                "dangerouslyBypassApprovalsAndSandbox",
                bypassEnabled,
              )
        }
        onChange={(v) =>
          isCreate
            ? set!({ dangerouslyBypassSandbox: v })
            : mark("adapterConfig", "dangerouslyBypassApprovalsAndSandbox", v)
        }
      />
      <ToggleField
        label={t("adapters.configFields.enableSearch")}
        hint={t("pages.agents.config.help.search", { defaultValue: help.search })}
        checked={
          isCreate
            ? values!.search
            : eff("adapterConfig", "search", !!config.search)
        }
        onChange={(v) =>
          isCreate
            ? set!({ search: v })
            : mark("adapterConfig", "search", v)
        }
      />
      <ToggleField
        label={t("adapters.configFields.fastMode")}
        hint={t("pages.agents.config.help.fastMode", { defaultValue: help.fastMode })}
        checked={fastModeEnabled}
        onChange={(v) =>
          isCreate
            ? set!({ fastMode: v })
            : mark("adapterConfig", "fastMode", v)
        }
      />
      {fastModeEnabled && (
        <div className="rounded-md border border-amber-300/70 bg-amber-50/80 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          {fastModeMessage}
        </div>
      )}
      <LocalWorkspaceRuntimeFields
        isCreate={isCreate}
        values={values}
        set={set}
        config={config}
        mark={mark}
        eff={eff}
        mode={mode}
        adapterType={adapterType}
        models={models}
      />
    </>
  );
}
