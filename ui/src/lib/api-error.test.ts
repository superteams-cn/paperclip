import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { AuthApiError } from "@/api/auth";
import { ApiError } from "@/api/client";
import { formatApiError } from "./api-error";
import { i18n, t } from "@/i18n";

const testT = t as unknown as TFunction;
const zhT = i18n.getFixedT("zh-CN") as unknown as TFunction;

describe("formatApiError", () => {
  it("translates known backend error messages", () => {
    const error = new ApiError("Issue is checked out by another agent", 409, {
      error: "Issue is checked out by another agent",
    });

    expect(formatApiError(error, testT)).toBe("This issue is checked out by another agent.");
  });

  it("uses HTTP status fallbacks instead of raw request failure text", () => {
    const error = new ApiError("Request failed: 403", 403, null);

    expect(formatApiError(error, testT)).toBe("You do not have permission to perform this action.");
  });

  it("localizes API-only status fallbacks that the server returns", () => {
    const statuses = [413, 415, 422, 501, 503];

    for (const status of statuses) {
      const translated = formatApiError(new ApiError(`Request failed: ${status}`, status, null), zhT);
      expect(translated, String(status)).not.toBe(`Request failed: ${status}`);
      expect(translated, String(status)).toMatch(/\p{Script=Han}/u);
    }
  });

  it("uses caller fallback for unknown non-API errors", () => {
    expect(formatApiError("oops", testT, "Fallback message")).toBe("Fallback message");
  });

  it("preserves local Error messages that are already user-facing", () => {
    expect(formatApiError(new Error("Invalid JSON."), testT, "Save failed")).toBe("Invalid JSON.");
  });

  it("translates common backend not-found resources", () => {
    const error = new ApiError("Execution workspace not found", 404, {
      error: "Execution workspace not found",
    });

    expect(formatApiError(error, testT)).toBe("Execution workspace not found.");
  });

  it("translates common backend auth and validation messages", () => {
    expect(formatApiError(new ApiError("Board authentication required", 403, null), testT)).toBe("Board authentication is required.");
    expect(formatApiError(new ApiError("Invalid document key", 400, null), testT)).toBe("The document key is invalid.");
  });

  it("localizes auth API errors with structured status", () => {
    const error = new AuthApiError("Request failed: 401", 401, null);

    expect(formatApiError(error, zhT)).toBe("需要先登录。");
  });

  it("localizes stable API error codes from top-level and details payloads", () => {
    expect(formatApiError(new ApiError("Plugin worker raw error", 502, {
      code: "WORKER_UNAVAILABLE",
      message: "Plugin worker raw error",
    }), zhT)).toBe("插件 worker 不可用。");

    expect(formatApiError(new ApiError("Secret is not bound to agent:abc at env.API_KEY", 422, {
      error: "Secret is not bound to agent:abc at env.API_KEY",
      details: { code: "binding_missing" },
    }), zhT)).toBe("此密钥未绑定到请求的运行时上下文。");
  });

  it("localizes common backend API error messages in Chinese", () => {
    const cases: Array<{ message: string; status: number }> = [
      { message: "Issue not found", status: 404 },
      { message: "Agent not found", status: 404 },
      { message: "Board authentication required", status: 403 },
      { message: "Invalid document key", status: 400 },
      { message: "Invalid project workspace payload", status: 400 },
      { message: "Missing file field 'file'", status: 400 },
      { message: "Plugin bridge is not enabled", status: 400 },
      { message: "Only board users can interrupt active runs from issue comments", status: 403 },
      { message: "Query parameter 'path' is required", status: 400 },
      { message: "Issue follow-up blocked by unresolved blockers", status: 409 },
      { message: "Execution workspace needs a local path before Paperclip can run workspace commands", status: 400 },
      { message: "Plugin API routes accept JSON requests only", status: 415 },
      { message: "Workspace command not found for this project workspace", status: 404 },
      { message: "Validation error", status: 400 },
      { message: "Board mutation requires trusted browser origin", status: 403 },
      { message: "devUiUrl must target localhost", status: 400 },
      { message: "packageName contains invalid characters", status: 400 },
      { message: "Plugin does not declare a UI bundle", status: 404 },
      { message: "Plugin manifest is missing", status: 400 },
      { message: "Plugin scoped API routes are not enabled", status: 404 },
      { message: "Unable to resolve company for plugin API route", status: 404 },
      { message: "Login is only supported for claude_local agents", status: 400 },
      { message: "Issue does not belong to company", status: 404 },
      { message: "reviewRequest requires an active review or approval stage", status: 400 },
      { message: "Unsupported watchdog decision", status: 400 },
      { message: "Use /api/agents/:id/permissions for permission changes", status: 400 },
      { message: "Instance admin required", status: 403 },
      { message: "Agent key cannot access another company", status: 403 },
      { message: "Project workspace must belong to the selected project", status: 422 },
      { message: "Environment is archived.", status: 422 },
      { message: "Cannot remove the last active owner", status: 409 },
      { message: "Invite already consumed", status: 409 },
      { message: "Join request must be approved before key claim", status: 409 },
      { message: "Claim secret already used", status: 409 },
      { message: "Invalid object key path", status: 400 },
      { message: "Pending approval agents cannot be resumed", status: 409 },
      { message: "Cannot assign work to terminated agents", status: 409 },
      { message: "Agent is not invokable in its current state", status: 409 },
      { message: "Issue monitor check is already in progress", status: 409 },
      { message: "Agent instructions bundle is not configured", status: 404 },
      { message: "Local folder symlink escape is not allowed", status: 403 },
      { message: "AWS Secrets Manager provider vault runtime is locked while coming soon", status: 422 },
      { message: "local_encrypted does not support external reference secrets", status: 400 },
      { message: "Blocking relations cannot contain cycles", status: 422 },
      { message: "Issue can only have one assignee", status: 422 },
      { message: "Issue checkout conflict", status: 409 },
      { message: "Agent shortname is ambiguous in this company. Use the agent ID.", status: 409 },
      { message: "Only the assignee agent or a board user can manage issue monitors", status: 403 },
      { message: "Cloud sync is not enabled", status: 404 },
      { message: "entityType must be agents, routines, or monitors", status: 400 },
      { message: "Agents can only manage routines assigned to themselves", status: 403 },
      { message: "New budget must exceed current observed spend", status: 422 },
      { message: "Environment driver \"ssh\" is not allowed here. Allowed drivers: local", status: 422 },
    ];

    for (const { message, status } of cases) {
      const translated = formatApiError(new ApiError(message, status, { error: message }), zhT);
      expect(translated, message).not.toBe(message);
      expect(translated, message).toMatch(/\p{Script=Han}/u);
    }
  });
});
