import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { formatMonitorNotes, formatMonitorServiceName } from "./issue-monitor";

const messages: Record<string, string> = {
  "components.issueMonitor.serviceNames.providerQuota": "AI 提供商配额",
  "components.issueMonitor.serviceDescriptions.providerQuota": "已达到提供商用量配额；请{{timing}}重试{{target}}。",
  "components.issueMonitor.providerQuotaTargets.originalAssignee": "原负责人",
  "components.issueMonitor.providerQuotaTargets.activeReviewParticipant": "当前评审参与者",
  "components.issueMonitor.providerQuotaTimings.providerResetTime": "在提供商配额重置时",
  "components.issueMonitor.providerQuotaTimings.defaultRecoveryBackoff": "在默认恢复退避结束后",
};

const translate = ((key: string, options?: Record<string, unknown>) => {
  const message = messages[key] ?? (typeof options?.defaultValue === "string" ? options.defaultValue : key);
  return message.replace(/{{(\w+)}}/g, (_, name: string) => String(options?.[name] ?? ""));
}) as unknown as TFunction;

describe("issue monitor copy", () => {
  it("localizes the built-in provider quota monitor", () => {
    expect(formatMonitorServiceName("AI provider quota", translate)).toBe("AI 提供商配额");
    expect(
      formatMonitorNotes(
        "Provider usage quota reached; retry the original assignee after the default recovery backoff.",
        "AI provider quota",
        translate,
      ),
    ).toBe("已达到提供商用量配额；请在默认恢复退避结束后重试原负责人。");
    expect(
      formatMonitorNotes(
        "Provider usage quota reached; retry the active review participant at the provider reset time.",
        "AI provider quota",
        translate,
      ),
    ).toBe("已达到提供商用量配额；请在提供商配额重置时重试当前评审参与者。");
  });

  it("preserves user-defined monitor copy", () => {
    expect(formatMonitorServiceName("Deploy provider", translate)).toBe("Deploy provider");
    expect(formatMonitorNotes("Check deployment health", "Deploy provider", translate)).toBe(
      "Check deployment health",
    );
    expect(
      formatMonitorNotes("Custom quota recovery instructions", "AI provider quota", translate),
    ).toBe("Custom quota recovery instructions");
  });
});
