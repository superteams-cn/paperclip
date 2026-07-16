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
import { useTranslation } from "react-i18next";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

export function ClaudeLocalConfigFields({
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
  return (
    <>
      {!hideInstructionsFile && (
        <Field
          label={t("adapters.configFields.agentInstructionsFile")}
          hint={t("adapters.configFields.agentInstructionsFileHint")}
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

export function ClaudeLocalAdvancedFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
}: AdapterConfigFieldsProps) {
  const { t } = useTranslation();
  const rawEngine = isCreate
    ? values!.claudeEngine ?? "auto"
    : eff("adapterConfig", "engine", String(config.engine ?? "auto"));
  const engine = rawEngine === "acp" || rawEngine === "cli" ? rawEngine : "auto";
  const acpSelected = engine === "acp";

  return (
    <>
      <Field label={t("adapters.configFields.executionEngine", { defaultValue: "Execution engine" })} hint={t("adapters.claudeLocal.executionEngineHint", { defaultValue: "Auto uses ACP when prerequisites pass and falls back to Claude CLI with diagnostics." })}>
        <select
          className={inputClass}
          value={engine}
          onChange={(e) => {
            const value = e.target.value === "acp" ? "acp" : e.target.value === "cli" ? "cli" : "auto";
            isCreate
              ? set!({ claudeEngine: value })
              : mark("adapterConfig", "engine", value === "auto" ? undefined : value);
          }}
        >
          <option value="auto">{t("adapters.claudeLocal.engineAutoAcp", { defaultValue: "Auto (ACP preferred)" })}</option>
          <option value="cli">{t("adapters.claudeLocal.engineClaudeCli", { defaultValue: "Claude CLI" })}</option>
          <option value="acp">ACP</option>
        </select>
      </Field>
      {acpSelected && (
        <>
          <Field
            label={t("adapters.configFields.acpServerCommand", { defaultValue: "ACP server command" })}
            hint={t("adapters.claudeLocal.acpServerCommandHint", { defaultValue: "Optional override for the Claude ACP server command. Defaults to the package-local claude-agent-acp binary." })}
          >
            <DraftInput
              value={
                isCreate
                  ? values!.claudeAcpAgentCommand ?? ""
                  : eff("adapterConfig", "agentCommand", String(config.agentCommand ?? ""))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ claudeAcpAgentCommand: v })
                  : mark("adapterConfig", "agentCommand", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="claude-agent-acp"
            />
          </Field>
          <Field label={t("adapters.configFields.acpSessionMode", { defaultValue: "ACP session mode" })} hint={t("adapters.configFields.acpSessionModeHint", { defaultValue: "Persistent keeps ACP session state between runs. One-shot starts fresh each run." })}>
            <select
              className={inputClass}
              value={
                isCreate
                  ? values!.claudeAcpMode ?? "persistent"
                  : eff("adapterConfig", "mode", String(config.mode ?? "persistent"))
              }
              onChange={(e) => {
                const value = e.target.value === "oneshot" ? "oneshot" : "persistent";
                isCreate
                  ? set!({ claudeAcpMode: value })
                  : mark("adapterConfig", "mode", value);
              }}
            >
              <option value="persistent">{t("adapters.configFields.acpModePersistent", { defaultValue: "Persistent" })}</option>
              <option value="oneshot">{t("adapters.claudeLocal.modeOneShot", { defaultValue: "One-shot" })}</option>
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
                  ? values!.claudeAcpNonInteractivePermissions ?? "deny"
                  : eff("adapterConfig", "nonInteractivePermissions", String(config.nonInteractivePermissions ?? "deny"))
              }
              onChange={(e) => {
                const value = e.target.value === "fail" ? "fail" : "deny";
                isCreate
                  ? set!({ claudeAcpNonInteractivePermissions: value })
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
                    ? values!.claudeAcpStateDir ?? ""
                    : eff("adapterConfig", "stateDir", String(config.stateDir ?? ""))
                }
                onCommit={(v) =>
                  isCreate
                    ? set!({ claudeAcpStateDir: v })
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
                value={values!.claudeAcpWarmHandleIdleMs ?? 0}
                onChange={(e) => set!({ claudeAcpWarmHandleIdleMs: Number(e.target.value) })}
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
      <ToggleField
        label={t("adapters.configFields.enableChrome")}
        hint={t("pages.agents.config.help.chrome", { defaultValue: help.chrome })}
        checked={
          isCreate
            ? values!.chrome
            : eff("adapterConfig", "chrome", config.chrome === true)
        }
        onChange={(v) =>
          isCreate
            ? set!({ chrome: v })
            : mark("adapterConfig", "chrome", v)
        }
      />
      <ToggleField
        label={t("adapters.configFields.skipPermissions")}
        hint={t("pages.agents.config.help.dangerouslySkipPermissions", { defaultValue: help.dangerouslySkipPermissions })}
        checked={
          isCreate
            ? values!.dangerouslySkipPermissions
            : eff(
                "adapterConfig",
                "dangerouslySkipPermissions",
                config.dangerouslySkipPermissions !== false,
              )
        }
        onChange={(v) =>
          isCreate
            ? set!({ dangerouslySkipPermissions: v })
            : mark("adapterConfig", "dangerouslySkipPermissions", v)
        }
      />
      <Field label={t("pages.agents.config.maxTurnsPerRun")} hint={t("pages.agents.config.help.maxTurnsPerRun", { defaultValue: help.maxTurnsPerRun })}>
        {isCreate ? (
          <input
            type="number"
            className={inputClass}
            value={values!.maxTurnsPerRun}
            onChange={(e) => set!({ maxTurnsPerRun: Number(e.target.value) })}
          />
        ) : (
          <DraftNumberInput
            value={eff(
              "adapterConfig",
              "maxTurnsPerRun",
              Number(config.maxTurnsPerRun ?? 1000),
            )}
            onCommit={(v) => mark("adapterConfig", "maxTurnsPerRun", v || 1000)}
            immediate
            className={inputClass}
          />
        )}
      </Field>
    </>
  );
}
