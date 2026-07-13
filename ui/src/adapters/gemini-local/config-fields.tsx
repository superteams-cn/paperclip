import type { AdapterConfigFieldsProps } from "../types";
import {
  DraftNumberInput,
  DraftInput,
  Field,
} from "../../components/agent-config-primitives";
import { ChoosePathButton } from "../../components/PathInstructionsModal";
import { useTranslation } from "react-i18next";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";

export function GeminiLocalConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
  hideInstructionsFile,
}: AdapterConfigFieldsProps) {
  const { t } = useTranslation();
  const rawEngine = isCreate
    ? values!.geminiEngine ?? "auto"
    : eff("adapterConfig", "engine", String(config.engine ?? "auto"));
  const engine = rawEngine === "acp" || rawEngine === "cli" ? rawEngine : "auto";
  const acpSelected = engine === "acp";

  return (
    <>
      <Field
        label={t("adapters.configFields.gemini.executionEngine", { defaultValue: "Execution engine" })}
        hint={t("adapters.configFields.gemini.executionEngineHint", { defaultValue: "Auto uses ACP when prerequisites pass and falls back to Gemini CLI with diagnostics." })}
      >
        <select
          className={inputClass}
          value={engine}
          onChange={(e) => {
            const value = e.target.value === "acp" ? "acp" : e.target.value === "cli" ? "cli" : "auto";
            isCreate
              ? set!({ geminiEngine: value })
              : mark("adapterConfig", "engine", value === "auto" ? undefined : value);
          }}
        >
          <option value="auto">{t("adapters.configFields.gemini.engineAuto", { defaultValue: "Auto (ACP preferred)" })}</option>
          <option value="cli">{t("adapters.configFields.gemini.engineCli", { defaultValue: "Gemini CLI" })}</option>
          <option value="acp">{t("adapters.configFields.gemini.engineAcp", { defaultValue: "ACP" })}</option>
        </select>
      </Field>
      {acpSelected && (
        <>
          <Field
            label={t("adapters.configFields.gemini.acpServerCommand", { defaultValue: "ACP server command" })}
            hint={t("adapters.configFields.gemini.acpServerCommandHint", { defaultValue: "Optional override for the Gemini ACP server command. Defaults to gemini --acp." })}
          >
            <DraftInput
              value={
                isCreate
                  ? values!.geminiAcpAgentCommand ?? ""
                  : eff("adapterConfig", "agentCommand", String(config.agentCommand ?? ""))
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ geminiAcpAgentCommand: v })
                  : mark("adapterConfig", "agentCommand", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="gemini --acp"
            />
          </Field>
          <Field label={t("adapters.configFields.gemini.acpSessionMode", { defaultValue: "ACP session mode" })} hint={t("adapters.configFields.gemini.acpSessionModeHint", { defaultValue: "Persistent keeps ACP session state between runs. One-shot starts fresh each run." })}>
            <select
              className={inputClass}
              value={
                isCreate
                  ? values!.geminiAcpMode ?? "persistent"
                  : eff("adapterConfig", "mode", String(config.mode ?? "persistent"))
              }
              onChange={(e) => {
                const value = e.target.value === "oneshot" ? "oneshot" : "persistent";
                isCreate
                  ? set!({ geminiAcpMode: value })
                  : mark("adapterConfig", "mode", value);
              }}
            >
              <option value="persistent">{t("adapters.configFields.gemini.acpModePersistent", { defaultValue: "Persistent" })}</option>
              <option value="oneshot">{t("adapters.configFields.gemini.acpModeOneshot", { defaultValue: "One-shot" })}</option>
            </select>
          </Field>
          <Field
            label={t("adapters.configFields.gemini.acpNonInteractivePermissions", { defaultValue: "ACP non-interactive permissions" })}
            hint={t("adapters.configFields.gemini.acpNonInteractivePermissionsHint", { defaultValue: "Fallback if the ACP agent asks for input outside an interactive session." })}
          >
            <select
              className={inputClass}
              value={
                isCreate
                  ? values!.geminiAcpNonInteractivePermissions ?? "deny"
                  : eff("adapterConfig", "nonInteractivePermissions", String(config.nonInteractivePermissions ?? "deny"))
              }
              onChange={(e) => {
                const value = e.target.value === "fail" ? "fail" : "deny";
                isCreate
                  ? set!({ geminiAcpNonInteractivePermissions: value })
                  : mark("adapterConfig", "nonInteractivePermissions", value);
              }}
            >
              <option value="deny">{t("adapters.configFields.gemini.permissionsDeny", { defaultValue: "Deny" })}</option>
              <option value="fail">{t("adapters.configFields.gemini.permissionsFail", { defaultValue: "Fail" })}</option>
            </select>
          </Field>
          <Field
            label={t("adapters.configFields.gemini.acpStateDirectory", { defaultValue: "ACP state directory" })}
            hint={t("adapters.configFields.gemini.acpStateDirectoryHint", { defaultValue: "Optional ACP session state directory. Defaults to Paperclip-managed company/agent scoped storage." })}
          >
            <div className="flex items-center gap-2">
              <DraftInput
                value={
                  isCreate
                    ? values!.geminiAcpStateDir ?? ""
                    : eff("adapterConfig", "stateDir", String(config.stateDir ?? ""))
                }
                onCommit={(v) =>
                  isCreate
                    ? set!({ geminiAcpStateDir: v })
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
            label={t("adapters.configFields.gemini.acpWarmProcessIdleMs", { defaultValue: "ACP warm process idle ms" })}
            hint={t("adapters.configFields.gemini.acpWarmProcessIdleMsHint", { defaultValue: "Defaults to 0, which closes the ACP process after each run while retaining persistent session state." })}
          >
            {isCreate ? (
              <input
                type="number"
                className={inputClass}
                value={values!.geminiAcpWarmHandleIdleMs ?? 0}
                onChange={(e) => set!({ geminiAcpWarmHandleIdleMs: Number(e.target.value) })}
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
        <Field label={t("adapters.configFields.agentInstructionsFile", { defaultValue: "Agent instructions file" })} hint={t("adapters.configFields.agentInstructionsFileHintGemini", { defaultValue: "Absolute path to a markdown file (e.g. AGENTS.md) that defines this agent's behavior. Prepended to the Gemini prompt at runtime." })}>
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
    </>
  );
}
