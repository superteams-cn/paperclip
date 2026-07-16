import type { ToolProfileStatus, ToolProfileSummary, ToolProfileWithDetails } from "@paperclipai/shared";
import { t } from "@/i18n";

/**
 * Prosumer copy for the access-profile index (PAP-10997, AP1). Reads the
 * server-computed `summary` and renders the friendly "Allows" / "Assigned to"
 * lines the table shows. Vocabulary gate: nothing here says
 * binding/entry/selector/priority — only "tools", "apps", "agents".
 */

/** "9 tools · 3 apps" / "All tools" / "All except 2 tools". */
export function allowsLabel(summary: ToolProfileSummary): string {
  if (summary.accessMode === "all_except") {
    return summary.excludedToolCount === 0
      ? t("tools.profiles.summary.allTools")
      : t("tools.profiles.summary.allExceptTools", { count: summary.excludedToolCount });
  }
  const parts = [t("tools.profiles.summary.toolCount", { count: summary.allowedToolCount })];
  if (summary.allowedApplicationCount > 0) {
    parts.push(t("tools.profiles.summary.appCount", { count: summary.allowedApplicationCount }));
  }
  return parts.join(" · ");
}

export interface AssignedLabel {
  text: string;
  /** A profile with no assignment has no effect — the index shows a quiet hint. */
  unassigned: boolean;
}

/** "Company default" / "2 agents" / "Not assigned yet". */
export function assignedLabel(summary: ToolProfileSummary): AssignedLabel {
  if (summary.isCompanyDefault) return { text: t("tools.profiles.summary.companyDefault"), unassigned: false };
  if (summary.appliesToAgentCount > 0) {
    return { text: t("tools.profiles.summary.agentCount", { count: summary.appliesToAgentCount }), unassigned: false };
  }
  if (summary.assignmentCount > 0) {
    return { text: t("tools.profiles.summary.assignmentCount", { count: summary.assignmentCount }), unassigned: false };
  }
  return { text: t("tools.profiles.summary.notAssigned"), unassigned: true };
}

export const STATUS_LABEL: Record<ToolProfileStatus, string> = {
  get draft() { return t("tools.profiles.status.draft"); },
  get active() { return t("tools.profiles.status.active"); },
  get disabled() { return t("tools.profiles.status.disabled"); },
  get archived() { return t("tools.profiles.status.archived"); },
};

export function isDraft(profile: Pick<ToolProfileWithDetails, "status">): boolean {
  return profile.status === "draft";
}
