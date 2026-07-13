import { describe, expect, it } from "vitest";
import type { AdapterEnvironmentCheck } from "@paperclipai/shared";
import type { TFunction } from "i18next";
import { i18n } from "@/i18n";
import {
  formatAdapterEnvironmentCheckHint,
  formatAdapterEnvironmentCheckMessage,
  formatAdapterEnvironmentLevel,
} from "./adapter-environment-format";

const zhT = i18n.getFixedT("zh-CN") as unknown as TFunction;

describe("adapter environment formatting", () => {
  it("localizes backend adapter test checks by code", () => {
    const checks: AdapterEnvironmentCheck[] = [
      {
        code: "environment_lease_acquire_failed",
        level: "error",
        message: "Could not acquire a lease for environment \"Sandbox\".",
        hint: "Check the environment's provider credentials and quota.",
      },
      {
        code: "codex_command_unresolvable",
        level: "warn",
        message: "Codex command could not be resolved.",
      },
      {
        code: "http_url_protocol_invalid",
        level: "error",
        message: "Webhook URL must use http or https.",
      },
    ];

    for (const check of checks) {
      const message = formatAdapterEnvironmentCheckMessage(check, zhT);
      expect(message, check.code).not.toBe(check.message);
      expect(message, check.code).toMatch(/\p{Script=Han}/u);
    }
  });

  it("localizes levels and known hints", () => {
    expect(formatAdapterEnvironmentLevel("warn", zhT)).toBe("警告");
    expect(formatAdapterEnvironmentCheckHint({
      code: "environment_lease_acquire_failed",
      level: "error",
      message: "Could not acquire a lease.",
      hint: "Check the environment's provider credentials and quota.",
    }, zhT)).toBe("请检查环境提供方凭据和配额。");
  });
});
