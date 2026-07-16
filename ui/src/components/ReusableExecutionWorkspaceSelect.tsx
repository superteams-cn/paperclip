import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  buildReusableExecutionWorkspaceOptionGroups,
  reusableWorkspaceOptionMatches,
  scoreReusableWorkspaceOptionMatch,
  type ReusableExecutionWorkspaceLike,
  type ReusableWorkspaceOption,
} from "@/lib/reusable-execution-workspaces";
import { cn } from "@/lib/utils";

const COMPACT_TRIGGER_CLASS = "h-8 px-2 py-1.5 text-xs font-normal";

interface ReusableExecutionWorkspaceSelectProps<TWorkspace extends ReusableExecutionWorkspaceLike> {
  value: string;
  workspaces: readonly TWorkspace[];
  onValueChange: (workspaceId: string, option: ReusableWorkspaceOption<TWorkspace>) => void;
  placeholder?: string;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  disablePortal?: boolean;
}

export function ReusableExecutionWorkspaceSelect<TWorkspace extends ReusableExecutionWorkspaceLike>({
  value,
  workspaces,
  onValueChange,
  placeholder,
  loading = false,
  error = false,
  disabled = false,
  className,
  triggerClassName,
  disablePortal,
}: ReusableExecutionWorkspaceSelectProps<TWorkspace>) {
  const { t } = useTranslation();
  const groups = useMemo(
    () => buildReusableExecutionWorkspaceOptionGroups(workspaces).map((group) => ({
      ...group,
      label: group.id === "recent"
        ? t("components.reusableExecutionWorkspaceSelect.groups.recent", { defaultValue: "Recent" })
        : t("components.reusableExecutionWorkspaceSelect.groups.all", { defaultValue: "All workspaces" }),
    })),
    [t, workspaces],
  );
  const resolvedPlaceholder =
    placeholder ??
    t("components.reusableExecutionWorkspaceSelect.placeholder", {
      defaultValue: "Choose an existing workspace",
    });

  return (
    <SearchableSelect<string, ReusableWorkspaceOption<TWorkspace>>
      value={value}
      groups={groups}
      onValueChange={onValueChange}
      placeholder={resolvedPlaceholder}
      searchPlaceholder={t("components.reusableExecutionWorkspaceSelect.searchPlaceholder", {
        defaultValue: "Search workspaces...",
      })}
      emptyMessage={
        error
          ? t("components.reusableExecutionWorkspaceSelect.errorMessage", {
              defaultValue: "Workspaces failed to load.",
            })
          : t("components.reusableExecutionWorkspaceSelect.emptyMessage", {
              defaultValue: "No matching workspaces.",
            })
      }
      loadingMessage={t("components.reusableExecutionWorkspaceSelect.loadingMessage", {
        defaultValue: "Loading workspaces...",
      })}
      loading={loading}
      disabled={disabled}
      className={className}
      triggerClassName={cn(COMPACT_TRIGGER_CLASS, triggerClassName)}
      filterOption={reusableWorkspaceOptionMatches}
      scoreOption={scoreReusableWorkspaceOptionMatch}
      disablePortal={disablePortal}
      renderOption={(option, { selected }) => (
        <span className="flex min-w-0 flex-col">
          <span className={cn("truncate", selected && "font-medium")}>{option.label}</span>
          <span className="truncate text-(length:--text-micro) text-muted-foreground">
            {option.workspace.status
              ? `${t(`components.reusableExecutionWorkspaceSelect.statuses.${option.workspace.status}`, {
                  defaultValue: option.workspace.status.replace(/_/g, " "),
                })} - `
              : ""}
            {option.description}
          </span>
        </span>
      )}
    />
  );
}
