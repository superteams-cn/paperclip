import type { PipelineCaseLiveness } from "@paperclipai/shared";
import type { TFunction } from "i18next";
import { t as translate } from "@/i18n";

/**
 * Visual tone for a pipeline item liveness banner. Each tone maps to a palette
 * in {@link ../components/PipelineLivenessBanner}:
 * - `blocked`    → amber, "automation paused, waiting on a named blocker"
 * - `permission` → purple, "a permission grant is missing before this can run"
 * - `retry`      → indigo, "blocker resolved, ready to retry"
 * - `attention`  → orange, "automation failed / no action path, needs a nudge"
 */
export type LivenessBannerTone = "blocked" | "permission" | "retry" | "attention";

export type LivenessRetryKind = "automation" | "stage" | null;

export interface LivenessBannerLink {
  /** Task link target. We only link tasks; cases lack a routable id here. */
  issueId: string;
  identifier?: string | null;
  title?: string | null;
}

export interface LivenessBannerView {
  reason: PipelineCaseLiveness["reason"];
  tone: LivenessBannerTone;
  title: string;
  body: string;
  /** Primary link to the underlying blocker task, when one is known. */
  blockerLink: LivenessBannerLink | null;
  /** Secondary link to the linked automation/work task, when one is known. */
  automationLink: LivenessBannerLink | null;
  /** Permission key the configured responsible is missing (e.g. `pipelines:write`). */
  permissionKey: string | null;
  /** Whether a retry call-to-action should render. */
  showRetry: boolean;
  /** Which mutation the retry CTA should invoke. */
  retryKind: LivenessRetryKind;
  retryLabel: string;
  /** Reassurance line that steers operators away from forcing a manual move. */
  helperNote: string | null;
}

/**
 * The `pipelines:write` permission key is the only permission the Phase 2
 * preflight blocks on today. The fingerprint encodes it as the final two
 * colon-separated segments (`...:pipelines:write`).
 */
function permissionKeyFromFingerprint(fingerprint: string | null | undefined): string | null {
  if (!fingerprint) return null;
  const parts = fingerprint.split(":");
  if (parts.length < 2) return null;
  const key = parts.slice(parts.length - 2).join(":");
  return key.includes(":") ? key : null;
}

function blockerLinkFromLiveness(liveness: PipelineCaseLiveness): LivenessBannerLink | null {
  const blocker = liveness.blocker;
  if (blocker?.issueId) {
    return { issueId: blocker.issueId, title: blocker.title ?? null };
  }
  return null;
}

function automationLinkFromLiveness(liveness: PipelineCaseLiveness): LivenessBannerLink | null {
  const issue = liveness.issue;
  if (issue?.id) {
    return { issueId: issue.id, identifier: issue.identifier, title: issue.title };
  }
  return null;
}

/**
 * Derive the banner view-model from the server's liveness payload. Returns
 * `null` for states that should not raise a banner (terminal, actively running,
 * or states already represented by another section such as review/children
 * waiting). This keeps the item detail header from over-crowding.
 */
export function derivePipelineLivenessBanner(
  liveness: PipelineCaseLiveness | null | undefined,
  t?: TFunction,
): LivenessBannerView | null {
  if (!liveness) return null;
  const tr = t ?? (translate as unknown as TFunction);
  const autoRetryNote = tr("components.pipelineLivenessBanner.view.autoRetryNote", {
    defaultValue: "Paperclip retries automatically once the blocker clears — you don't need to move the item by hand.",
  });

  switch (liveness.reason) {
    // Handled elsewhere or not "stuck" — no banner.
    case "terminal":
    case "lease_active":
    case "linked_issue_active":
    case "linked_issue_waiting":
    case "children_waiting":
    case "review_waiting":
      return null;

    case "case_blocked":
      return {
        reason: liveness.reason,
        tone: "blocked",
        title: tr("components.pipelineLivenessBanner.view.blockedTitle", { defaultValue: "Automation paused — waiting on a blocker" }),
        body: tr("components.pipelineLivenessBanner.view.blockedBody", { defaultValue: "This item is waiting for its blocker to clear." }),
        blockerLink: blockerLinkFromLiveness(liveness),
        automationLink: automationLinkFromLiveness(liveness),
        permissionKey: null,
        showRetry: false,
        retryKind: null,
        retryLabel: "",
        helperNote: autoRetryNote,
      };

    case "linked_issue_blocked":
      return {
        reason: liveness.reason,
        tone: "blocked",
        title: tr("components.pipelineLivenessBanner.view.blockedTitle", { defaultValue: "Automation paused — waiting on a blocker" }),
        body: tr("components.pipelineLivenessBanner.view.linkedBlockedBody", { defaultValue: "Linked work is blocked and must be resolved before automation can continue." }),
        blockerLink: blockerLinkFromLiveness(liveness),
        automationLink: automationLinkFromLiveness(liveness),
        permissionKey: null,
        showRetry: false,
        retryKind: null,
        retryLabel: "",
        helperNote: autoRetryNote,
      };

    case "permission_preflight_failed":
      return {
        reason: liveness.reason,
        tone: "permission",
        title: tr("components.pipelineLivenessBanner.view.permissionTitle", { defaultValue: "Permission needed before this can run" }),
        body: tr("components.pipelineLivenessBanner.view.permissionBody", { defaultValue: "The configured responsible does not have the permission required to run this automation." }),
        blockerLink: null,
        automationLink: automationLinkFromLiveness(liveness),
        permissionKey: permissionKeyFromFingerprint(liveness.automation?.fingerprint) ?? "pipelines:write",
        showRetry: false,
        retryKind: null,
        retryLabel: "",
        helperNote: tr("components.pipelineLivenessBanner.view.permissionHelper", {
          defaultValue: "Grant the access above to the configured responsible, then Paperclip retries automatically.",
        }),
      };

    case "automation_failed": {
      // Phase 2 reuses `automation_failed` both for a generic failure and for
      // the recovered "permission restored" case. The recovery path is the only
      // one whose message announces the restore, so key off that.
      const recovered = /permission has been restored/i.test(liveness.message);
      const automationId = liveness.automation?.automationId ?? null;
      return {
        reason: liveness.reason,
        tone: recovered ? "retry" : "attention",
        title: recovered
          ? tr("components.pipelineLivenessBanner.view.recoveredTitle", { defaultValue: "Blocker resolved — ready to retry" })
          : tr("components.pipelineLivenessBanner.view.failedTitle", { defaultValue: "Automation failed" }),
        body: recovered
          ? tr("components.pipelineLivenessBanner.view.recoveredBody", { defaultValue: "The permission blocker has cleared. You can retry now." })
          : tr("components.pipelineLivenessBanner.view.failedBody", { defaultValue: "The last automation attempt failed. Retry it to continue." }),
        blockerLink: null,
        automationLink: automationLinkFromLiveness(liveness),
        permissionKey: null,
        showRetry: true,
        retryKind: automationId ? "automation" : "stage",
        retryLabel: tr("components.pipelineLivenessBanner.view.retryNow", { defaultValue: "Retry now" }),
        helperNote: recovered ? autoRetryNote : null,
      };
    }

    case "breakdown_pending":
      return {
        reason: liveness.reason,
        tone: "attention",
        title: tr("components.pipelineLivenessBanner.view.breakdownPendingTitle", { defaultValue: "Waiting on breakdown evidence" }),
        body: tr("components.pipelineLivenessBanner.view.breakdownPendingBody", { defaultValue: "The stage has not produced enough breakdown evidence yet." }),
        blockerLink: null,
        automationLink: null,
        permissionKey: null,
        showRetry: true,
        retryKind: "stage",
        retryLabel: tr("components.pipelineLivenessBanner.view.rerunStage", { defaultValue: "Re-run stage automation" }),
        helperNote: null,
      };

    case "breakdown_incomplete":
      return {
        reason: liveness.reason,
        tone: "blocked",
        title: tr("components.pipelineLivenessBanner.view.breakdownIncompleteTitle", { defaultValue: "Breakdown is incomplete" }),
        body: missingPiecesBody(liveness, tr),
        blockerLink: null,
        automationLink: null,
        permissionKey: null,
        showRetry: true,
        retryKind: "stage",
        retryLabel: tr("components.pipelineLivenessBanner.view.rerunStage", { defaultValue: "Re-run stage automation" }),
        helperNote: null,
      };

    case "no_action_path":
      return {
        reason: liveness.reason,
        tone: "attention",
        title: tr("components.pipelineLivenessBanner.view.stuckTitle", { defaultValue: "This item is stuck" }),
        body: tr("components.pipelineLivenessBanner.view.stuckBody", {
          defaultValue: "Paperclip can't see anything to work on next here — no automation, retry, blocker, or review. Re-run the stage to nudge it, or use the ⋯ menu to move it by hand.",
        }),
        blockerLink: null,
        automationLink: null,
        permissionKey: null,
        showRetry: true,
        retryKind: "stage",
        retryLabel: tr("components.pipelineLivenessBanner.view.rerunStage", { defaultValue: "Re-run stage automation" }),
        helperNote: null,
      };

    default:
      return null;
  }
}

function missingPiecesBody(liveness: PipelineCaseLiveness, t: TFunction): string {
  const missing = liveness.breakdown?.missingRequestKeys?.length ?? 0;
  if (missing > 0) {
    return t("components.pipelineLivenessBanner.view.breakdownMissingPieces", {
      count: missing,
      defaultValue: "{{count}} expected pieces are still missing.",
    });
  }
  return t("components.pipelineLivenessBanner.view.breakdownIncompleteBody", {
    defaultValue: "The breakdown is missing required evidence.",
  });
}

/** True when the PAP-11238 "Re-run stage automation" menu item must be disabled. */
export function shouldDisableRerunForPermission(
  liveness: PipelineCaseLiveness | null | undefined,
): boolean {
  return liveness?.reason === "permission_preflight_failed";
}
