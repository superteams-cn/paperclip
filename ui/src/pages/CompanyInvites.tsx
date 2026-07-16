import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, MailPlus } from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { accessApi } from "@/api/access";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { useCompany } from "@/context/CompanyContext";
import { useToast } from "@/context/ToastContext";
import { Link } from "@/lib/router";
import { queryKeys } from "@/lib/queryKeys";
import { Badge } from "@/components/ui/badge";
import { formatApiError } from "@/lib/api-error";

const inviteRoleValues = ["viewer", "operator", "admin", "owner"] as const;
type InviteRole = (typeof inviteRoleValues)[number];

function inviteRoleOptions(t: TFunction) {
  return inviteRoleValues.map((value) => ({
    value,
    label: t(`pages.companyInvites.roles.${value}.label`),
    description: t(`pages.companyInvites.roles.${value}.description`),
    gets: t(`pages.companyInvites.roles.${value}.gets`),
  }));
}

const INVITE_HISTORY_PAGE_SIZE = 5;

function inviteStateLabel(state: "active" | "accepted" | "expired" | "revoked", t: TFunction) {
  return t(`pages.companyInvites.states.${state}`, { defaultValue: state.charAt(0).toUpperCase() + state.slice(1) });
}

function inviteAudienceLabel(
  invite: Awaited<ReturnType<typeof accessApi.listInvites>>["invites"][number],
  t: TFunction,
) {
  if (invite.allowedJoinTypes === "agent") return t("pages.companyInvites.audience.agent");
  if (invite.allowedJoinTypes === "both") {
    return invite.humanRole
      ? t("pages.companyInvites.audience.humanOrAgentWithRole", { role: invite.humanRole })
      : t("pages.companyInvites.audience.humanOrAgent");
  }
  return invite.humanRole ?? t("pages.companyInvites.audience.human");
}

function isInviteHistoryRow(value: unknown): value is Awaited<ReturnType<typeof accessApi.listInvites>>["invites"][number] {
  if (!value || typeof value !== "object") return false;
  return "id" in value && "state" in value && "createdAt" in value;
}

export function CompanyInvites() {
  const { t } = useTranslation();
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [humanRole, setHumanRole] = useState<InviteRole>("operator");
  const [latestInviteUrl, setLatestInviteUrl] = useState<string | null>(null);
  const [latestInviteCopied, setLatestInviteCopied] = useState(false);
  const latestInviteInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!latestInviteCopied) return;
    const timeout = window.setTimeout(() => {
      setLatestInviteCopied(false);
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [latestInviteCopied]);

  function selectLatestInviteUrl() {
    latestInviteInputRef.current?.focus();
    latestInviteInputRef.current?.select();
  }

  async function copyText(text: string, unavailableBody: string, afterFallback?: () => void) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to the unavailable message below.
    }

    const canUseLegacyCopy =
      typeof document !== "undefined" &&
      typeof document.execCommand === "function" &&
      (typeof document.queryCommandSupported !== "function" || document.queryCommandSupported("copy"));
    if (canUseLegacyCopy) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      try {
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        afterFallback?.();
        if (copied) return true;
      } catch {
        document.body.removeChild(textarea);
      }
    }

    afterFallback?.();
    pushToast({
      title: t("pages.companyInvites.clipboardUnavailable"),
      body: unavailableBody,
      tone: "warn",
    });
    return false;
  }

  async function copyInviteUrl(url: string) {
    return copyText(
      url,
      t("pages.companyInvites.copyManually", { defaultValue: "Copy the invite URL manually from the field below." }),
      selectLatestInviteUrl,
    );
  }

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? "Company", href: "/dashboard" },
      { label: t("nav.settings"), href: "/company/settings" },
      { label: t("nav.invites") },
    ]);
  }, [selectedCompany?.name, setBreadcrumbs, t]);

  const inviteHistoryQueryKey = queryKeys.access.invites(selectedCompanyId ?? "", "all", INVITE_HISTORY_PAGE_SIZE);
  const invitesQuery = useInfiniteQuery({
    queryKey: inviteHistoryQueryKey,
    queryFn: ({ pageParam }) =>
      accessApi.listInvites(selectedCompanyId!, {
        limit: INVITE_HISTORY_PAGE_SIZE,
        offset: pageParam,
      }),
    enabled: !!selectedCompanyId,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });
  const inviteHistory = useMemo(
    () =>
      invitesQuery.data?.pages.flatMap((page) =>
        Array.isArray(page?.invites) ? page.invites.filter(isInviteHistoryRow) : [],
      ) ?? [],
    [invitesQuery.data?.pages],
  );

  const createInviteMutation = useMutation({
    mutationFn: () =>
      accessApi.createCompanyInvite(selectedCompanyId!, {
        allowedJoinTypes: "human",
        humanRole,
        agentMessage: null,
      }),
    onSuccess: async (invite) => {
      setLatestInviteUrl(invite.inviteUrl);
      setLatestInviteCopied(false);
      const copied = await copyText(invite.inviteUrl, t("pages.companyInvites.copyManually"));

      await queryClient.invalidateQueries({ queryKey: inviteHistoryQueryKey });
      pushToast({
        title: t("pages.companyInvites.inviteCreated"),
        body: copied ? t("pages.companyInvites.inviteReadyCopied") : t("pages.companyInvites.inviteReady"),
        tone: "success",
      });
    },
    onError: (error) => {
      pushToast({
        title: t("pages.companyInvites.createFailed"),
        body: formatApiError(error, t, t("common.unknownError")),
        tone: "error",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => accessApi.revokeInvite(inviteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inviteHistoryQueryKey });
      pushToast({ title: t("pages.companyInvites.inviteRevoked"), tone: "success" });
    },
    onError: (error) => {
      pushToast({
        title: t("pages.companyInvites.revokeFailed"),
        body: formatApiError(error, t, t("common.unknownError")),
        tone: "error",
      });
    },
  });

  if (!selectedCompanyId) {
    return <div className="text-sm text-muted-foreground">{t("pages.companyInvites.selectCompany")}</div>;
  }

  if (invitesQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">{t("pages.companyInvites.loading")}</div>;
  }

  if (invitesQuery.error) {
    const message =
      invitesQuery.error instanceof ApiError && invitesQuery.error.status === 403
        ? t("pages.companyInvites.noPermission")
        : formatApiError(invitesQuery.error, t, t("pages.companyInvites.loadFailed"));
    return <div className="text-sm text-destructive">{message}</div>;
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MailPlus className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">{t("pages.companyInvites.title")}</h1>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("pages.companyInvites.description")}
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-border p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">{t("pages.companyInvites.invitePerson")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("pages.companyInvites.invitePersonDescription")}
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">{t("pages.companyInvites.chooseRole")}</legend>
          <div className="rounded-xl border border-border">
            {inviteRoleOptions(t).map((option, index) => {
              const checked = humanRole === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 px-4 py-4 ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <input
                    type="radio"
                    name="invite-role"
                    value={option.value}
                    checked={checked}
                    onChange={() => setHumanRole(option.value)}
                    className="mt-1 h-4 w-4 border-border text-foreground"
                  />
                  <span className="min-w-0 space-y-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.value === "operator" ? (
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {t("pages.companyInvites.defaultRole")}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="block max-w-2xl text-sm text-muted-foreground">{option.description}</span>
                    <span className="block text-sm text-foreground">{option.gets}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
          {t("pages.companyInvites.singleUseHint", { defaultValue: "Each invite link is single-use. Human invitees get the selected role immediately after sign-in; agent invites still create a join request for approval." })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => createInviteMutation.mutate()} disabled={createInviteMutation.isPending}>
            {createInviteMutation.isPending ? t("pages.companyInvites.creating") : t("pages.companyInvites.createInvite")}
          </Button>
          <span className="text-sm text-muted-foreground">{t("pages.companyInvites.auditTrailHint")}</span>
        </div>

        {latestInviteUrl ? (
          <div className="space-y-3 rounded-lg border border-border px-4 py-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{t("pages.companyInvites.latestInviteLink")}</div>
                {latestInviteCopied ? (
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    <Check className="h-3.5 w-3.5" />
                    {t("common.copiedShort")}
                  </div>
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("pages.companyInvites.currentDomainHint")}
              </div>
            </div>
            <label className="block space-y-1">
              <span className="sr-only">{t("pages.companyInvites.latestInviteUrlLabel", { defaultValue: "Latest invite URL" })}</span>
              <input
                ref={latestInviteInputRef}
                readOnly
                value={latestInviteUrl}
                onFocus={(event) => event.currentTarget.select()}
                onClick={(event) => event.currentTarget.select()}
                className="w-full rounded-md border border-border bg-muted/60 px-3 py-2 text-sm text-foreground outline-none transition-colors selection:bg-primary selection:text-primary-foreground focus:border-ring"
                aria-label={t("pages.companyInvites.latestInviteUrlLabel", { defaultValue: "Latest invite URL" })}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={async () => {
                  const copied = await copyInviteUrl(latestInviteUrl);
                  setLatestInviteCopied(copied);
                }}
              >
                <Copy className="h-4 w-4" />
                {t("pages.companyInvites.copyLink", { defaultValue: "Copy link" })}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={latestInviteUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t("pages.companyInvites.openInvite")}
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">{t("pages.companyInvites.inviteHistory")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("pages.companyInvites.historyDescription")}
            </p>
          </div>
          <Link to="/inbox/requests" className="text-sm underline underline-offset-4">
            {t("pages.companyInvites.openJoinQueue")}
          </Link>
        </div>

        {inviteHistory.length === 0 ? (
          <div className="border-t border-border px-5 py-8 text-sm text-muted-foreground">
            {t("pages.companyInvites.noInvites")}
          </div>
        ) : (
          <div className="border-t border-border">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 font-medium text-muted-foreground">{t("pages.companyInvites.table.state")}</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">{t("pages.companyInvites.table.for")}</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">{t("pages.companyInvites.table.invitedBy")}</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">{t("pages.companyInvites.table.created")}</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">{t("pages.companyInvites.table.joinRequest")}</th>
                    <th className="px-5 py-3 text-right font-medium text-muted-foreground">{t("pages.companyInvites.table.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteHistory.map((invite) => (
                    <tr key={invite.id} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-3 align-top">
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {inviteStateLabel(invite.state, t)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 align-top">{inviteAudienceLabel(invite, t)}</td>
                      <td className="px-5 py-3 align-top">
                        <div>{invite.invitedByUser?.name || invite.invitedByUser?.email || t("pages.companyInvites.unknownInviter")}</div>
                        {invite.invitedByUser?.email && invite.invitedByUser.name ? (
                          <div className="text-xs text-muted-foreground">{invite.invitedByUser.email}</div>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 align-top text-muted-foreground">
                        {new Date(invite.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 align-top">
                        {invite.relatedJoinRequestId ? (
                          <Link to="/inbox/requests" className="underline underline-offset-4">
                            {t("pages.companyInvites.reviewRequest")}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right align-top">
                        {invite.state === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => revokeMutation.mutate(invite.id)}
                            disabled={revokeMutation.isPending}
                          >
                            {t("pages.companyInvites.revoke")}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t("pages.companyInvites.inactive")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invitesQuery.hasNextPage ? (
              <div className="flex justify-center border-t border-border px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => invitesQuery.fetchNextPage()}
                  disabled={invitesQuery.isFetchingNextPage}
                >
                  {invitesQuery.isFetchingNextPage ? t("pages.companyInvites.loadingMore") : t("pages.companyInvites.viewMore")}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
