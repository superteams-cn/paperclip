import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UserPlus2 } from "lucide-react";
import { accessApi } from "@/api/access";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { useCompany } from "@/context/CompanyContext";
import { useToast } from "@/context/ToastContext";
import { queryKeys } from "@/lib/queryKeys";
import { formatApiError } from "@/lib/api-error";

export function JoinRequestQueue() {
  const { t } = useTranslation();
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"pending_approval" | "approved" | "rejected">("pending_approval");
  const [requestType, setRequestType] = useState<"all" | "human" | "agent">("all");

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? t("common.company", { defaultValue: "Company" }), href: "/dashboard" },
      { label: t("nav.inbox", { defaultValue: "Inbox" }), href: "/inbox" },
      { label: t("pages.joinRequests.title", { defaultValue: "Join Requests" }) },
    ]);
  }, [selectedCompany?.name, setBreadcrumbs, t]);

  const requestsQuery = useQuery({
    queryKey: queryKeys.access.joinRequests(selectedCompanyId ?? "", `${status}:${requestType}`),
    queryFn: () =>
      accessApi.listJoinRequests(
        selectedCompanyId!,
        status,
        requestType === "all" ? undefined : requestType,
      ),
    enabled: !!selectedCompanyId,
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => accessApi.approveJoinRequest(selectedCompanyId!, requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.access.joinRequests(selectedCompanyId!, `${status}:${requestType}`) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.access.companyMembers(selectedCompanyId!) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.access.companyUserDirectory(selectedCompanyId!) });
      pushToast({ title: t("pages.joinRequests.toasts.approved", { defaultValue: "Join request approved" }), tone: "success" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => accessApi.rejectJoinRequest(selectedCompanyId!, requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.access.joinRequests(selectedCompanyId!, `${status}:${requestType}`) });
      pushToast({ title: t("pages.joinRequests.toasts.rejected", { defaultValue: "Join request rejected" }), tone: "success" });
    },
  });

  if (!selectedCompanyId) {
    return <div className="text-sm text-muted-foreground">{t("pages.joinRequests.selectCompany", { defaultValue: "Select a company to review join requests." })}</div>;
  }

  if (requestsQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">{t("pages.joinRequests.loading", { defaultValue: "Loading join requests…" })}</div>;
  }

  if (requestsQuery.error) {
    const message =
      requestsQuery.error instanceof ApiError && requestsQuery.error.status === 403
        ? t("pages.joinRequests.permissionDenied", { defaultValue: "You do not have permission to review join requests for this company." })
        : formatApiError(requestsQuery.error, t, t("pages.joinRequests.loadError", { defaultValue: "Failed to load join requests." }));
    return <div className="text-sm text-destructive">{message}</div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">{t("pages.joinRequests.queueTitle", { defaultValue: "Join Request Queue" })}</h1>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("pages.joinRequests.description", {
            defaultValue: "Review human and agent join requests outside the mixed inbox feed. This queue uses the same approval mutations as the inline inbox cards.",
          })}
        </p>
      </div>

      <Card className="flex-row flex-wrap gap-3 p-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("pages.joinRequests.status", { defaultValue: "Status" })}</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "pending_approval" | "approved" | "rejected")
            }
          >
            <option value="pending_approval">{t("pages.joinRequests.statuses.pending_approval", { defaultValue: "Pending approval" })}</option>
            <option value="approved">{t("pages.joinRequests.statuses.approved", { defaultValue: "Approved" })}</option>
            <option value="rejected">{t("pages.joinRequests.statuses.rejected", { defaultValue: "Rejected" })}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("pages.joinRequests.requestType", { defaultValue: "Request type" })}</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={requestType}
            onChange={(event) =>
              setRequestType(event.target.value as "all" | "human" | "agent")
            }
          >
            <option value="all">{t("pages.joinRequests.requestTypes.all", { defaultValue: "All" })}</option>
            <option value="human">{t("pages.joinRequests.requestTypes.human", { defaultValue: "Human" })}</option>
            <option value="agent">{t("pages.joinRequests.requestTypes.agent", { defaultValue: "Agent" })}</option>
          </select>
        </label>
      </Card>

      <div className="space-y-4">
        {(requestsQuery.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            {t("pages.joinRequests.empty", { defaultValue: "No join requests match the current filters." })}
          </div>
        ) : (
          requestsQuery.data!.map((request) => (
            <Card key={request.id} className="block p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={request.status === "pending_approval" ? "secondary" : request.status === "approved" ? "outline" : "destructive"}>
                      {t(`pages.joinRequests.statuses.${request.status}`, { defaultValue: request.status.replace("_", " ") })}
                    </Badge>
                    <Badge variant="outline">{t(`pages.joinRequests.requestTypes.${request.requestType}`, { defaultValue: request.requestType })}</Badge>
                    {request.adapterType ? <Badge variant="outline">{request.adapterType}</Badge> : null}
                  </div>
                  <div>
                    <div className="text-base font-medium">
                      {request.requestType === "human"
                        ? request.requesterUser?.name || request.requestEmailSnapshot || request.requestingUserId || t("pages.joinRequests.unknownHumanRequester", { defaultValue: "Unknown human requester" })
                        : request.agentName || t("pages.joinRequests.unknownAgentRequester", { defaultValue: "Unknown agent requester" })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.requestType === "human"
                        ? request.requesterUser?.email || request.requestEmailSnapshot || request.requestingUserId
                        : request.capabilities || request.requestIp}
                    </div>
                  </div>
                </div>

                {request.status === "pending_approval" ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                    >
                      {t("pages.inbox.reject", { defaultValue: "Reject" })}
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                    >
                      {t("pages.inbox.approve", { defaultValue: "Approve" })}
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="text-xs font-medium uppercase tracking-wide">{t("pages.joinRequests.inviteContext", { defaultValue: "Invite context" })}</div>
                  <div className="mt-2">
                    {request.invite
                      ? t("pages.joinRequests.inviteSummary", {
                        defaultValue: "{{joinTypes}} join invite{{role}}",
                        joinTypes: request.invite.allowedJoinTypes,
                        role: request.invite.humanRole ? ` • ${t("pages.joinRequests.defaultRole", { defaultValue: "default role {{role}}", role: request.invite.humanRole })}` : "",
                      })
                      : t("pages.joinRequests.inviteUnavailable", { defaultValue: "Invite metadata unavailable" })}
                  </div>
                  {request.invite?.inviteMessage ? (
                    <div className="mt-2 text-foreground">{request.invite.inviteMessage}</div>
                  ) : null}
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="text-xs font-medium uppercase tracking-wide">{t("pages.joinRequests.requestDetails", { defaultValue: "Request details" })}</div>
                  <div className="mt-2">{t("pages.joinRequests.submittedAt", { defaultValue: "Submitted {{time}}", time: new Date(request.createdAt).toLocaleString() })}</div>
                  <div>{t("pages.joinRequests.sourceIp", { defaultValue: "Source IP {{ip}}", ip: request.requestIp })}</div>
                  {request.requestType === "agent" && request.capabilities ? <div>{request.capabilities}</div> : null}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
