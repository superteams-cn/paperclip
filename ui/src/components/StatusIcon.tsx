import { useState } from "react";
import type { IssueBlockerAttention } from "@paperclipai/shared";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { StatusGlyph, type StatusGlyphSize } from "./StatusGlyph";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const allStatuses = ["backlog", "todo", "in_progress", "in_review", "done", "cancelled", "blocked"];

function defaultStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusIconProps {
  status: string;
  blockerAttention?: IssueBlockerAttention | null;
  onChange?: (status: string) => void;
  className?: string;
  showLabel?: boolean;
  /** Glyph size (PAP-243a). Default `md` (16px); lists/detail/mentions use `lg` (20px). */
  size?: StatusGlyphSize;
}

function statusLabel(status: string, t: TFunction): string {
  return t(`labels.status.${status}`, { defaultValue: defaultStatusLabel(status) });
}

function blockedAttentionLabel(blockerAttention: IssueBlockerAttention | null | undefined, t: TFunction) {
  if (!blockerAttention || blockerAttention.state === "none") {
    return t("components.statusIcon.blocked", { defaultValue: "Blocked" });
  }

  if (blockerAttention.reason === "active_child") {
    const count = blockerAttention.coveredBlockerCount;
    if (count === 1 && blockerAttention.sampleBlockerIdentifier) {
      return t("components.statusIcon.blockedWaitingOnActiveSubIssue", {
        defaultValue: "Blocked · waiting on active sub-task {{identifier}}",
        identifier: blockerAttention.sampleBlockerIdentifier,
      });
    }
    return t("components.statusIcon.blockedWaitingOnActiveSubIssues", {
      defaultValue_one: "Blocked · waiting on {{count}} active sub-task",
      defaultValue_other: "Blocked · waiting on {{count}} active sub-tasks",
      count,
    });
  }

  if (blockerAttention.reason === "active_dependency") {
    const count = blockerAttention.coveredBlockerCount;
    if (count === 1 && blockerAttention.sampleBlockerIdentifier) {
      return t("components.statusIcon.blockedCoveredByActiveDependency", {
        defaultValue: "Blocked · covered by active dependency {{identifier}}",
        identifier: blockerAttention.sampleBlockerIdentifier,
      });
    }
    return t("components.statusIcon.blockedCoveredByActiveDependencies", {
      defaultValue_one: "Blocked · covered by {{count}} active dependency",
      defaultValue_other: "Blocked · covered by {{count}} active dependencies",
      count,
    });
  }

  if (blockerAttention.reason === "stalled_review") {
    const count = blockerAttention.stalledBlockerCount;
    const leaf = blockerAttention.sampleStalledBlockerIdentifier ?? blockerAttention.sampleBlockerIdentifier;
    if (count === 1 && leaf) {
      return t("components.statusIcon.blockedReviewStalledOn", {
        defaultValue: "Blocked · review stalled on {{identifier}}",
        identifier: leaf,
      });
    }
    return t("components.statusIcon.blockedReviewsStalled", {
      defaultValue_one: "Blocked · review stalled with no clear next step",
      defaultValue_other: "Blocked · {{count}} reviews stalled with no clear next step",
      count,
    });
  }

  if (blockerAttention.reason === "attention_required") {
    const count = blockerAttention.attentionBlockerCount || blockerAttention.unresolvedBlockerCount;
    const attentionCopy = t("components.statusIcon.blockersNeedAttention", {
      defaultValue_one: "{{count}} blocker needs attention",
      defaultValue_other: "{{count}} blockers need attention",
      count,
    });
    const coveredCount = blockerAttention.coveredBlockerCount;
    if (coveredCount > 0) {
      return t("components.statusIcon.blockedNeedAttentionCovered", {
        defaultValue: "Blocked · {{attention}}; {{count}} covered by active work",
        attention: attentionCopy,
        count: coveredCount,
      });
    }
    return t("components.statusIcon.blockedNeedAttention", {
      defaultValue: "Blocked · {{attention}}",
      attention: attentionCopy,
    });
  }

  return t("components.statusIcon.blocked", { defaultValue: "Blocked" });
}

/**
 * Task/issue status indicator — renders the unified, color-blind-safe
 * {@link StatusGlyph} (one distinct shape per status). With `onChange` it also
 * acts as a status picker (popover). This one component drives every standalone
 * status surface: list, kanban, detail header, properties row + picker flyout,
 * sub-task / blocked-by pills, blocked inbox, quicklook, sibling nav, filters,
 * search, columns, dashboard.
 *
 * A "covered" blocked task (waiting on active work) maps to the `in_queue`
 * glyph — the blocked shape recoloured blue — while the full blocked reason
 * still rides on the accessible label.
 */
export function StatusIcon({ status, blockerAttention, onChange, className, showLabel, size = "md" }: StatusIconProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isCoveredBlocked = status === "blocked" && blockerAttention?.state === "covered";
  const ariaLabel = status === "blocked" ? blockedAttentionLabel(blockerAttention, t) : statusLabel(status, t);
  const glyphStatus = isCoveredBlocked ? "in_queue" : status;

  const glyph = (
    <StatusGlyph
      status={glyphStatus}
      size={size}
      className={cn(onChange && !showLabel && "cursor-pointer", className)}
      title={ariaLabel}
    />
  );

  if (!onChange) {
    return showLabel ? (
      <span className="inline-flex items-center gap-1.5">
        {glyph}
        <span className="text-sm">{statusLabel(status, t)}</span>
      </span>
    ) : (
      glyph
    );
  }

  const trigger = showLabel ? (
    <button className="inline-flex min-h-5 items-center gap-1.5 cursor-pointer hover:bg-accent/50 rounded px-1 -mx-1 py-0.5 transition-colors">
      {glyph}
      <span className="text-sm">{statusLabel(status, t)}</span>
    </button>
  ) : (
    glyph
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {allStatuses.map((s) => (
          <Button
            key={s}
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start gap-2 text-xs", s === status && "bg-accent")}
            onClick={() => {
              onChange(s);
              setOpen(false);
            }}
          >
            <StatusIcon status={s} size="lg" />
            {statusLabel(s, t)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
