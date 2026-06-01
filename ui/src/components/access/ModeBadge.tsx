import type { DeploymentExposure, DeploymentMode } from "@paperclipai/shared";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export function ModeBadge({
  deploymentMode,
  deploymentExposure,
}: {
  deploymentMode?: DeploymentMode;
  deploymentExposure?: DeploymentExposure;
}) {
  const { t } = useTranslation();
  if (!deploymentMode) return null;

  const label =
    deploymentMode === "local_trusted"
      ? t("components.modeBadge.localTrusted", { defaultValue: "Local trusted" })
      : t("components.modeBadge.authenticated", {
        defaultValue: "Authenticated {{exposure}}",
        exposure: deploymentExposure ?? "private",
      });

  return <Badge variant="outline">{label}</Badge>;
}
