import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { i18n } from "@/i18n";
import {
  formatCloudUpstreamConflictEntityType,
  formatCloudUpstreamConflictPlannedAction,
  formatCloudUpstreamWarningDetail,
  formatCloudUpstreamWarningTitle,
  formatAgentSkillSnapshotWarning,
  formatCompanyPortabilityError,
  formatCompanyPortabilityWarning,
  formatCompanySkillProjectScanConflict,
  formatCompanySkillProjectScanWarning,
  formatCompanySkillUpdateReason,
  formatCloudUpstreamRunEventMessage,
  formatExecutionWorkspaceCloseActionDescription,
  formatExecutionWorkspaceCloseActionLabel,
  formatExecutionWorkspaceCloseFeedback,
  formatIssueGraphLivenessReason,
  formatIssueTreePreviewWarning,
  formatIssueRetryNowMessage,
  formatPluginConfigTestMessage,
  formatPluginHealthCheckName,
  formatPluginLocalFolderProblem,
  formatSecretProviderConfigHealthMessage,
  formatSecretProviderConfigHealthResponseMessage,
  formatSecretProviderDiscoveryWarning,
  formatSecretProviderHealthGuidance,
  formatRemoteSecretImportConflict,
  formatSecretProviderHealthMessage,
  formatWakeupSkippedMessage,
} from "./api-feedback-format";

const zhT = i18n.getFixedT("zh-CN") as unknown as TFunction;

describe("API feedback formatting", () => {
  it("localizes plugin diagnostics returned by API", () => {
    expect(formatPluginHealthCheckName("error_state", zhT)).toBe("错误状态");
    expect(formatPluginLocalFolderProblem({
      code: "missing_file",
      message: "Required file is missing.",
      path: "AGENTS.md",
    }, zhT)).toBe("缺少必需文件。");
  });

  it("localizes issue tree preview warnings returned by API", () => {
    expect(formatIssueTreePreviewWarning({
      code: "running_runs_present",
      message: "Some affected issues have running heartbeat runs.",
    }, zhT)).toBe("部分受影响任务存在正在运行的心跳运行。");
  });

  it("localizes cloud upstream warnings returned by API", () => {
    const warning = {
      code: "secret_values_redacted",
      severity: "warning" as const,
      title: "Secret values are not transferred",
      detail: "The push carries secret requirements only.",
    };

    expect(formatCloudUpstreamWarningTitle(warning, zhT)).toBe("不会转移密钥值");
    expect(formatCloudUpstreamWarningDetail(warning, zhT)).toBe("推送只携带密钥需求。请先配置云端密钥，再激活自动化。");
  });

  it("localizes cloud upstream run events returned by API", () => {
    expect(formatCloudUpstreamRunEventMessage({
      id: "event-1",
      at: "2026-05-26T00:00:00.000Z",
      phase: "push",
      type: "completed",
      message: "Uploaded 2 manifest chunks.",
    }, zhT)).toBe("已上传 2 个 manifest 分片。");

    expect(formatCloudUpstreamRunEventMessage({
      id: "event-2",
      at: "2026-05-26T00:00:00.000Z",
      phase: "connect",
      type: "completed",
      message: "Connected to the target Paperclip Cloud stack.",
    }, zhT)).toBe("已连接到目标 Paperclip Cloud 堆栈。");
  });

  it("localizes cloud upstream conflict labels returned by API", () => {
    const conflict = {
      id: "conflict-1",
      entityType: "agent",
      sourceLabel: "CEO",
      targetLabel: "CEO",
      plannedAction: "update" as const,
      reason: "Remote importer reported a conflict.",
    };

    expect(formatCloudUpstreamConflictEntityType(conflict, zhT)).toBe("智能体");
    expect(formatCloudUpstreamConflictPlannedAction(conflict, zhT)).toBe("更新");
  });

  it("localizes secret provider health messages returned by API", () => {
    expect(formatSecretProviderHealthMessage({
      provider: "aws_secrets_manager",
      status: "error",
      message: "Provider vault runtime is locked while coming soon.",
      details: { code: "runtime_locked" },
    }, zhT)).toBe("提供方密钥库运行时在即将推出期间已锁定。");

    expect(formatSecretProviderConfigHealthMessage({
      id: "config-1",
      companyId: "company-1",
      provider: "aws_secrets_manager",
      displayName: "AWS",
      status: "coming_soon",
      isDefault: false,
      config: {},
      healthStatus: "coming_soon",
      healthCheckedAt: null,
      healthMessage: "Provider vault runtime is locked while coming soon.",
      healthDetails: {
        code: "runtime_locked",
        message: "Provider vault runtime is locked while coming soon.",
      },
      disabledAt: null,
      createdByAgentId: null,
      createdByUserId: null,
      createdAt: new Date("2026-05-26T00:00:00.000Z"),
      updatedAt: new Date("2026-05-26T00:00:00.000Z"),
    }, zhT)).toBe("提供方密钥库运行时在即将推出期间已锁定。");

    expect(formatSecretProviderHealthGuidance(
      "Draft metadata may be saved, but create, rotate, and resolve stay unavailable.",
      zhT,
    )).toBe("可以保存草稿元数据，但创建、轮换和解析仍不可用。");

    expect(formatSecretProviderConfigHealthResponseMessage({
      configId: "config-1",
      provider: "aws_secrets_manager",
      status: "coming_soon",
      message: "Provider vault runtime is locked while coming soon.",
      details: {
        code: "runtime_locked",
        message: "Provider vault runtime is locked while coming soon.",
      },
      checkedAt: new Date("2026-05-26T00:00:00.000Z"),
    }, zhT)).toBe("提供方密钥库运行时在即将推出期间已锁定。");

    expect(formatSecretProviderDiscoveryWarning(
      "No common owner/team tag was found in the sampled AWS secrets.",
      zhT,
    )).toBe("采样的 AWS 密钥中没有发现共同的负责人/团队标签。");
  });

  it("localizes remote secret import conflicts returned by API", () => {
    expect(formatRemoteSecretImportConflict({
      type: "name",
      message: "Secret name already exists: Stripe API key",
    }, zhT)).toBe("密钥名称已存在: Stripe API key。");

    expect(formatRemoteSecretImportConflict({
      type: "provider_guardrail",
      message: "Provider rejected this external reference",
    }, zhT)).toBe("提供方拒绝了此外部引用。");
  });

  it("localizes scheduled retry action messages returned by API", () => {
    expect(formatIssueRetryNowMessage({
      outcome: "promoted",
      message: "Scheduled retry was promoted to the queued run pool",
      scheduledRetry: null,
    }, zhT)).toBe("计划重试已提前到排队运行池。");

    expect(formatIssueRetryNowMessage({
      outcome: "gate_suppressed",
      message: "Scheduled retry suppressed because issue dependencies are still blocked",
      scheduledRetry: null,
    }, zhT)).toBe("计划重试已被拦截，因为任务依赖仍被阻塞。");

    expect(formatIssueRetryNowMessage({
      outcome: "gate_suppressed",
      message: "Scheduled retry suppressed because issue reached terminal status (done)",
      scheduledRetry: null,
    }, zhT)).toBe("计划重试已被拦截，因为任务已到达终态（done）。");
  });

  it("localizes company skill API feedback", () => {
    expect(formatAgentSkillSnapshotWarning(
      "This adapter does not implement skill sync yet.",
      zhT,
    )).toBe("此适配器暂未实现技能同步。");

    expect(formatCompanySkillUpdateReason({
      supported: false,
      reason: "Only GitHub-managed skills support update checks.",
      trackingRef: null,
      currentRef: null,
      latestRef: null,
      hasUpdate: false,
      installedHash: null,
      originHash: null,
      userModifiedAt: null,
      updateHoldReason: null,
      auditVerdict: null,
      auditCodes: [],
    }, zhT)).toBe("只有 GitHub 托管的技能支持检查更新。");

    expect(formatCompanySkillProjectScanConflict({
      slug: "lint",
      key: "company:lint",
      projectId: "project-1",
      projectName: "App",
      workspaceId: "workspace-1",
      workspaceName: "Main",
      path: "/repo/.agents/skills/lint",
      existingSkillId: "skill-1",
      existingSkillKey: "company:lint",
      existingSourceLocator: "/other",
      reason: "Skill key company:lint already points at /other.",
    }, zhT)).toBe("技能 key company:lint 已指向 /other。");

    expect(formatCompanySkillProjectScanWarning(
      "Skipped App / Main: no local workspace path is configured.",
      zhT,
    )).toBe("已跳过 App / Main：未配置本地工作区路径。");
  });

  it("localizes company portability warnings returned by API", () => {
    expect(formatCompanyPortabilityWarning(
      "Agent CEO PATH override was omitted from export because it is system-dependent.",
      zhT,
    )).toBe("Agent CEO 的 PATH 覆盖因依赖系统环境，已从导出中省略。");

    expect(formatCompanyPortabilityWarning(
      "Task CMP-1 comment 2 was ignored because it has no body.",
      zhT,
    )).toBe("Task CMP-1 的评论 2 已被忽略，原因：没有正文。");

    expect(formatCompanyPortabilityWarning(
      "Project App workspace main metadata was omitted from export because it contains system-dependent paths.",
      zhT,
    )).toBe("项目 App 的工作区 main 字段 metadata 已从导出中省略，原因：包含依赖系统环境的路径。");

    expect(formatCompanyPortabilityWarning(
      "Existing agent \"CEO\" (ceo) will be overwritten by import.",
      zhT,
    )).toBe("现有智能体 \"CEO\"（ceo）会被导入内容覆盖。");
  });

  it("localizes company portability errors returned by API", () => {
    expect(formatCompanyPortabilityError(
      "Manifest does not include company metadata.",
      zhT,
    )).toBe("manifest 未包含公司元数据。");

    expect(formatCompanyPortabilityError(
      "Missing markdown file for agent ceo: agents/ceo/AGENTS.md",
      zhT,
    )).toBe("缺少智能体 ceo 的 markdown 文件：agents/ceo/AGENTS.md");

    expect(formatCompanyPortabilityError(
      "Recurring task CMP-1 uses legacy recurrence without frequency; add .paperclip.yaml routines.CMP-1.triggers.",
      zhT,
    )).toBe("例行任务 CMP-1 使用了缺少频率的旧版重复配置；请添加 .paperclip.yaml routines.CMP-1.triggers。");
  });

  it("localizes execution workspace close feedback returned by API", () => {
    expect(formatExecutionWorkspaceCloseFeedback(
      "This workspace is 2 commits ahead of main and is not merged.",
      zhT,
    )).toBe("此工作区领先 main 2 个提交，且尚未合并。");

    expect(formatExecutionWorkspaceCloseFeedback(
      "Closing this workspace will stop 1 attached runtime service.",
      zhT,
    )).toBe("关闭此工作区会停止 1 个关联的运行时服务。");

    const action = {
      kind: "git_worktree_remove" as const,
      label: "Remove git worktree",
      description: "Paperclip will run git worktree cleanup for /tmp/work.",
      command: "git worktree remove --force /tmp/work",
    };
    expect(formatExecutionWorkspaceCloseActionLabel(action, zhT)).toBe("移除 git worktree");
    expect(formatExecutionWorkspaceCloseActionDescription(action, zhT)).toBe("Paperclip 会为 /tmp/work 运行 git worktree 清理。");
  });

  it("localizes plugin config test and wakeup skipped feedback", () => {
    expect(formatPluginConfigTestMessage(
      "This plugin does not support configuration testing.",
      zhT,
    )).toBe("此插件不支持配置测试。");

    expect(formatWakeupSkippedMessage({
      status: "skipped",
      reason: "issue_execution_deferred",
      message: "Wakeup was deferred because this issue is already being executed by CTO.",
      issueId: "issue-1",
      executionRunId: "run-1",
      executionAgentId: "agent-1",
      executionAgentName: "CTO",
    }, zhT)).toBe("唤醒已延后，因为此任务正由 CTO 执行。");
  });

  it("localizes issue graph liveness preview reasons returned by API", () => {
    expect(formatIssueGraphLivenessReason({
      issueId: "issue-1",
      identifier: "CMP-1",
      title: "Source",
      state: "blocked_by_unassigned_issue",
      severity: "warning",
      reason: "CMP-1 is blocked by unassigned issue CMP-2 with no user owner.",
      recoveryIssueId: "issue-2",
      recoveryIdentifier: "CMP-2",
      recoveryTitle: "Blocker",
      recommendedOwnerAgentId: null,
      incidentKey: "incident-1",
      latestDependencyUpdatedAt: "2026-05-26T00:00:00.000Z",
      dependencyPath: [
        { issueId: "issue-1", identifier: "CMP-1", title: "Source", status: "blocked" },
        { issueId: "issue-2", identifier: "CMP-2", title: "Blocker", status: "blocked" },
      ],
    }, zhT)).toBe("CMP-1 被未分配的任务 CMP-2 阻塞，且没有用户负责人。");
  });
});
