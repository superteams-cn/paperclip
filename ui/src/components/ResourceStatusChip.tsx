import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { brandChipBadge, type BrandChipColor } from "@/lib/status-colors";
import { t } from "@/i18n";

/**
 * The load-bearing visual grammar for the built-in bundle status panel
 * (Reflection Coach — [PAP-13099], ux-spec §4). Each variant double-encodes
 * state as glyph + word + color so it never relies on color alone
 * (WCAG 1.4.1). Colors route through the shared `brandChipBadge` families — no
 * bespoke tints are minted here (ux-spec §10).
 *
 * A single resource shows at most one readiness chip and at most one drift
 * chip; when both a readiness problem and a drift state coexist, the caller
 * suppresses the drift chip until readiness is `ready` (ux-spec §4).
 */
export type ResourceStatusVariant =
  | "ready"
  | "needs_setup"
  | "missing"
  | "error"
  | "update_available"
  | "drifted"
  | "schedule_off"
  | "schedule_on"
  | "pending_approval"
  | "proposal_pending";

interface VariantSpec {
  color: BrandChipColor;
  glyph: string;
  label: string;
  title: string;
}

const VARIANTS: Record<ResourceStatusVariant, VariantSpec> = {
  ready: {
    color: "green",
    glyph: "●",
    label: t("components.resourceStatusChip.ready.label", { defaultValue: "Ready" }),
    title: t("components.resourceStatusChip.ready.title", {
      defaultValue: "Materialized and matches the shipped default",
    }),
  },
  needs_setup: {
    color: "amber",
    glyph: "⚠",
    label: t("components.resourceStatusChip.needsSetup.label", { defaultValue: "Needs setup" }),
    title: t("components.resourceStatusChip.needsSetup.title", { defaultValue: "Present but not usable yet" }),
  },
  missing: {
    color: "amber",
    glyph: "⚠",
    label: t("components.resourceStatusChip.missing.label", { defaultValue: "Missing" }),
    title: t("components.resourceStatusChip.missing.title", {
      defaultValue: "Expected resource absent; reconcile will recreate it",
    }),
  },
  error: {
    color: "red",
    glyph: "✕",
    label: t("components.resourceStatusChip.error.label", { defaultValue: "Error" }),
    title: t("components.resourceStatusChip.error.title", { defaultValue: "Failed to load or reconcile" }),
  },
  update_available: {
    color: "blue",
    glyph: "↑",
    label: t("components.resourceStatusChip.updateAvailable.label", { defaultValue: "Update available" }),
    title: t("components.resourceStatusChip.updateAvailable.title", {
      defaultValue: "Unedited — a newer shipped default can be applied",
    }),
  },
  drifted: {
    color: "gray",
    glyph: "✎",
    label: t("components.resourceStatusChip.drifted.label", { defaultValue: "Drifted" }),
    title: t("components.resourceStatusChip.drifted.title", {
      defaultValue: "You've edited this; your changes are kept, not overwritten",
    }),
  },
  schedule_off: {
    color: "gray",
    glyph: "◌",
    label: t("components.resourceStatusChip.scheduleOff.label", { defaultValue: "Schedule off" }),
    title: t("components.resourceStatusChip.scheduleOff.title", {
      defaultValue: "No background work runs until you enable it — costs zero tokens",
    }),
  },
  schedule_on: {
    color: "green",
    glyph: "●",
    label: t("components.resourceStatusChip.scheduleOn.label", { defaultValue: "Weekly" }),
    title: t("components.resourceStatusChip.scheduleOn.title", { defaultValue: "Runs on the weekly schedule" }),
  },
  pending_approval: {
    color: "amber",
    glyph: "⚠",
    label: t("components.resourceStatusChip.pendingApproval.label", { defaultValue: "Pending approval" }),
    title: t("components.resourceStatusChip.pendingApproval.title", {
      defaultValue: "Waiting on board hire approval before it can run",
    }),
  },
  proposal_pending: {
    color: "blue",
    glyph: "↑",
    label: t("components.resourceStatusChip.proposalPending.label", { defaultValue: "Proposal pending" }),
    title: t("components.resourceStatusChip.proposalPending.title", {
      defaultValue: "A proposed update is waiting for your review",
    }),
  },
};

export function ResourceStatusChip({
  variant,
  label,
  compact = false,
  className,
}: {
  variant: ResourceStatusVariant;
  /** Override the default label (e.g. "Weekly · Mon 09:00 UTC"). */
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const spec = VARIANTS[variant];
  return (
    <Badge
      variant="outline"
      className={cn(
        brandChipBadge[spec.color],
        "font-medium",
        compact && "px-1.5 py-0 text-(length:--text-nano)",
        className,
      )}
      title={spec.title}
    >
      <span aria-hidden="true">{spec.glyph}</span>
      {label ?? spec.label}
    </Badge>
  );
}
