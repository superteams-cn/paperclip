import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppWindow, ShieldAlert, ShieldQuestion } from "lucide-react";
import type {
  AppGalleryEntry,
  ToolApplication,
  ToolConnection,
  ToolProfileWithDetails,
} from "@paperclipai/shared";
import {
  humanizeConnectionDisplayName,
  isToolConnectionAttentionHealth as isAttentionHealthStatus,
} from "@paperclipai/shared";
import { useNavigate } from "@/lib/router";
import { useCompany } from "@/context/CompanyContext";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { queryKeys } from "@/lib/queryKeys";
import { toolsApi } from "@/api/tools";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";
import { AppLogo } from "./AppLogo";
import { useReviewCount } from "./useReviewCount";
import { AdvancedToolsLink } from "./store-cards";
import { useTranslation } from "@/i18n";
import type { TFunction } from "i18next";

const BROWSE_HREF = "/apps/browse";

type StatusFilter = "all" | "attention";

type AppStatus = {
  label: string;
  tone: "connected" | "attention" | "paused" | "not_connected";
};

type AppRow = {
  application: ToolApplication;
  primaryConnection: ToolConnection | null;
  status: AppStatus;
  actionCount: number;
  lastUsedAt: Date | string | null;
  logoUrl?: string | null;
};

/**
 * F6 (PAP-13254 / U3 §4): a single health signal is the source of truth for
 * BOTH the row highlight and the Status pill so they can never disagree. The
 * pill's `attention` tone and the row highlight are now the *same* predicate.
 */
function statusFor(application: ToolApplication, connections: ToolConnection[], t: TFunction): AppStatus {
  if (connections.length === 0) {
    return { label: t("apps.connections.status.notConnected"), tone: "not_connected" };
  }
  if (
    application.status === "disabled" ||
    application.status === "archived" ||
    connections.every((connection) => connection.enabled === false || connection.status === "disabled")
  ) {
    return { label: t("apps.connections.status.paused"), tone: "paused" };
  }
  if (connections.some((connection) => isAttentionHealthStatus(connection.healthStatus))) {
    return { label: t("apps.connections.status.needsAttention"), tone: "attention" };
  }
  return { label: t("apps.connections.status.healthy"), tone: "connected" };
}

/** The single health-derived predicate that drives highlight, pill, banner, filter (F6). */
function rowNeedsAttention(row: AppRow): boolean {
  return row.status.tone === "attention";
}

const STATUS_CLASS: Record<AppStatus["tone"], string> = {
  connected: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  attention: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  paused: "border-border bg-muted text-muted-foreground",
  not_connected: "border-border bg-background text-muted-foreground",
};

export function Connections() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const reviewCount = useReviewCount();
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? t("apps.companyFallback"), href: "/dashboard" },
      { label: t("apps.title"), href: "/apps" },
      { label: t("apps.nav.connections") },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs, selectedCompany?.name, t]);

  const galleryQuery = useQuery({
    queryKey: queryKeys.apps.gallery(selectedCompanyId ?? "__none__"),
    queryFn: () => toolsApi.listGallery(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const applicationsQuery = useQuery({
    queryKey: queryKeys.tools.applications(selectedCompanyId ?? "__none__"),
    queryFn: () => toolsApi.listApplications(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const connectionsQuery = useQuery({
    queryKey: queryKeys.tools.connections(selectedCompanyId ?? "__none__"),
    queryFn: () => toolsApi.listConnections(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const profilesQuery = useQuery({
    queryKey: queryKeys.tools.profiles(selectedCompanyId ?? "__none__"),
    queryFn: () => toolsApi.listProfiles(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const gallery = galleryQuery.data?.apps ?? [];
  const logoByName = useMemo(() => {
    const map = new Map<string, AppGalleryEntry>();
    for (const entry of gallery) map.set(entry.name.toLowerCase(), entry);
    return map;
  }, [gallery]);
  const logoByKey = useMemo(() => {
    const map = new Map<string, AppGalleryEntry>();
    for (const entry of gallery) map.set(entry.key, entry);
    return map;
  }, [gallery]);

  // "Actions on" = enabled tools in each app's per-connection access profile,
  // mirroring what App detail shows so the count never disagrees with the page.
  const actionCountByConnection = useMemo(() => {
    const map = new Map<string, number>();
    for (const profile of profilesQuery.data?.profiles ?? []) {
      map.set(profile.profileKey, enabledActionCount(profile));
    }
    return map;
  }, [profilesQuery.data]);

  const connections = (connectionsQuery.data?.connections ?? []).filter(
    (c) => c.status !== "archived",
  );
  const applications = (applicationsQuery.data?.applications ?? []).filter(
    (application) => application.status !== "archived",
  );
  const connectionsByApplication = useMemo(() => {
    const map = new Map<string, ToolConnection[]>();
    for (const connection of connections) {
      map.set(connection.applicationId, [...(map.get(connection.applicationId) ?? []), connection]);
    }
    return map;
  }, [connections]);

  const rows = useMemo<AppRow[]>(() => {
    return applications.map((application) => {
      const appConnections = connectionsByApplication.get(application.id) ?? [];
      const primaryConnection = appConnections[0] ?? null;
      const actionCount = appConnections.reduce(
        (sum, connection) => sum + (actionCountByConnection.get(`app:${connection.id}`) ?? 0),
        0,
      );
      const lastUsedAt = appConnections.reduce<Date | string | null>((latest, connection) => {
        if (!connection.lastUsedAt) return latest;
        if (!latest) return connection.lastUsedAt;
        return new Date(connection.lastUsedAt).getTime() > new Date(latest).getTime()
          ? connection.lastUsedAt
          : latest;
      }, null);
      const galleryEntry = application.applicationKey
        ? logoByKey.get(application.applicationKey)
        : undefined;
      return {
        application,
        primaryConnection,
        status: statusFor(application, appConnections, t),
        actionCount,
        lastUsedAt,
        logoUrl: galleryEntry?.logoUrl ?? logoByName.get(application.name.toLowerCase())?.logoUrl,
      };
    });
  }, [actionCountByConnection, applications, connectionsByApplication, logoByKey, logoByName, t]);

  const rowsNeedingAttention = rows.filter(rowNeedsAttention);
  const visibleRows = filter === "attention" ? rowsNeedingAttention : rows;

  if (!selectedCompanyId) {
    return <div className="p-6 text-sm text-muted-foreground">{t("apps.connections.selectCompany")}</div>;
  }

  const loading = applicationsQuery.isLoading || connectionsQuery.isLoading || galleryQuery.isLoading;

  return (
    <div className="max-w-5xl">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyConnections onBrowse={() => navigate(BROWSE_HREF)} />
      ) : (
        <div className="space-y-5">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("apps.nav.connections")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("apps.connections.description")}
              </p>
            </div>
            <Button onClick={() => navigate(BROWSE_HREF)}>{t("apps.connections.connectApp")}</Button>
          </header>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              {t("apps.connections.allCount", { count: rows.length })}
            </FilterChip>
            <FilterChip
              active={filter === "attention"}
              tone="danger"
              disabled={rowsNeedingAttention.length === 0}
              onClick={() => setFilter("attention")}
            >
              {t("apps.connections.attentionCount", { count: rowsNeedingAttention.length })}
            </FilterChip>
          </div>

          {reviewCount > 0 && (
            <button
              type="button"
              onClick={() => navigate("/apps/review")}
              className="flex w-full items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-left transition-colors hover:bg-amber-500/15"
            >
              <ShieldQuestion className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {t("apps.connections.reviewWaiting", { count: reviewCount })}
                </div>
                <div className="truncate text-xs text-amber-700 dark:text-amber-300">
                  {t("apps.connections.reviewWaitingDescription")}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-amber-800 dark:text-amber-200">{t("apps.connections.reviewAction")}</span>
            </button>
          )}

          {rowsNeedingAttention.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter("attention")}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-left transition-colors hover:bg-red-500/15"
            >
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-red-900 dark:text-red-100">
                  {t("apps.connections.appsNeedAttention", { count: rowsNeedingAttention.length })}
                </div>
                <div className="truncate text-xs text-red-700 dark:text-red-300">
                  {floatSummary(rowsNeedingAttention, t)}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-red-800 dark:text-red-200">{t("apps.connections.fixAction")}</span>
            </button>
          )}

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-(length:--text-micro) font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5">{t("apps.connections.table.app")}</th>
                  <th className="px-4 py-2.5">{t("apps.connections.table.status")}</th>
                  <th className="px-4 py-2.5">{t("apps.connections.table.actions")}</th>
                  <th className="px-4 py-2.5">{t("apps.connections.table.lastUsed")}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const { application, primaryConnection, status } = row;
                  const attention = rowNeedsAttention(row);
                  const hint =
                    status.tone === "attention"
                      ? t("apps.connections.hints.reconnect")
                      : status.tone === "paused"
                        ? t("apps.connections.hints.paused")
                        : status.tone === "not_connected"
                          ? t("apps.connections.hints.connect")
                        : null;
                  const appHref = primaryConnection
                    ? `/apps/${primaryConnection.id}`
                    : `/apps/app/${application.id}`;
                  const actionLabel = !primaryConnection
                    ? t("apps.actions.connect")
                    : status.tone === "attention"
                      ? t("apps.actions.reconnect")
                      : t("apps.actions.open");
                  return (
                    <tr
                      key={application.id}
                      onClick={() => navigate(appHref)}
                      className={cn(
                        "cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30",
                        attention && "bg-amber-500/[0.06]",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AppLogo
                            name={application.name}
                            logoUrl={row.logoUrl}
                            size={32}
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">
                              {application.name}
                            </div>
                            {hint && (
                              <div className="truncate text-xs text-muted-foreground">{hint}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            STATUS_CLASS[status.tone],
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {t("apps.connections.actionsOn", { count: row.actionCount })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {row.lastUsedAt ? timeAgo(row.lastUsedAt) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={attention ? "default" : "outline"}
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(appHref);
                          }}
                        >
                          {actionLabel}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {t("apps.connections.accessNote")}
            </p>
            <AdvancedToolsLink />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  tone = "default",
  disabled = false,
  onClick,
  children,
}: {
  active: boolean;
  tone?: "default" | "danger";
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        active
          ? tone === "danger"
            ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
            : "border-foreground/30 bg-foreground/[0.06] text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function enabledActionCount(profile: ToolProfileWithDetails): number {
  let count = 0;
  for (const entry of profile.entries ?? []) {
    if (entry.effect === "include" && entry.catalogEntryId) count += 1;
  }
  return count;
}

function floatSummary(rows: AppRow[], t: TFunction): string {
  const names = rows.map((row) => humanizeConnectionDisplayName(row.application.name));
  if (names.length <= 2) return names.join(t("apps.connections.listAnd"));
  return t("apps.connections.moreAppsSummary", {
    names: names.slice(0, 2).join(", "),
    count: names.length - 2,
  });
}

function EmptyConnections({ onBrowse }: { onBrowse: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("apps.nav.connections")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("apps.connections.description")}
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AppWindow className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">{t("apps.connections.emptyTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("apps.connections.emptyDescription")}
        </p>
        <Button className="mt-6" onClick={onBrowse}>
          {t("apps.connections.browseApps")}
        </Button>
      </div>
    </div>
  );
}
