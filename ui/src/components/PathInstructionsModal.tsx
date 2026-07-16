import { useState } from "react";
import { Apple, Monitor, Terminal } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Platform = "mac" | "windows" | "linux";

const platforms: { id: Platform; icon: typeof Apple }[] = [
  { id: "mac", icon: Apple },
  { id: "windows", icon: Monitor },
  { id: "linux", icon: Terminal },
];

function getInstructions(t: TFunction): Record<Platform, { steps: string[]; tip?: string }> {
  return {
    mac: {
      steps: [
        t("components.pathInstructions.mac.step1"),
        t("components.pathInstructions.mac.step2"),
        t("components.pathInstructions.mac.step3"),
        t("components.pathInstructions.mac.step4"),
      ],
      tip: t("components.pathInstructions.mac.tip"),
    },
    windows: {
      steps: [
        t("components.pathInstructions.windows.step1"),
        t("components.pathInstructions.windows.step2"),
        t("components.pathInstructions.windows.step3"),
      ],
      tip: t("components.pathInstructions.windows.tip"),
    },
    linux: {
      steps: [
        t("components.pathInstructions.linux.step1"),
        t("components.pathInstructions.linux.step2"),
        t("components.pathInstructions.linux.step3"),
      ],
      tip: t("components.pathInstructions.linux.tip"),
    },
  };
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "linux";
}

interface PathInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PathInstructionsModal({
  open,
  onOpenChange,
}: PathInstructionsModalProps) {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform>(detectPlatform);

  const current = getInstructions(t)[platform];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{t("components.pathInstructions.title")}</DialogTitle>
          <DialogDescription>
            {t("components.pathInstructions.descriptionBefore")}{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/Users/you/project</code>
            {t("components.pathInstructions.descriptionAfter")}
          </DialogDescription>
        </DialogHeader>

        {/* Platform tabs */}
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
                platform === p.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
              onClick={() => setPlatform(p.id)}
            >
              <p.icon className="h-3.5 w-3.5" />
              {t(`components.pathInstructions.platforms.${p.id}`, { defaultValue: p.id })}
            </button>
          ))}
        </div>

        {/* Steps */}
        <ol className="space-y-2 text-sm">
          {current.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0">
                {i + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {current.tip && (
          <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">
            {current.tip}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Small "Choose" button that opens the PathInstructionsModal.
 * Drop-in replacement for the old showDirectoryPicker buttons.
 */
export function ChoosePathButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent/50 transition-colors shrink-0",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        {t("components.pathInstructions.choose", { defaultValue: "Choose" })}
      </button>
      <PathInstructionsModal open={open} onOpenChange={setOpen} />
    </>
  );
}
