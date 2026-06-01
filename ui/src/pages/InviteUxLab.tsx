import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyPatternIcon } from "@/components/CompanyPatternIcon";
import { t, useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  FlaskConical,
  KeyRound,
  Link2,
  Loader2,
  MailPlus,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

const inviteRoleOptions = [
  {
    value: "viewer",
    label: "pages.companyInvites.roles.viewer.label",
    description: "pages.companyInvites.roles.viewer.description",
    gets: "pages.companyInvites.roles.viewer.gets",
  },
  {
    value: "operator",
    label: "pages.companyInvites.roles.operator.label",
    description: "pages.companyInvites.roles.operator.description",
    gets: "pages.companyInvites.roles.operator.gets",
  },
  {
    value: "admin",
    label: "pages.companyInvites.roles.admin.label",
    description: "pages.companyInvites.roles.admin.description",
    gets: "pages.companyInvites.roles.admin.gets",
  },
  {
    value: "owner",
    label: "pages.companyInvites.roles.owner.label",
    description: "pages.companyInvites.roles.owner.description",
    gets: "pages.companyInvites.roles.owner.gets",
  },
] as const;

const inviteHistory = [
  {
    id: "invite-active",
    state: "pages.companyInvites.states.active",
    humanRole: "operator",
    invitedBy: "Board User 25",
    email: "board25@paperclip.local",
    createdAt: "Apr 25, 2026, 9:00 AM",
    action: "pages.companyInvites.revoke",
    relatedLabel: "pages.companyInvites.reviewRequest",
  },
  {
    id: "invite-accepted",
    state: "pages.companyInvites.states.accepted",
    humanRole: "viewer",
    invitedBy: "Board User 24",
    email: "board24@paperclip.local",
    createdAt: "Apr 24, 2026, 8:15 AM",
    action: "pages.companyInvites.inactive",
    relatedLabel: "—",
  },
  {
    id: "invite-revoked",
    state: "pages.companyInvites.states.revoked",
    humanRole: "admin",
    invitedBy: "Board User 20",
    email: "board20@paperclip.local",
    createdAt: "Apr 20, 2026, 2:45 PM",
    action: "pages.companyInvites.inactive",
    relatedLabel: "—",
  },
  {
    id: "invite-expired",
    state: "pages.companyInvites.states.expired",
    humanRole: "owner",
    invitedBy: "Board User 19",
    email: "board19@paperclip.local",
    createdAt: "Apr 19, 2026, 7:10 PM",
    action: "pages.companyInvites.inactive",
    relatedLabel: "—",
  },
] as const;

const fieldClassName =
  "w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500";
const panelClassName = "border border-zinc-800 bg-zinc-950/95 p-6";

function LabSection({
  eyebrow,
  title,
  description,
  accentClassName,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accentClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border/70 bg-background/80 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-5",
        accentClassName,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusCard({
  icon,
  title,
  body,
  tone = "default",
}: {
  icon: ReactNode;
  title: string;
  body: string;
  tone?: "default" | "warn" | "success" | "error";
}) {
  const toneClassName = {
    default: "border-border/70 bg-background/85",
    warn: "border-amber-400/40 bg-amber-500/[0.08]",
    success: "border-emerald-400/40 bg-emerald-500/[0.08]",
    error: "border-rose-400/40 bg-rose-500/[0.08]",
  }[tone];

  return (
    <Card className={cn("rounded-[24px] shadow-none", toneClassName)}>
      <CardHeader className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-current/10 bg-background/70 text-muted-foreground">
          {icon}
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">{body}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

function InviteLandingShell({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_rgba(2,6,23,0.55)]">
      <div className="grid gap-px bg-zinc-800 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className={cn(panelClassName, "space-y-6 bg-zinc-950")}>{left}</section>
        <section className={cn(panelClassName, "h-full bg-zinc-950")}>{right}</section>
      </div>
    </div>
  );
}

function InviteSummaryPanel({
  title,
  description,
  inviteMessage,
  requestedAccess,
  signedInLabel,
}: {
  title: string;
  description: string;
  inviteMessage?: string;
  requestedAccess: string;
  signedInLabel?: string;
}) {
  return (
    <>
      <div className="flex items-start gap-4">
        <CompanyPatternIcon
          companyName="Acme Robotics"
          logoUrl="/api/invites/pcp_invite_test/logo"
          brandColor="#114488"
          className="h-16 w-16 rounded-none border border-zinc-800"
        />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            {t("pages.inviteLanding.eyebrow")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-zinc-100">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{description}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetaCard label={t("common.company")} value="Acme Robotics" />
        <MetaCard label={t("pages.inviteLanding.invitedBy")} value="Board User" />
        <MetaCard label={t("pages.inviteLanding.requestedAccess")} value={requestedAccess} />
        <MetaCard label={t("pages.inviteLanding.inviteExpires")} value="Mar 7, 2027" />
      </div>

      {inviteMessage ? (
        <div className="border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
            {t("pages.inviteLanding.messageFromInviter")}
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-50">{inviteMessage}</p>
        </div>
      ) : null}

      {signedInLabel ? (
        <div className="border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-50">
          {t("pages.inviteLanding.signedInAsPrefix")} <span className="font-medium">{signedInLabel}</span>.
        </div>
      ) : null}
    </>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 p-3">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-zinc-100">{value}</div>
    </div>
  );
}

function InlineAuthPreview({
  mode,
  feedback,
  working,
}: {
  mode: "sign_up" | "sign_in";
  feedback?: { tone: "info" | "error"; text: string };
  working?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">
          {mode === "sign_up" ? t("pages.inviteLanding.auth.createAccount") : t("pages.inviteLanding.auth.signInToContinue")}
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          {mode === "sign_up"
            ? t("pages.uxLabs.invite.auth.startWithAccount")
            : t("pages.uxLabs.invite.auth.useMatchingAccount")}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={cn(
            "flex-1 border px-3 py-2 text-sm transition-colors",
            mode === "sign_up"
              ? "border-zinc-100 bg-zinc-100 text-zinc-950"
              : "border-zinc-800 text-zinc-300 hover:border-zinc-600",
          )}
        >
          {t("pages.inviteLanding.auth.createAccount")}
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 border px-3 py-2 text-sm transition-colors",
            mode === "sign_in"
              ? "border-zinc-100 bg-zinc-100 text-zinc-950"
              : "border-zinc-800 text-zinc-300 hover:border-zinc-600",
          )}
        >
          {t("pages.inviteLanding.auth.alreadyHaveAccount")}
        </button>
      </div>

      <form className="space-y-4">
        {mode === "sign_up" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">{t("components.approvalPayload.fields.name")}</span>
            <input name="name" className={fieldClassName} defaultValue="Jane Example" readOnly />
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-400">{t("pages.inviteLanding.auth.email")}</span>
          <input name="email" type="email" className={fieldClassName} defaultValue="jane@example.com" readOnly />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-400">{t("pages.inviteLanding.auth.password")}</span>
          <input name="password" type="password" className={fieldClassName} defaultValue="supersecret" readOnly />
        </label>
        {feedback ? (
          <p className={cn("text-xs", feedback.tone === "info" ? "text-amber-300" : "text-red-400")}>
            {feedback.text}
          </p>
        ) : null}
        <Button type="button" className="w-full rounded-none" disabled={working}>
          {working
            ? t("pages.inviteLanding.actions.working")
            : mode === "sign_in"
              ? t("pages.inviteLanding.auth.signInAndContinue")
              : t("pages.inviteLanding.auth.createAndContinue")}
        </Button>
      </form>

      <p className="text-xs leading-5 text-zinc-500">
        {mode === "sign_up"
          ? t("pages.uxLabs.invite.auth.existingAccountHint")
          : t("pages.uxLabs.invite.auth.noAccountHint")}
      </p>
    </div>
  );
}

function AgentRequestPreview() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">{t("pages.inviteLanding.submitAgentDetails")}</h3>
        <p className="mt-1 text-sm text-zinc-400">
          {t("pages.uxLabs.invite.agentRequestDescription")}
        </p>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">{t("pages.inviteLanding.agentName")}</span>
        <input className={fieldClassName} defaultValue="Acme Ops Agent" readOnly />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">{t("pages.inviteLanding.adapterType")}</span>
        <select className={fieldClassName} defaultValue="codex_local" disabled>
          <option value="codex_local">Codex</option>
          <option value="claude_local">Claude Code</option>
          <option value="cursor">Cursor</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-zinc-400">{t("components.approvalPayload.fields.capabilities")}</span>
        <textarea
          className={fieldClassName}
          rows={4}
          defaultValue={t("pages.uxLabs.invite.agentCapabilities")}
          readOnly
        />
      </label>
      <Button type="button" className="w-full rounded-none">
        {t("pages.inviteLanding.actions.submitRequest")}
      </Button>
    </div>
  );
}

function AcceptInvitePreview({
  autoAccept,
  isCurrentMember,
  error,
}: {
  autoAccept?: boolean;
  isCurrentMember?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">{t("pages.inviteLanding.acceptCompanyInvite")}</h3>
        <p className="mt-1 text-sm text-zinc-400">
          {autoAccept
            ? t("pages.uxLabs.invite.submittingAcme")
            : isCurrentMember
              ? t("pages.uxLabs.invite.alreadyBelongsAcme")
              : t("pages.uxLabs.invite.acceptDescriptionAcme")}
        </p>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {autoAccept ? (
        <div className="text-sm text-zinc-400">{t("pages.inviteLanding.submittingRequest")}</div>
      ) : (
        <Button type="button" className="w-full rounded-none" disabled={isCurrentMember}>
          {t("pages.inviteLanding.actions.acceptInvite")}
        </Button>
      )}
    </div>
  );
}

function InviteResultPreview({
  title,
  description,
  claimSecret,
  onboardingTextUrl,
  joinedNow = false,
}: {
  title: string;
  description: string;
  claimSecret?: string;
  onboardingTextUrl?: string;
  joinedNow?: boolean;
}) {
  return (
    <div className="mx-auto max-w-md border border-zinc-800 bg-zinc-950 p-6 text-zinc-100">
      <div className="flex items-center gap-3">
        <CompanyPatternIcon
          companyName="Acme Robotics"
          logoUrl="/api/invites/pcp_invite_test/logo"
          brandColor="#114488"
          className="h-12 w-12 rounded-none border border-zinc-800"
        />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-sm text-zinc-400">{description}</p>
        {joinedNow ? (
          <Button type="button" className="w-full rounded-none">
            {t("pages.inviteLanding.actions.openBoard")}
          </Button>
        ) : (
          <>
            <div className="border border-zinc-800 p-3">
              <p className="mb-1 text-xs text-zinc-500">{t("pages.inviteLanding.awaiting.approvalPage")}</p>
              <a className="text-sm text-zinc-200 underline underline-offset-2" href="/company/settings/members">
                {t("pages.inviteLanding.awaiting.membersLink")}
              </a>
            </div>
            <p className="text-xs text-zinc-500">
              {t("pages.inviteLanding.awaiting.refresh")}
            </p>
          </>
        )}
        {claimSecret ? (
          <div className="space-y-1 border border-zinc-800 p-3 text-xs text-zinc-400">
            <div className="text-zinc-200">{t("pages.inviteLanding.awaiting.claimSecret")}</div>
            <div className="font-mono break-all">{claimSecret}</div>
            <div className="font-mono break-all">POST /api/agents/claim-api-key</div>
          </div>
        ) : null}
        {onboardingTextUrl ? (
          <div className="text-xs text-zinc-400">
            {t("pages.inviteLanding.awaiting.onboarding")} <span className="font-mono break-all">{onboardingTextUrl}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AuthScreenPreview({ mode, error }: { mode: "sign_in" | "sign_up"; error?: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="grid gap-px bg-border/60 md:grid-cols-2">
        <div className="flex min-h-[420px] flex-col justify-center bg-background px-8 py-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Paperclip</span>
            </div>
            <h3 className="text-xl font-semibold">
              {mode === "sign_in" ? t("pages.auth.signInTitle") : t("pages.auth.signUpTitle")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "sign_in"
                ? t("pages.uxLabs.invite.authScreen.signInDescription")
                : t("pages.uxLabs.invite.authScreen.signUpDescription")}
            </p>
            <div className="mt-6 space-y-4">
              {mode === "sign_up" ? (
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">{t("components.approvalPayload.fields.name")}</span>
                  <input
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                    defaultValue="Jane Example"
                    readOnly
                  />
                </label>
              ) : null}
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">{t("pages.inviteLanding.auth.email")}</span>
                <input
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  defaultValue="jane@example.com"
                  readOnly
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">{t("pages.inviteLanding.auth.password")}</span>
                <input
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
                  defaultValue="supersecret"
                  readOnly
                />
              </label>
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
              <Button type="button" className="w-full">
                {mode === "sign_in" ? t("pages.auth.signIn") : t("pages.auth.createAccount")}
              </Button>
            </div>
            <div className="mt-5 text-sm text-muted-foreground">
              {mode === "sign_in" ? t("pages.auth.needAccount") : t("pages.auth.haveAccount")}{" "}
              <span className="font-medium text-foreground underline underline-offset-2">
                {mode === "sign_in" ? t("pages.auth.createOne") : t("pages.auth.signIn")}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden min-h-[420px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.18),transparent_48%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] px-8 py-10 md:flex">
          <div className="max-w-sm space-y-4 text-zinc-200">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-cyan-200">
              {t("pages.uxLabs.invite.authScreen.previewBadge")}
            </div>
            <div className="text-2xl font-semibold">{t("pages.uxLabs.invite.authScreen.sideBySideTitle")}</div>
            <p className="text-sm leading-6 text-zinc-400">
              {t("pages.uxLabs.invite.authScreen.sideBySideDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyInvitesPreview() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <Card className="rounded-[28px] shadow-none">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MailPlus className="h-4 w-4" />
            {t("pages.companyInvites.title")}
          </div>
          <div>
            <CardTitle>{t("pages.companyInvites.createInvite")}</CardTitle>
            <CardDescription className="mt-2">
              {t("pages.uxLabs.invite.companyInvites.createDescription")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">{t("pages.companyInvites.chooseRole")}</legend>
            <div className="rounded-2xl border border-border">
              {inviteRoleOptions.map((option, index) => (
                <label
                  key={option.value}
                  className={cn("flex cursor-default gap-3 px-4 py-4", index > 0 && "border-t border-border")}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={option.value === "operator"}
                    className="mt-1 h-4 w-4 border-border text-foreground"
                  />
                  <span className="min-w-0 space-y-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{t(option.label)}</span>
                      {option.value === "operator" ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          {t("pages.uxLabs.invite.default")}
                        </span>
                      ) : null}
                    </span>
                    <span className="block max-w-2xl text-sm text-muted-foreground">{t(option.description)}</span>
                    <span className="block text-sm text-foreground">{t(option.gets)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
            {t("pages.uxLabs.invite.companyInvites.singleUse")}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button">{t("pages.companyInvites.createInvite")}</Button>
            <span className="text-sm text-muted-foreground">{t("pages.uxLabs.invite.companyInvites.auditTrail")}</span>
          </div>

          <div className="space-y-3 rounded-2xl border border-border px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{t("pages.companyInvites.latestInviteLink")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("pages.companyInvites.currentDomainHint")}
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                <Check className="h-3.5 w-3.5" />
                {t("common.copiedShort")}
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-md border border-border bg-muted/60 px-3 py-2 text-left text-sm break-all"
            >
              https://paperclip.local/invite/new-token
            </button>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline">
                <ExternalLink className="h-4 w-4" />
                {t("pages.companyInvites.openInvite")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] shadow-none">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{t("pages.companyInvites.inviteHistory")}</CardTitle>
              <CardDescription className="mt-2">
                {t("pages.uxLabs.invite.companyInvites.historyDescription")}
              </CardDescription>
            </div>
            <a href="/inbox/requests" className="text-sm underline underline-offset-4">
              {t("pages.companyInvites.openJoinQueue")}
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-border">
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
                      <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        {t(invite.state)}
                      </span>
                    </td>
                    <td className="px-5 py-3 align-top">{invite.humanRole}</td>
                    <td className="px-5 py-3 align-top">
                      <div>{invite.invitedBy}</div>
                      <div className="text-xs text-muted-foreground">{invite.email}</div>
                    </td>
                    <td className="px-5 py-3 align-top text-muted-foreground">{invite.createdAt}</td>
                    <td className="px-5 py-3 align-top">
                      {invite.relatedLabel === "pages.companyInvites.reviewRequest" ? (
                        <a href="/inbox/requests" className="underline underline-offset-4">
                          {t(invite.relatedLabel)}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">{invite.relatedLabel}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right align-top">
                      {invite.action === "pages.companyInvites.revoke" ? (
                        <Button type="button" size="sm" variant="outline">
                          {t(invite.action)}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t(invite.action)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <div className="text-sm font-medium">{t("pages.uxLabs.invite.companyInvites.emptyHistoryState")}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {t("pages.companyInvites.noInvites")}
              </div>
            </div>
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/[0.07] p-4">
              <div className="text-sm font-medium text-foreground">{t("pages.uxLabs.invite.companyInvites.permissionError")}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {t("pages.companyInvites.noPermission")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function InviteUxLab() {
  useTranslation();
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-border/70 bg-[linear-gradient(135deg,rgba(8,145,178,0.10),transparent_28%),linear-gradient(180deg,rgba(245,158,11,0.10),transparent_44%),var(--background)] shadow-[0_30px_80px_rgba(15,23,42,0.10)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="p-6 sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
              <FlaskConical className="h-3.5 w-3.5" />
              {t("pages.uxLabs.invite.badge")}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t("pages.uxLabs.invite.title")}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t("pages.uxLabs.invite.description")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                /tests/ux/invites
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                {t("pages.uxLabs.invite.badges.signupStates")}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                {t("pages.uxLabs.invite.badges.fixturePreview")}
              </Badge>
            </div>
          </div>

          <aside className="border-t border-border/60 bg-background/70 p-6 lg:border-l lg:border-t-0">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("pages.uxLabs.common.coveredStates")}
            </div>
            <div className="space-y-3">
              {[
                t("pages.uxLabs.invite.highlights.loading"),
                t("pages.uxLabs.invite.highlights.authVariants"),
                t("pages.uxLabs.invite.highlights.acceptTransitions"),
                t("pages.uxLabs.invite.highlights.resultScreens"),
                t("pages.uxLabs.invite.highlights.companyInviteStates"),
              ].map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-border/70 bg-background/85 px-4 py-3 text-sm text-muted-foreground"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <LabSection
        eyebrow={t("pages.uxLabs.invite.sections.topLevel.eyebrow")}
        title={t("pages.uxLabs.invite.sections.topLevel.title")}
        description={t("pages.uxLabs.invite.sections.topLevel.description")}
        accentClassName="bg-[linear-gradient(180deg,rgba(59,130,246,0.05),transparent_30%),var(--background)]"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            icon={<Loader2 className="h-4 w-4 animate-spin" />}
            title={t("pages.uxLabs.invite.statusCards.loading.title")}
            body={t("pages.uxLabs.invite.statusCards.loading.body")}
          />
          <StatusCard
            icon={<Clock3 className="h-4 w-4" />}
            title={t("pages.uxLabs.invite.statusCards.checkingAccess.title")}
            body={t("pages.uxLabs.invite.statusCards.checkingAccess.body")}
          />
          <StatusCard
            icon={<KeyRound className="h-4 w-4" />}
            title={t("pages.uxLabs.invite.statusCards.invalidToken.title")}
            body={t("pages.uxLabs.invite.statusCards.invalidToken.body")}
            tone="error"
          />
          <StatusCard
            icon={<Link2 className="h-4 w-4" />}
            title={t("pages.inviteLanding.notAvailableTitle")}
            body={t("pages.inviteLanding.notAvailableDescription")}
            tone="warn"
          />
          <StatusCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title={t("pages.inviteLanding.bootstrapComplete")}
            body={t("pages.uxLabs.invite.statusCards.bootstrapComplete.body")}
            tone="success"
          />
          <StatusCard
            icon={<ArrowRight className="h-4 w-4" />}
            title={t("pages.uxLabs.invite.statusCards.autoAccept.title")}
            body={t("pages.uxLabs.invite.statusCards.autoAccept.body")}
          />
          <StatusCard
            icon={<Users className="h-4 w-4" />}
            title={t("pages.uxLabs.invite.statusCards.alreadyMember.title")}
            body={t("pages.uxLabs.invite.statusCards.alreadyMember.body")}
          />
          <StatusCard
            icon={<UserPlus className="h-4 w-4" />}
            title={t("pages.uxLabs.invite.statusCards.resultSurfaces.title")}
            body={t("pages.uxLabs.invite.statusCards.resultSurfaces.body")}
            tone="success"
          />
        </div>
      </LabSection>

      <LabSection
        eyebrow={t("pages.uxLabs.invite.sections.landing.eyebrow")}
        title={t("pages.uxLabs.invite.sections.landing.title")}
        description={t("pages.uxLabs.invite.sections.landing.description")}
        accentClassName="bg-[linear-gradient(180deg,rgba(234,179,8,0.06),transparent_28%),var(--background)]"
      >
        <div className="space-y-5">
          <InviteLandingShell
            left={
              <InviteSummaryPanel
                title={t("pages.uxLabs.invite.joinAcme")}
                description={t("pages.inviteLanding.createAccountDescription")}
                inviteMessage={t("pages.uxLabs.invite.welcomeAboard")}
                requestedAccess={t("pages.companyInvites.roles.operator.label")}
              />
            }
            right={<InlineAuthPreview mode="sign_up" />}
          />

          <InviteLandingShell
            left={
              <InviteSummaryPanel
                title={t("pages.uxLabs.invite.joinAcme")}
                description={t("pages.inviteLanding.createAccountDescription")}
                inviteMessage={t("pages.uxLabs.invite.welcomeAboard")}
                requestedAccess={t("pages.companyInvites.roles.operator.label")}
              />
            }
            right={
              <InlineAuthPreview
                mode="sign_in"
                feedback={{
                  tone: "info",
                  text: t("pages.uxLabs.invite.accountExistsFeedback"),
                }}
              />
            }
          />

          <InviteLandingShell
            left={
              <InviteSummaryPanel
                title={t("pages.uxLabs.invite.joinAcme")}
                description={t("pages.inviteLanding.readyDescription")}
                inviteMessage={t("pages.uxLabs.invite.welcomeAboard")}
                requestedAccess={t("pages.companyInvites.roles.operator.label")}
                signedInLabel="Jane Example"
              />
            }
            right={<AcceptInvitePreview autoAccept />}
          />

          <InviteLandingShell
            left={
              <InviteSummaryPanel
                title={t("pages.uxLabs.invite.joinAcme")}
                description={t("pages.inviteLanding.agentInviteDescription")}
                requestedAccess={t("pages.inviteLanding.agentJoinRequest")}
              />
            }
            right={<AgentRequestPreview />}
          />

          <InviteLandingShell
            left={
              <InviteSummaryPanel
                title={t("pages.uxLabs.invite.joinAcme")}
                description={t("pages.inviteLanding.readyDescription")}
                requestedAccess={t("pages.companyInvites.roles.operator.label")}
                signedInLabel="Jane Example"
              />
            }
            right={<AcceptInvitePreview error={t("pages.inviteLanding.errors.alreadyMember")} isCurrentMember />}
          />
        </div>
      </LabSection>

      <LabSection
        eyebrow={t("pages.uxLabs.invite.sections.results.eyebrow")}
        title={t("pages.uxLabs.invite.sections.results.title")}
        description={t("pages.uxLabs.invite.sections.results.description")}
        accentClassName="bg-[linear-gradient(180deg,rgba(16,185,129,0.06),transparent_30%),var(--background)]"
      >
        <div className="grid gap-5 xl:grid-cols-3">
          <InviteResultPreview
            title={t("pages.inviteLanding.awaiting.title", { company: "Acme Robotics" })}
            description={t("pages.inviteLanding.awaiting.description", { approver: "Board User" })}
            claimSecret="pcp_claim_secret_demo"
            onboardingTextUrl="/api/invites/pcp_invite_test/onboarding.txt"
          />
          <InviteResultPreview
            title={t("pages.inviteLanding.joinedCompany")}
            description={t("pages.uxLabs.invite.joinedDescription")}
            joinedNow
          />
          <InviteResultPreview
            title={t("pages.inviteLanding.awaiting.title", { company: "Acme Robotics" })}
            description={t("pages.inviteLanding.awaiting.askSuffix")}
          />
        </div>
      </LabSection>

      <LabSection
        eyebrow={t("pages.uxLabs.invite.sections.auth.eyebrow")}
        title={t("pages.uxLabs.invite.sections.auth.title")}
        description={t("pages.uxLabs.invite.sections.auth.description")}
        accentClassName="bg-[linear-gradient(180deg,rgba(168,85,247,0.06),transparent_28%),var(--background)]"
      >
        <div className="space-y-5">
          <AuthScreenPreview mode="sign_in" error={t("pages.inviteLanding.auth.invalidCredentials")} />
          <AuthScreenPreview mode="sign_up" />
        </div>
      </LabSection>

      <LabSection
        eyebrow={t("pages.uxLabs.invite.sections.companySettings.eyebrow")}
        title={t("pages.uxLabs.invite.sections.companySettings.title")}
        description={t("pages.uxLabs.invite.sections.companySettings.description")}
        accentClassName="bg-[linear-gradient(180deg,rgba(244,114,182,0.06),transparent_28%),var(--background)]"
      >
        <CompanyInvitesPreview />
      </LabSection>
    </div>
  );
}
