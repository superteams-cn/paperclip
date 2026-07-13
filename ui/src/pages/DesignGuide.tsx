import { useState } from "react";
import {
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  CircleDot,
  Command as CommandIcon,
  DollarSign,
  Hexagon,
  History,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Mail,
  Plus,
  Search,
  Settings,
  Target,
  Trash2,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineBanner } from "@/components/InlineBanner";
import { BuiltInAgentBadge, BuiltInLifecycleChip } from "@/components/BuiltInAgentBadges";
import { t, useTranslation } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable-panels";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { AgentCapsule, AGENT_GRADIENT_COUNT } from "@/components/AgentCapsule";
import { StatusBadge, IssueStatusBadge } from "@/components/StatusBadge";
import { StatusIcon } from "@/components/StatusIcon";
import { EnforcementBanner } from "@/components/EnforcementBanner";
import { ActionCard, ActionCardMobile, BindingsTable } from "@/components/actions/ActionCard";
import { PriorityIcon } from "@/components/PriorityIcon";
import { agentStatusDot, agentStatusDotDefault } from "@/lib/status-colors";
import { EntityRow } from "@/components/EntityRow";
import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { FilterBar, type FilterValue } from "@/components/FilterBar";
import { InlineEditor } from "@/components/InlineEditor";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Identity } from "@/components/Identity";
import { IssueReferencePill } from "@/components/IssueReferencePill";
import { MembershipAction } from "@/components/MembershipAction";
import { IssueOutputSection } from "@/components/issue-output/IssueOutputSection";
import { EnvironmentVariablesEditor } from "@/components/environment-variables-editor";
import type { CompanySecret, EnvBinding } from "@paperclipai/shared";
import {
  EnvInputsList,
  ExternalSourcesList,
  RequiredSkillsList,
  StepSkillPlan,
  StepSourcePolicy,
  TeamCard,
  TeamHierarchyPreview,
  TeamRow,
} from "@/pages/TeamCatalog";
import {
  currentInstalledState,
  onboardingTeams,
  optionalTeam,
  outOfDateInstalledState,
  sampleSkillPreparations,
  sampleTeam,
  warnTeam,
} from "@/pages/TeamCatalog.fixtures";
import type { IssueWorkProduct } from "@paperclipai/shared";

/* ------------------------------------------------------------------ */
/*  Sample data for the Issue Output surface showcase                  */
/* ------------------------------------------------------------------ */

function sampleOutput(
  id: string,
  attachmentId: string,
  contentType: string,
  filename: string,
  opts: { byteSize: number; isPrimary?: boolean; createdAt: string },
): IssueWorkProduct {
  const contentPath = `/api/attachments/${attachmentId}/content`;
  return {
    id,
    companyId: "demo-company",
    projectId: null,
    issueId: "demo-issue",
    executionWorkspaceId: null,
    runtimeServiceId: null,
    type: "artifact",
    provider: "paperclip",
    externalId: null,
    title: filename,
    url: null,
    status: "active",
    reviewState: "none",
    isPrimary: Boolean(opts.isPrimary),
    healthStatus: "unknown",
    summary: null,
    createdByRunId: null,
    createdAt: new Date(opts.createdAt),
    updatedAt: new Date(opts.createdAt),
    metadata: {
      attachmentId,
      contentType,
      byteSize: opts.byteSize,
      contentPath,
      openPath: contentPath,
      downloadPath: `${contentPath}?download=1`,
      originalFilename: filename,
    },
  } as IssueWorkProduct;
}

const DESIGN_GUIDE_OUTPUTS: IssueWorkProduct[] = [
  sampleOutput("wp-vid", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "video/mp4", "q3-summary.mp4", {
    byteSize: 19_293_798,
    isPrimary: true,
    createdAt: "2026-05-30T12:00:00Z",
  }),
  sampleOutput("wp-pdf", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "application/pdf", "talking-points.pdf", {
    byteSize: 421_888,
    createdAt: "2026-05-30T11:52:00Z",
  }),
];

const DESIGN_GUIDE_DEGRADED_OUTPUTS: IssueWorkProduct[] = [
  {
    ...sampleOutput("wp-broken", "cccccccc-cccc-4ccc-8ccc-cccccccccccc", "video/mp4", "corrupt-output.mp4", {
      byteSize: 0,
      isPrimary: true,
      createdAt: "2026-05-30T12:01:00Z",
    }),
    // Strip the path metadata so it fails the shared artifact schema.
    metadata: { attachmentId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", contentType: "video/mp4" },
  } as IssueWorkProduct,
];

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <Separator />
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">{title}</h4>
      {children}
    </div>
  );
}

// Onboarding seam (design §6 + §12.5): the TeamCard tile in its "Pick a starter
// team" 3-col grid, with the first defaultInstall tile selected.
function TeamCardShowcase() {
  const [selectedId, setSelectedId] = useState(onboardingTeams[0]?.id ?? null);
  return (
    <div className="grid max-w-2xl gap-4 md:grid-cols-2 lg:grid-cols-3">
      {onboardingTeams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          selected={team.id === selectedId}
          onSelect={() => setSelectedId(team.id)}
        />
      ))}
    </div>
  );
}

// Reusable environment-variables editor: one shared grid, in-field source
// switch, fuzzy secret picker, sensitive-value detection, inline health.
const DESIGN_GUIDE_SECRETS: CompanySecret[] = [
  {
    id: "dg-github",
    companyId: "dg",
    scope: "company",
    ownerUserId: null,
    userSecretDefinitionId: null,
    key: "github_token",
    name: "GITHUB_TOKEN",
    provider: "local_encrypted",
    status: "active",
    managedMode: "paperclip_managed",
    externalRef: null,
    providerConfigId: null,
    providerMetadata: null,
    latestVersion: 3,
    description: null,
    lastResolvedAt: null,
    lastRotatedAt: null,
    deletedAt: null,
    createdByAgentId: null,
    createdByUserId: null,
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    updatedAt: new Date("2026-03-01T10:00:00.000Z"),
  },
  {
    id: "dg-db",
    companyId: "dg",
    scope: "company",
    ownerUserId: null,
    userSecretDefinitionId: null,
    key: "db_connection",
    name: "DB_CONNECTION",
    provider: "local_encrypted",
    status: "active",
    managedMode: "paperclip_managed",
    externalRef: null,
    providerConfigId: null,
    providerMetadata: null,
    latestVersion: 3,
    description: null,
    lastResolvedAt: null,
    lastRotatedAt: null,
    deletedAt: null,
    createdByAgentId: null,
    createdByUserId: null,
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    updatedAt: new Date("2026-03-01T10:00:00.000Z"),
  },
];

function EnvironmentVariablesEditorShowcase() {
  const [env, setEnv] = useState<Record<string, EnvBinding>>({
    NODE_ENV: { type: "plain", value: "production" },
    GH_TOKEN: { type: "secret_ref", secretId: "dg-github", version: "latest" },
    DB_URL: { type: "secret_ref", secretId: "dg-db", version: 3 },
    STRIPE_API_KEY: { type: "plain", value: "sk-live-51H8xL0aBcDeFgHiJkLmNoPq" },
  });
  return (
    <div className="max-w-(--sz-640px) rounded-md border border-border p-4">
      <EnvironmentVariablesEditor
        value={env}
        secrets={DESIGN_GUIDE_SECRETS}
        onChange={(next) => setEnv(next ?? {})}
        onCreateSecret={async (name) => ({
          ...DESIGN_GUIDE_SECRETS[0]!,
          id: `dg-${name}`,
          key: name,
          name: name.toUpperCase(),
          latestVersion: 1,
        })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Color swatch                                                       */
/* ------------------------------------------------------------------ */

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 rounded-md border border-border shrink-0"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className="text-xs font-mono">{cssVar}</p>
        <p className="text-xs text-muted-foreground">{name}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function DesignGuide() {
  useTranslation();
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [selectValue, setSelectValue] = useState("in_progress");
  const [menuChecked, setMenuChecked] = useState(true);
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [inlineText, setInlineText] = useState(t("pages.uxLabs.designGuide.samples.inlineText"));
  const [inlineTitle, setInlineTitle] = useState(t("pages.uxLabs.designGuide.samples.inlineTitle"));
  const [inlineDesc, setInlineDesc] = useState(
    t("pages.uxLabs.designGuide.samples.inlineDescription")
  );
  const [filters, setFilters] = useState<FilterValue[]>([
    { key: "status", label: t("common.status"), value: t("common.active") },
    { key: "priority", label: t("pages.uxLabs.designGuide.priority"), value: t("labels.priority.high") },
  ]);
  const [allowExternal, setAllowExternal] = useState(false);
  const [allowUnpinned, setAllowUnpinned] = useState(false);
  const [allowLocalPath, setAllowLocalPath] = useState(false);

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold">{t("pages.uxLabs.designGuide.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("pages.uxLabs.designGuide.description")}
        </p>
      </div>

      {/* ============================================================ */}
      {/*  COVERAGE                                                     */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.componentCoverage")}>
        <p className="text-sm text-muted-foreground">
          {t("pages.uxLabs.designGuide.componentCoverageDescription")}
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <SubSection title={t("pages.uxLabs.designGuide.subsections.uiPrimitives")}>
            <div className="flex flex-wrap gap-2">
              {[
                "avatar", "badge", "breadcrumb", "button", "card", "checkbox", "collapsible",
                "command", "dialog", "dropdown-menu", "input", "label", "popover", "resizable-panels",
                "scroll-area", "select", "separator", "sheet", "skeleton", "tabs", "textarea", "tooltip",
              ].map((name) => (
                <Badge key={name} variant="outline" className="font-mono text-(length:--text-nano)">
                  {name}
                </Badge>
              ))}
            </div>
          </SubSection>
          <SubSection title={t("pages.uxLabs.designGuide.subsections.appComponents")}>
            <div className="flex flex-wrap gap-2">
              {[
                "StatusBadge", "StatusIcon", "PriorityIcon", "EntityRow", "EmptyState", "MetricCard",
                "FilterBar", "InlineEditor", "PageSkeleton", "Identity", "CommentThread", "MarkdownEditor",
                "PropertiesPanel", "Sidebar", "CommandPalette", "EnvironmentVariablesEditor",
                "InlineBanner", "BuiltInAgentGate", "BuiltInAgentBadge",
              ].map((name) => (
                <Badge key={name} variant="ghost" className="font-mono text-(length:--text-nano)">
                  {name}
                </Badge>
              ))}
            </div>
          </SubSection>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  COLORS                                                       */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.colors")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.core")}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Swatch name="Background" cssVar="--background" />
            <Swatch name="Foreground" cssVar="--foreground" />
            <Swatch name="Card" cssVar="--card" />
            <Swatch name="Primary" cssVar="--primary" />
            <Swatch name="Primary foreground" cssVar="--primary-foreground" />
            <Swatch name="Secondary" cssVar="--secondary" />
            <Swatch name="Muted" cssVar="--muted" />
            <Swatch name="Muted foreground" cssVar="--muted-foreground" />
            <Swatch name="Accent" cssVar="--accent" />
            <Swatch name="Destructive" cssVar="--destructive" />
            <Swatch name="Border" cssVar="--border" />
            <Swatch name="Ring" cssVar="--ring" />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.sidebar")}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Swatch name="Sidebar" cssVar="--sidebar" />
            <Swatch name="Sidebar border" cssVar="--sidebar-border" />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.chart")}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Swatch name="Chart 1" cssVar="--chart-1" />
            <Swatch name="Chart 2" cssVar="--chart-2" />
            <Swatch name="Chart 3" cssVar="--chart-3" />
            <Swatch name="Chart 4" cssVar="--chart-4" />
            <Swatch name="Chart 5" cssVar="--chart-5" />
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  TYPOGRAPHY                                                   */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.typography")}>
        <div className="space-y-3">
          <h2 className="text-xl font-bold">{t("pages.uxLabs.designGuide.typography.pageTitle")}</h2>
          <h2 className="text-lg font-semibold">{t("pages.uxLabs.designGuide.typography.sectionTitle")}</h2>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("pages.uxLabs.designGuide.typography.sectionHeading")}
          </h3>
          <p className="text-sm font-medium">{t("pages.uxLabs.designGuide.typography.cardTitle")}</p>
          <p className="text-sm font-semibold">{t("pages.uxLabs.designGuide.typography.cardTitleAlt")}</p>
          <p className="text-sm">{t("pages.uxLabs.designGuide.typography.bodyText")}</p>
          <p className="text-sm text-muted-foreground">
            {t("pages.uxLabs.designGuide.typography.mutedDescription")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("pages.uxLabs.designGuide.typography.tinyLabel")}
          </p>
          <p className="text-sm font-mono text-muted-foreground">
            {t("pages.uxLabs.designGuide.typography.monoIdentifier")}
          </p>
          <p className="text-2xl font-bold">{t("pages.uxLabs.designGuide.typography.largeStat")}</p>
          <p className="font-mono text-xs">{t("pages.uxLabs.designGuide.typography.logCodeText")}</p>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SPACING & RADIUS                                             */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.radius")}>
        <div className="flex items-end gap-4 flex-wrap">
          {[
            ["sm", "var(--radius-sm)"],
            ["md", "var(--radius-md)"],
            ["lg", "var(--radius-lg)"],
            ["xl", "var(--radius-xl)"],
            ["full", "9999px"],
          ].map(([label, radius]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="h-12 w-12 bg-primary"
                style={{ borderRadius: radius }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  BUTTONS                                                      */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.buttons")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.variants")}>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="default">{t("pages.uxLabs.designGuide.variants.default")}</Button>
            <Button variant="secondary">{t("pages.uxLabs.designGuide.variants.secondary")}</Button>
            <Button variant="outline">{t("pages.uxLabs.designGuide.variants.outline")}</Button>
            <Button variant="ghost">{t("pages.uxLabs.designGuide.variants.ghost")}</Button>
            <Button variant="destructive">{t("pages.uxLabs.designGuide.variants.destructive")}</Button>
            <Button variant="link">{t("pages.uxLabs.designGuide.variants.link")}</Button>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.sizes")}>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="xs">{t("pages.uxLabs.designGuide.sizes.extraSmall")}</Button>
            <Button size="sm">{t("pages.uxLabs.designGuide.sizes.small")}</Button>
            <Button size="default">{t("pages.uxLabs.designGuide.sizes.default")}</Button>
            <Button size="lg">{t("pages.uxLabs.designGuide.sizes.large")}</Button>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.iconButtons")}>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="icon-xs"><Search /></Button>
            <Button variant="ghost" size="icon-sm"><Search /></Button>
            <Button variant="outline" size="icon"><Search /></Button>
            <Button variant="outline" size="icon-lg"><Search /></Button>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.withIcons")}>
          <div className="flex items-center gap-2 flex-wrap">
            <Button><Plus /> {t("command.createIssue")}</Button>
            <Button variant="outline"><Upload /> {t("pages.uxLabs.designGuide.actions.upload")}</Button>
            <Button variant="destructive"><Trash2 /> {t("common.delete")}</Button>
            <Button size="sm"><Plus /> {t("pages.uxLabs.designGuide.actions.add")}</Button>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.states")}>
          <div className="flex items-center gap-2 flex-wrap">
            <Button disabled>{t("pages.uxLabs.designGuide.states.disabled")}</Button>
            <Button variant="outline" disabled>{t("pages.uxLabs.designGuide.states.disabledOutline")}</Button>
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  BADGES                                                       */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.badges")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.variants")}>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default">{t("pages.uxLabs.designGuide.variants.default")}</Badge>
            <Badge variant="secondary">{t("pages.uxLabs.designGuide.variants.secondary")}</Badge>
            <Badge variant="outline">{t("pages.uxLabs.designGuide.variants.outline")}</Badge>
            <Badge variant="destructive">{t("pages.uxLabs.designGuide.variants.destructive")}</Badge>
            <Badge variant="ghost">{t("pages.uxLabs.designGuide.variants.ghost")}</Badge>
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  STATUS BADGES & ICONS                                        */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.statusSystem")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.statusBadgeAll")}>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              "active", "running", "paused", "idle", "archived", "planned",
              "achieved", "completed", "failed", "timed_out", "succeeded", "error",
              "pending_approval", "backlog", "todo", "in_progress", "in_review", "blocked",
              "done", "terminated", "cancelled", "pending", "revision_requested",
              "approved", "rejected",
            ].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.issueStatusBadge", { defaultValue: "IssueStatusBadge (brand chip + glyph — PAP-75)" })}>
          <div className="flex items-center gap-2 flex-wrap">
            {["backlog", "todo", "in_progress", "in_review", "done", "blocked", "cancelled"].map(
              (s) => (
                <IssueStatusBadge key={s} status={s} />
              )
            )}
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.statusIconInteractive")}>
          <div className="flex items-center gap-3 flex-wrap">
            {["backlog", "todo", "in_progress", "in_review", "done", "cancelled", "blocked"].map(
              (s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <StatusIcon status={s} />
                  <span className="text-xs text-muted-foreground">{s}</span>
                </div>
              )
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StatusIcon status={status} onChange={setStatus} />
            <span className="text-sm">
              {t("pages.uxLabs.designGuide.currentStatusHint", { status })}
            </span>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.priorityIconInteractive")}>
          <div className="flex items-center gap-3 flex-wrap">
            {["critical", "high", "medium", "low"].map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <PriorityIcon priority={p} />
                <span className="text-xs text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <PriorityIcon priority={priority} onChange={setPriority} />
            <span className="text-sm">
              {t("pages.uxLabs.designGuide.currentPriorityHint", { priority })}
            </span>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.agentStatusDots")}>
          <div className="flex items-center gap-4 flex-wrap">
            {(["running", "active", "paused", "error", "archived"] as const).map((label) => (
              <div key={label} className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`inline-flex h-full w-full rounded-full ${agentStatusDot[label] ?? agentStatusDotDefault}`} />
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.runInvocationBadges")}>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              ["timer", "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"],
              ["assignment", "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"],
              ["on_demand", "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300"],
              ["automation", "bg-muted text-muted-foreground"],
            ].map(([label, cls]) => (
              <Badge variant="ghost" key={label} className={`px-1.5 text-(length:--text-nano) ${cls}`}>
                {label}
              </Badge>
            ))}
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.issueReferencePill", { defaultValue: "IssueReferencePill" })}>
          <p className="text-xs text-muted-foreground">
            {t("pages.uxLabs.designGuide.issueReferenceDescription.beforeStatus")}{" "}
            <code className="font-mono">status</code>{" "}
            {t("pages.uxLabs.designGuide.issueReferenceDescription.afterStatus")}{" "}
            <code className="font-mono">strikethrough</code>{" "}
            {t("pages.uxLabs.designGuide.issueReferenceDescription.afterStrikethrough")}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <IssueReferencePill issue={{ id: "demo-1", identifier: "PAP-123", title: "Identifier only — no status yet" }} />
            <IssueReferencePill issue={{ id: "demo-2", identifier: "PAP-456", title: "With in_progress status", status: "in_progress" }} />
            <IssueReferencePill issue={{ id: "demo-3", identifier: "PAP-789", title: "Done status", status: "done" }} />
            <IssueReferencePill issue={{ id: "demo-4", identifier: "PAP-101", title: "Blocked status", status: "blocked" }} />
            <IssueReferencePill strikethrough issue={{ id: "demo-5", identifier: "PAP-202", title: "Removed (strikethrough)", status: "todo" }} />
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  AGENT CAPSULE                                                */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.agentCapsule", { defaultValue: "Agent Capsule" })}>
        <p className="text-sm text-muted-foreground max-w-prose">
          The brand &quot;capsule is the agent&quot; motif. A single agent reads as a tall
          pill that moves through three states as it comes to life. The online fill uses
          the live brand agent-gradient tokens (<code className="font-mono">--agent-Na</code> →{" "}
          <code className="font-mono">--agent-Nb</code>); <code className="font-mono">prefers-reduced-motion</code>{" "}
          skips the liquid rise and pulses and renders the final state.
        </p>
        <SubSection title="States">
          <div className="flex items-end gap-10">
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="slot" />
              <span className="text-xs text-muted-foreground">slot</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="configured" />
              <span className="text-xs text-muted-foreground">configured</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="online" gradient={5} />
              <span className="text-xs text-muted-foreground">online</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="online" gradient={5} glow="blue" />
              <span className="text-xs text-muted-foreground">online · blue glow</span>
            </div>
          </div>
        </SubSection>
        <SubSection title="Sizes">
          <div className="flex items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="online" size="sm" gradient={1} />
              <span className="text-xs text-muted-foreground">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="online" size="md" gradient={4} />
              <span className="text-xs text-muted-foreground">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="online" size="lg" gradient={8} />
              <span className="text-xs text-muted-foreground">lg</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AgentCapsule state="online" size={{ width: 28, height: 96 }} gradient={6} />
              <span className="text-xs text-muted-foreground">{t("pages.uxLabs.designGuide.capsule.customPx", { defaultValue: "custom px" })}</span>
            </div>
          </div>
        </SubSection>
        <SubSection title="Gradients">
          <div className="flex items-end gap-3 flex-wrap">
            {Array.from({ length: AGENT_GRADIENT_COUNT }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <AgentCapsule state="online" size="sm" gradient={i + 1} />
                <span className="text-(length:--text-nano) font-mono text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  FORM ELEMENTS                                                */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.formElements")}>
        <div className="grid gap-6 md:grid-cols-2">
          <SubSection title={t("pages.uxLabs.designGuide.subsections.input")}>
            <Input placeholder={t("pages.uxLabs.designGuide.placeholders.defaultInput")} />
            <Input placeholder={t("pages.uxLabs.designGuide.placeholders.disabledInput")} disabled className="mt-2" />
          </SubSection>

          <SubSection title={t("pages.uxLabs.designGuide.subsections.textarea")}>
            <Textarea placeholder={t("pages.uxLabs.designGuide.placeholders.writeSomething")} />
          </SubSection>

          <SubSection title={t("pages.uxLabs.designGuide.subsections.checkboxLabel")}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="check1" defaultChecked />
                <Label htmlFor="check1">{t("pages.uxLabs.designGuide.checkedItem")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check2" />
                <Label htmlFor="check2">{t("pages.uxLabs.designGuide.uncheckedItem")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check3" disabled />
                <Label htmlFor="check3">{t("pages.uxLabs.designGuide.disabledItem")}</Label>
              </div>
            </div>
          </SubSection>

          <SubSection title={t("pages.uxLabs.designGuide.subsections.inlineEditor")}>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("pages.uxLabs.designGuide.inlineLabels.title")}</p>
                <InlineEditor
                  value={inlineTitle}
                  onSave={setInlineTitle}
                  as="h2"
                  className="text-xl font-bold"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("pages.uxLabs.designGuide.inlineLabels.bodyText")}</p>
                <InlineEditor
                  value={inlineText}
                  onSave={setInlineText}
                  as="p"
                  className="text-sm"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("pages.uxLabs.designGuide.inlineLabels.description")}</p>
                <InlineEditor
                  value={inlineDesc}
                  onSave={setInlineDesc}
                  as="p"
                  className="text-sm text-muted-foreground"
                  placeholder={t("pages.uxLabs.designGuide.placeholders.addDescription")}
                  multiline
                />
              </div>
            </div>
          </SubSection>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SELECT                                                       */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.select")}>
        <div className="grid gap-6 md:grid-cols-2">
          <SubSection title={t("pages.uxLabs.designGuide.subsections.defaultSize")}>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("pages.uxLabs.designGuide.placeholders.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">{t("labels.status.backlog")}</SelectItem>
                <SelectItem value="todo">{t("labels.status.todo")}</SelectItem>
                <SelectItem value="in_progress">{t("labels.status.in_progress")}</SelectItem>
                <SelectItem value="in_review">{t("labels.status.in_review")}</SelectItem>
                <SelectItem value="done">{t("labels.status.done")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("pages.uxLabs.designGuide.currentValue", { value: selectValue })}
            </p>
          </SubSection>
          <SubSection title={t("pages.uxLabs.designGuide.subsections.smallTrigger")}>
            <Select defaultValue="high">
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">{t("labels.priority.critical")}</SelectItem>
                <SelectItem value="high">{t("labels.priority.high")}</SelectItem>
                <SelectItem value="medium">{t("labels.priority.medium")}</SelectItem>
                <SelectItem value="low">{t("labels.priority.low")}</SelectItem>
              </SelectContent>
            </Select>
          </SubSection>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  DROPDOWN MENU                                                */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.dropdownMenu")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t("pages.uxLabs.designGuide.quickActions")}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Check className="h-4 w-4" />
              {t("pages.uxLabs.designGuide.markAsDone")}
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpen className="h-4 w-4" />
              {t("pages.uxLabs.designGuide.openDocs")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={menuChecked}
              onCheckedChange={(value) => setMenuChecked(value === true)}
            >
              {t("pages.uxLabs.designGuide.watchIssue")}
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="h-4 w-4" />
              {t("pages.uxLabs.designGuide.deleteIssue")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      {/* ============================================================ */}
      {/*  POPOVER                                                      */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.popover")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">{t("pages.uxLabs.designGuide.openPopover")}</Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-2">
            <p className="text-sm font-medium">{t("pages.uxLabs.designGuide.agentHeartbeat")}</p>
            <p className="text-xs text-muted-foreground">
              {t("pages.uxLabs.designGuide.heartbeatDescription")}
            </p>
            <Button size="xs">{t("pages.uxLabs.designGuide.wakeNow")}</Button>
          </PopoverContent>
        </Popover>
      </Section>

      {/* ============================================================ */}
      {/*  COLLAPSIBLE                                                  */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.collapsible")}>
        <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              {collapsibleOpen ? t("pages.uxLabs.designGuide.hideAdvancedFilters") : t("pages.uxLabs.designGuide.showAdvancedFilters")}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="rounded-md border border-border p-3">
            <div className="space-y-2">
              <Label htmlFor="owner-filter">{t("pages.uxLabs.designGuide.owner")}</Label>
              <Input id="owner-filter" placeholder={t("pages.uxLabs.designGuide.placeholders.filterByAgentName")} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Section>

      {/* ============================================================ */}
      {/*  SHEET                                                        */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.sheet")}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">{t("pages.uxLabs.designGuide.openSidePanel")}</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{t("pages.uxLabs.designGuide.issueProperties")}</SheetTitle>
              <SheetDescription>{t("pages.uxLabs.designGuide.issuePropertiesDescription")}</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4">
              <div className="space-y-1">
                <Label htmlFor="sheet-title">{t("components.approvalPayload.fields.title")}</Label>
                <Input id="sheet-title" defaultValue={t("pages.uxLabs.designGuide.samples.sheetTitle")} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sheet-description">{t("pages.uxLabs.designGuide.descriptionLabel")}</Label>
                <Textarea id="sheet-description" defaultValue={t("pages.uxLabs.designGuide.samples.sheetDescription")} />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline">{t("common.cancel")}</Button>
              <Button>{t("common.save")}</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Section>

      {/* ============================================================ */}
      {/*  SCROLL AREA                                                  */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.scrollArea")}>
        <ScrollArea className="h-36 rounded-md border border-border">
          <div className="space-y-2 p-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-md border border-border p-2 text-sm">
                {t("pages.uxLabs.designGuide.heartbeatRunCompleted", { number: i + 1 })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Section>

      {/* ============================================================ */}
      {/*  COMMAND                                                      */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.command")}>
        <div className="rounded-md border border-border">
          <Command>
            <CommandInput placeholder={t("command.placeholder")} />
            <CommandList>
              <CommandEmpty>{t("command.noResults")}</CommandEmpty>
              <CommandGroup heading={t("command.pages")}>
                <CommandItem>
                  <LayoutDashboard className="h-4 w-4" />
                  {t("nav.dashboard")}
                </CommandItem>
                <CommandItem>
                  <CircleDot className="h-4 w-4" />
                  {t("nav.issues")}
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading={t("command.actions")}>
                <CommandItem>
                  <CommandIcon className="h-4 w-4" />
                  {t("pages.uxLabs.designGuide.openCommandPalette")}
                </CommandItem>
                <CommandItem>
                  <Plus className="h-4 w-4" />
                  {t("command.createIssue")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  BREADCRUMB                                                   */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.breadcrumb")}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("nav.projects")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("pages.uxLabs.designGuide.paperclipApp")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("pages.uxLabs.designGuide.issueList")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      {/* ============================================================ */}
      {/*  CARDS                                                        */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.cards")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.standardCard")}>
          <Card>
            <CardHeader>
              <CardTitle>{t("pages.uxLabs.designGuide.cardTitle")}</CardTitle>
              <CardDescription>{t("pages.uxLabs.designGuide.cardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t("pages.uxLabs.designGuide.cardContent")}</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">{t("pages.uxLabs.designGuide.actions.action")}</Button>
              <Button variant="outline" size="sm">{t("common.cancel")}</Button>
            </CardFooter>
          </Card>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.metricCards")}>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard icon={Bot} value={12} label={t("pages.uxLabs.designGuide.metrics.activeAgents")} description={t("pages.uxLabs.designGuide.metrics.plus3ThisWeek")} />
            <MetricCard icon={CircleDot} value={48} label={t("pages.uxLabs.designGuide.metrics.openIssues")} />
            <MetricCard icon={DollarSign} value="$1,234" label={t("pages.uxLabs.designGuide.metrics.monthlyCost")} description={t("pages.uxLabs.designGuide.metrics.underBudget")} />
            <MetricCard icon={Zap} value="99.9%" label={t("pages.uxLabs.designGuide.metrics.uptime")} />
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  TABS                                                         */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.tabs")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.defaultPillVariant")}>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("pages.uxLabs.designGuide.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="runs">{t("pages.uxLabs.designGuide.tabs.runs")}</TabsTrigger>
              <TabsTrigger value="config">{t("pages.uxLabs.designGuide.tabs.config")}</TabsTrigger>
              <TabsTrigger value="costs">{t("pages.uxLabs.designGuide.tabs.costs")}</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.overviewContent")}</p>
            </TabsContent>
            <TabsContent value="runs">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.runsContent")}</p>
            </TabsContent>
            <TabsContent value="config">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.configContent")}</p>
            </TabsContent>
            <TabsContent value="costs">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.costsContent")}</p>
            </TabsContent>
          </Tabs>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.lineVariant")}>
          <Tabs defaultValue="summary">
            <TabsList variant="line">
              <TabsTrigger value="summary">{t("pages.uxLabs.designGuide.tabs.summary")}</TabsTrigger>
              <TabsTrigger value="details">{t("common.details")}</TabsTrigger>
              <TabsTrigger value="comments">{t("pages.uxLabs.designGuide.tabs.comments")}</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.summaryContent")}</p>
            </TabsContent>
            <TabsContent value="details">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.detailsContent")}</p>
            </TabsContent>
            <TabsContent value="comments">
              <p className="text-sm text-muted-foreground py-4">{t("pages.uxLabs.designGuide.tabs.commentsContent")}</p>
            </TabsContent>
          </Tabs>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  ENTITY ROWS                                                  */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.entityRows")}>
        <div className="border border-border rounded-md">
          <EntityRow
            leading={
              <>
                <StatusIcon status="in_progress" />
                <PriorityIcon priority="high" />
              </>
            }
            identifier="PAP-001"
            title={t("pages.uxLabs.designGuide.entityRows.authFlow")}
            subtitle={t("pages.uxLabs.designGuide.entityRows.assignedToAgentAlpha", { defaultValue: "Responsible: Agent Alpha" })}
            trailing={<IssueStatusBadge status="in_progress" />}
            onClick={() => {}}
          />
          <EntityRow
            leading={
              <>
                <StatusIcon status="done" />
                <PriorityIcon priority="medium" />
              </>
            }
            identifier="PAP-002"
            title={t("pages.uxLabs.designGuide.entityRows.setupCi")}
            subtitle={t("pages.uxLabs.designGuide.entityRows.completed2DaysAgo")}
            trailing={<IssueStatusBadge status="done" />}
            onClick={() => {}}
          />
          <EntityRow
            leading={
              <>
                <StatusIcon status="todo" />
                <PriorityIcon priority="low" />
              </>
            }
            identifier="PAP-003"
            title={t("pages.uxLabs.designGuide.entityRows.writeApiDocs")}
            trailing={<IssueStatusBadge status="todo" />}
            onClick={() => {}}
          />
          <EntityRow
            leading={
              <>
                <StatusIcon status="blocked" />
                <PriorityIcon priority="critical" />
              </>
            }
            identifier="PAP-004"
            title={t("pages.uxLabs.designGuide.entityRows.deployProduction")}
            subtitle={t("pages.uxLabs.designGuide.entityRows.blockedByPap001")}
            trailing={<IssueStatusBadge status="blocked" />}
            selected
          />
        </div>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.membershipAction", { defaultValue: "Membership action" })}>
          <div className="border border-border rounded-md">
            <EntityRow
              title={t("pages.uxLabs.designGuide.membership.joinedResource", { defaultValue: "Joined resource" })}
              subtitle="Hover or focus the row to reveal the reserved action slot."
              className="group"
              trailing={
                <MembershipAction
                  state="joined"
                  resourceName={t("pages.uxLabs.designGuide.membership.joinedResource", { defaultValue: "Joined resource" })}
                  onJoin={() => {}}
                  onLeave={() => {}}
                />
              }
            />
            <EntityRow
              title={t("pages.uxLabs.designGuide.membership.leftResource", { defaultValue: "Left resource" })}
              subtitle="Persistent action with dimmed row content."
              className="group text-foreground/55"
              trailing={
                <MembershipAction
                  state="left"
                  resourceName={t("pages.uxLabs.designGuide.membership.leftResource", { defaultValue: "Left resource" })}
                  onJoin={() => {}}
                  onLeave={() => {}}
                />
              }
            />
            <EntityRow
              title={t("pages.uxLabs.designGuide.membership.leavingResource", { defaultValue: "Leaving resource" })}
              subtitle="Disabled while the optimistic mutation is pending."
              className="group text-foreground/55"
              trailing={
                <MembershipAction
                  state="left"
                  pending
                  pendingState="left"
                  resourceName={t("pages.uxLabs.designGuide.membership.leavingResource", { defaultValue: "Leaving resource" })}
                  onJoin={() => {}}
                  onLeave={() => {}}
                />
              }
            />
            <EntityRow
              title={t("pages.uxLabs.designGuide.membership.joiningResource", { defaultValue: "Joining resource" })}
              subtitle="The target state is visible immediately while the server confirms."
              className="group"
              trailing={
                <MembershipAction
                  state="joined"
                  pending
                  pendingState="joined"
                  resourceName={t("pages.uxLabs.designGuide.membership.joiningResource", { defaultValue: "Joining resource" })}
                  onJoin={() => {}}
                  onLeave={() => {}}
                />
              }
            />
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  FILTER BAR                                                   */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.filterBar")}>
        <FilterBar
          filters={filters}
          onRemove={(key) => setFilters((f) => f.filter((x) => x.key !== key))}
          onClear={() => setFilters([])}
        />
        {filters.length === 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters([
                { key: "status", label: t("common.status"), value: t("common.active") },
                { key: "priority", label: t("pages.uxLabs.designGuide.priority"), value: t("labels.priority.high") },
              ])
            }
          >
            {t("pages.uxLabs.designGuide.resetFilters")}
          </Button>
        )}
      </Section>

      {/* ============================================================ */}
      {/*  AVATARS                                                      */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.avatars")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.sizes")}>
          <div className="flex items-center gap-3">
            <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>DF</AvatarFallback></Avatar>
            <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.group")}>
          <AvatarGroup>
            <Avatar><AvatarFallback>A1</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>A2</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>A3</AvatarFallback></Avatar>
            <AvatarGroupCount>+5</AvatarGroupCount>
          </AvatarGroup>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  IDENTITY                                                     */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.identity")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.sizes")}>
          <div className="flex items-center gap-6">
            <Identity name="Agent Alpha" size="sm" />
            <Identity name="Agent Alpha" />
            <Identity name="Agent Alpha" size="lg" />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.initialsDerivation")}>
          <div className="flex flex-col gap-2">
            <Identity name="CEO Agent" size="sm" />
            <Identity name="Alpha" size="sm" />
            <Identity name="Quality Assurance Lead" size="sm" />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.customInitials")}>
          <Identity name="Backend Service" initials="BS" size="sm" />
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  TOOLTIPS                                                     */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.tooltips")}>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">{t("pages.uxLabs.designGuide.hoverMe")}</Button>
            </TooltipTrigger>
            <TooltipContent>{t("pages.uxLabs.designGuide.tooltipContent")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm"><Settings /></Button>
            </TooltipTrigger>
            <TooltipContent>{t("nav.settings")}</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  DIALOG                                                       */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.dialog")}>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">{t("pages.uxLabs.designGuide.openDialog")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("pages.uxLabs.designGuide.dialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("pages.uxLabs.designGuide.dialogDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("components.approvalPayload.fields.name")}</Label>
                <Input placeholder={t("pages.uxLabs.designGuide.placeholders.enterName")} className="mt-1.5" />
              </div>
              <div>
                <Label>{t("pages.uxLabs.designGuide.descriptionLabel")}</Label>
                <Textarea placeholder={t("pages.uxLabs.designGuide.placeholders.describe")} className="mt-1.5" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">{t("common.cancel")}</Button>
              <Button>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      {/* ============================================================ */}
      {/*  EMPTY STATE                                                  */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.emptyState")}>
        <div className="border border-border rounded-md">
          <EmptyState
            icon={Inbox}
            message={t("pages.uxLabs.designGuide.emptyStateMessage")}
            action={t("pages.uxLabs.designGuide.createItem")}
            onAction={() => {}}
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  PROGRESS BARS                                                */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.progressBars")}>
        <div className="space-y-3">
          {[
            { label: t("pages.uxLabs.designGuide.progress.underBudget"), pct: 40, color: "bg-green-400" },
            { label: t("pages.uxLabs.designGuide.progress.warning"), pct: 75, color: "bg-yellow-400" },
            { label: t("pages.uxLabs.designGuide.progress.overBudget"), pct: 95, color: "bg-red-400" },
          ].map(({ label, pct, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-mono">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-(--tp-width-background-color) duration-150 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  LOG VIEWER                                                   */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.logViewer")}>
        <div className="bg-neutral-950 rounded-lg p-3 font-mono text-xs max-h-80 overflow-y-auto">
          <div className="text-foreground">[12:00:01] INFO  Agent started successfully</div>
          <div className="text-foreground">[12:00:02] INFO  Processing task PAP-001</div>
          <div className="text-yellow-400">[12:00:05] WARN  Rate limit approaching (80%)</div>
          <div className="text-foreground">[12:00:08] INFO  Task PAP-001 completed</div>
          <div className="text-red-400">[12:00:12] ERROR Connection timeout to upstream service</div>
          <div className="text-blue-300">[12:00:12] SYS   Retrying connection in 5s...</div>
          <div className="text-foreground">[12:00:17] INFO  Reconnected successfully</div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 animate-pulse" />
              <span className="inline-flex h-full w-full rounded-full bg-blue-500" />
            </span>
            <span className="text-blue-600 dark:text-blue-400">{t("pages.uxLabs.designGuide.live")}</span>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  PROPERTY ROW PATTERN                                         */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.propertyRowPattern")}>
        <div className="border border-border rounded-md p-4 space-y-1 max-w-sm">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{t("common.status")}</span>
            <StatusBadge status="active" />
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{t("pages.uxLabs.designGuide.priority")}</span>
            <PriorityIcon priority="high" />
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{t("pages.uxLabs.designGuide.assignee", { defaultValue: "Responsible" })}</span>
            <div className="flex items-center gap-1.5">
              <Avatar size="sm"><AvatarFallback>A</AvatarFallback></Avatar>
              <span className="text-xs">Agent Alpha</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{t("pages.companyInvites.table.created")}</span>
            <span className="text-xs">Jan 15, 2025</span>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  NAVIGATION PATTERNS                                          */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.navigationPatterns")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.sidebarNavItems")}>
          <Card className="block w-60 p-3 space-y-0.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-accent text-accent-foreground">
              <LayoutDashboard className="h-4 w-4" />
              {t("nav.dashboard")}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground cursor-pointer">
              <CircleDot className="h-4 w-4" />
              {t("nav.issues")}
              <Badge variant="ghost" className="ml-auto bg-primary text-primary-foreground px-1.5">
                12
              </Badge>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground cursor-pointer">
              <Bot className="h-4 w-4" />
              {t("nav.agents")}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground cursor-pointer">
              <Hexagon className="h-4 w-4" />
              {t("nav.projects")}
            </div>
          </Card>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.viewToggle")}>
          <div className="flex items-center border border-border rounded-md w-fit">
            <button className="px-3 py-1.5 text-xs font-medium bg-accent text-foreground rounded-l-md">
              <ListTodo className="h-3.5 w-3.5 inline mr-1" />
              {t("pages.uxLabs.designGuide.viewList")}
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent/50 rounded-r-md">
              <Target className="h-3.5 w-3.5 inline mr-1" />
              {t("nav.org")}
            </button>
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  GROUPED LIST (Issues pattern)                                */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.groupedList")}>
        <div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-t-md">
            <StatusIcon status="in_progress" />
            <span className="text-sm font-medium">{t("labels.status.in_progress")}</span>
            <span className="text-xs text-muted-foreground ml-1">2</span>
          </div>
          <div className="border border-border rounded-b-md">
            <EntityRow
              leading={<PriorityIcon priority="high" />}
              identifier="PAP-101"
              title={t("pages.uxLabs.designGuide.entityRows.heartbeatSystem")}
              onClick={() => {}}
            />
            <EntityRow
              leading={<PriorityIcon priority="medium" />}
              identifier="PAP-102"
              title={t("pages.uxLabs.designGuide.entityRows.costDashboard")}
              onClick={() => {}}
            />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  COMMENT THREAD PATTERN                                       */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.commentThreadPattern")}>
        <div className="space-y-3 max-w-2xl">
          <h3 className="text-sm font-semibold">{t("pages.uxLabs.designGuide.commentsCount")}</h3>
          <div className="space-y-3">
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{t("pages.uxLabs.designGuide.agent")}</span>
                <span className="text-xs text-muted-foreground">Jan 15, 2025</span>
              </div>
              <p className="text-sm">{t("pages.uxLabs.designGuide.commentThread.agentComment")}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{t("pages.uxLabs.designGuide.human")}</span>
                <span className="text-xs text-muted-foreground">Jan 16, 2025</span>
              </div>
              <p className="text-sm">{t("pages.uxLabs.designGuide.commentThread.humanComment")}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Textarea placeholder={t("pages.uxLabs.designGuide.placeholders.leaveComment")} rows={3} />
            <Button size="sm">{t("pages.uxLabs.designGuide.comment")}</Button>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  COST TABLE PATTERN                                           */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.costTablePattern")}>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-accent/20">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("pages.uxLabs.designGuide.costTable.model")}</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("pages.uxLabs.designGuide.costTable.tokens")}</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("pages.uxLabs.designGuide.costTable.cost")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-3 py-2">claude-sonnet-4-20250514</td>
                <td className="px-3 py-2 font-mono">1.2M</td>
                <td className="px-3 py-2 font-mono">$18.00</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2">claude-haiku-4-20250506</td>
                <td className="px-3 py-2 font-mono">500k</td>
                <td className="px-3 py-2 font-mono">$1.25</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">{t("pages.uxLabs.designGuide.costTable.total")}</td>
                <td className="px-3 py-2 font-mono">1.7M</td>
                <td className="px-3 py-2 font-mono font-medium">$19.25</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SKELETONS                                                    */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.skeletons")}>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.individual")}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-20 w-full" />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.pageSkeletonList")}>
          <div className="border border-border rounded-md p-4">
            <PageSkeleton variant="list" />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.pageSkeletonDetail")}>
          <div className="border border-border rounded-md p-4">
            <PageSkeleton variant="detail" />
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  SEPARATOR                                                    */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.separator")}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("pages.uxLabs.designGuide.horizontal")}</p>
          <Separator />
          <div className="flex items-center gap-4 h-8">
            <span className="text-sm">{t("pages.uxLabs.designGuide.left")}</span>
            <Separator orientation="vertical" />
            <span className="text-sm">{t("pages.uxLabs.designGuide.right")}</span>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  ICON REFERENCE                                               */}
      {/* ============================================================ */}
      {/*  TEAM CATALOG                                                 */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.teamCatalog", { defaultValue: "Team Catalog" })}>
        <p className="text-sm text-muted-foreground">
          Components from the Team Catalog browse/install surface (<code className="font-mono text-xs">/teams-catalog</code>).
          Fixtures are shared with the Storybook stories.
        </p>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.teamRow", { defaultValue: "TeamRow (browse list)" })}>
          <div className="w-(--sz-28rem) rounded-md border border-border">
            <div className="px-3 py-2 text-(length:--text-micro) font-semibold uppercase tracking-wide text-muted-foreground">
              Bundled · 1
            </div>
            <TeamRow team={sampleTeam} selected onSelect={() => {}} />
            <div className="px-3 py-2 text-(length:--text-micro) font-semibold uppercase tracking-wide text-muted-foreground">
              Optional · 2
            </div>
            <TeamRow team={optionalTeam} selected={false} onSelect={() => {}} />
            <div className="px-3 py-2 text-(length:--text-micro) font-semibold uppercase tracking-wide text-muted-foreground">
              Installed · 2
            </div>
            <TeamRow team={sampleTeam} selected={false} onSelect={() => {}} installed={outOfDateInstalledState} />
            <TeamRow team={warnTeam} selected={false} onSelect={() => {}} installed={currentInstalledState} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Installed teams collapse under <code className="font-mono">INSTALLED · N</code>; an out-of-date
            install (server <code className="font-mono">originHash</code> ≠ catalog <code className="font-mono">contentHash</code>)
            shows the amber <code className="font-mono">↑</code> badge (PAP-10256).
          </p>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.teamCard", { defaultValue: "TeamCard (onboarding grid)" })}>
          <p className="text-xs text-muted-foreground">
            Square tile for the onboarding &ldquo;Pick a starter team&rdquo; grid. Selected tile gets{" "}
            <code className="font-mono">ring-2 ring-ring</code>. Drives the{" "}
            <code className="font-mono">useInstallTeamCatalogEntry</code> simplified flow.
          </p>
          <TeamCardShowcase />
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.teamHierarchyPreview", { defaultValue: "TeamHierarchyPreview" })}>
          <div className="max-w-md">
            <TeamHierarchyPreview team={sampleTeam} />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.requiredSkillsList", { defaultValue: "RequiredSkillsList" })}>
          <div className="max-w-xl">
            <RequiredSkillsList skills={sampleTeam.requiredSkills} />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.envInputsList", { defaultValue: "EnvInputsList" })}>
          <div className="max-w-xl">
            <EnvInputsList inputs={sampleTeam.envInputs} />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.externalSourcesList", { defaultValue: "ExternalSourcesList" })}>
          <div className="max-w-xl">
            <ExternalSourcesList sources={sampleTeam.sourceRefs} />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.sourcePolicyStep", { defaultValue: "Source policy step (StepSourcePolicy)" })}>
          <div className="max-w-xl rounded-md border border-border p-4">
            <StepSourcePolicy
              team={warnTeam}
              allowExternalSources={allowExternal}
              allowUnpinnedOptionalSources={allowUnpinned}
              allowLocalPathSources={allowLocalPath}
              onChange={(key, value) => {
                if (key === "external") setAllowExternal(value);
                if (key === "unpinned") setAllowUnpinned(value);
                if (key === "localPath") setAllowLocalPath(value);
              }}
            />
          </div>
        </SubSection>

        <SubSection title={t("pages.uxLabs.designGuide.subsections.skillPlanStep", { defaultValue: "Skill plan step (StepSkillPlan)" })}>
          <div className="max-w-xl rounded-md border border-border p-4">
            <StepSkillPlan team={sampleTeam} preparations={sampleSkillPreparations} />
          </div>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.commonIcons")}>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {[
            ["Inbox", Inbox],
            ["ListTodo", ListTodo],
            ["CircleDot", CircleDot],
            ["Hexagon", Hexagon],
            ["Target", Target],
            ["LayoutDashboard", LayoutDashboard],
            ["Bot", Bot],
            ["DollarSign", DollarSign],
            ["History", History],
            ["Search", Search],
            ["Plus", Plus],
            ["Trash2", Trash2],
            ["Settings", Settings],
            ["User", User],
            ["Mail", Mail],
            ["Upload", Upload],
            ["Zap", Zap],
          ].map(([name, Icon]) => {
            const LucideIcon = Icon as React.FC<{ className?: string }>;
            return (
              <div key={name as string} className="flex flex-col items-center gap-1.5 p-2">
                <LucideIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-(length:--text-nano) text-muted-foreground font-mono">{name as string}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  KEYBOARD SHORTCUTS                                           */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.keyboardShortcuts")}>
        <div className="border border-border rounded-md divide-y divide-border text-sm">
          {[
            ["Cmd+K / Ctrl+K", t("pages.uxLabs.designGuide.shortcuts.openCommandPalette")],
            ["C", t("pages.uxLabs.designGuide.shortcuts.newIssue")],
            ["[", t("pages.uxLabs.designGuide.shortcuts.toggleSidebar")],
            ["]", t("pages.uxLabs.designGuide.shortcuts.togglePropertiesPanel")],

            ["Cmd+Enter / Ctrl+Enter", t("pages.uxLabs.designGuide.shortcuts.submitMarkdownComment")],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between px-4 py-2">
              <span className="text-muted-foreground">{desc}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono bg-muted rounded border border-border">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("pages.uxLabs.designGuide.sections.issueOutputSurface", { defaultValue: "Issue Output Surface" })}>
        <SubSection title="Multiple outputs (primary video + 'Also produced')">
          <IssueOutputSection workProducts={DESIGN_GUIDE_OUTPUTS} />
        </SubSection>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.degradedOutput", { defaultValue: "Degraded output (invalid / failed attachment metadata)" })}>
          <IssueOutputSection workProducts={DESIGN_GUIDE_DEGRADED_OUTPUTS} />
        </SubSection>
        <SubSection title={t("pages.uxLabs.designGuide.subsections.emptyStateOutput", { defaultValue: "Empty state" })}>
          <p className="text-xs text-muted-foreground">
            When an issue has produced no artifact work products, the Output section renders nothing
            at all (no placeholder card).
          </p>
        </SubSection>
      </Section>

      {/* ============================================================ */}
      {/*  TOOLS & ACCESS (PAP-10389)                                   */}
      {/* ============================================================ */}
      <Section title="Tools & Access">
        <SubSection title="EnforcementBanner — default / denied-detected">
          <div className="space-y-3">
            <EnforcementBanner companyId="" forceVariant="default" recentDenialCount={0} />
            <EnforcementBanner companyId="" forceVariant="denied-detected" recentDenialCount={3} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Persistent at the top of the Tools &amp; Access surface. Tints to <code>denied-detected</code> when
            governed tool calls were denied or failed in the last hour. Observability only — enforcement lives
            in the tool gateway.
          </p>
        </SubSection>

        <SubSection title="EnforcementBanner — presentational tones (info / warning / error)">
          <div className="space-y-3">
            <EnforcementBanner
              tone="info"
              title="Effective access — server resolved."
              body="This is exactly what the tool gateway will accept. Profile and policy edits reflect within ~5s; the prompt cannot expand it."
            />
            <EnforcementBanner
              tone="warning"
              title="Local stdio is local code execution, not a security sandbox."
              body="A local-stdio slot runs with the orchestrator's privileges. Only bind trusted commands; quarantine anything you would not run yourself."
            />
            <EnforcementBanner
              tone="error"
              title="Runtime failed closed."
              body="The supervisor is restarting (attempt 2/3). The gateway returns runtime-error and the agent does not see partial output."
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Static governance copy with a tone. Used for the PAP-10400 trust-tier banner on Runtime and the
            effective-access banner on Agent → Tools. Pass <code>title</code>/<code>body</code> and an optional{" "}
            <code>icon</code>.
          </p>
        </SubSection>

        <SubSection title="Action approval card — pending / stale (surfaces 11/12)">
          <div className="grid gap-4 lg:grid-cols-2">
            <ActionCard
              toolName="slack.post_message"
              risk="medium"
              isWrite
              binding={{
                application: "Slack",
                manifestVersion: "2.4.1",
                connection: "https://slack.com/api · acme-workspace",
                catalogSha256: "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                payloadSha256: "sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
              }}
              input={{ channel: "#launch", text: "Deploy v2 is live 🎉", unfurl_links: false }}
              reason="This tool can write to your workspace, so a human signs off before the agent posts."
              policyNumber={7}
              expiresInLabel="expires in 23h 51m"
            />
            <ActionCard
              variant="stale"
              toolName="slack.post_message"
              risk="medium"
              isWrite
              binding={{
                application: "Slack",
                manifestVersion: "2.4.1",
                connection: "https://slack.com/api · acme-workspace",
                catalogSha256: "sha256:7d793037a0760186574b0282f2f435e7a4b1b2b0b822cd15d6c15b0f00a0e3f1",
                previousCatalogSha256: "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                payloadSha256: "sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
              }}
              input={{ channel: "#launch", text: "Deploy v2 is live 🎉", unfurl_links: false }}
              reason="This tool can write to your workspace, so a human signs off before the agent posts."
              policyNumber={7}
              expiresInLabel="expires in 18h 02m"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Signed payload sha256 + expiry surface on every variant (PAP-10400). The{" "}
            <code>stale</code> variant tints the border amber, banners the catalog-hash mismatch, strikes through
            the previous hash next to the current one, and renders <code>Approve</code> disabled until the request
            is re-issued.
          </p>
        </SubSection>

        <SubSection title="Action approval card — mobile (390×844, surface 99)">
          <div className="w-(--sz-390px) max-w-full rounded-xl border border-border bg-background p-3">
            <ActionCardMobile
              toolName="slack.post_message"
              risk="medium"
              isWrite
              binding={{
                application: "Slack",
                manifestVersion: "2.4.1",
                connection: "https://slack.com/api · acme-workspace",
                catalogSha256: "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                payloadSha256: "sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
              }}
              input={{ channel: "#launch", text: "Deploy v2 is live 🎉" }}
              reason="This tool can write to your workspace, so a human signs off before the agent posts."
              policyNumber={7}
              expiresInLabel="expires in 23h 51m"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Identical content; the three buttons stack full-width in the order Approve / Deny / Edit &amp; re-sign,
            and the bindings table uses a 70px label column.
          </p>
        </SubSection>

        <SubSection title="BindingsTable (reused in the audit row drilldown)">
          <BindingsTable
            rows={[
              { label: "Application", value: "Slack · manifest v2.4.1" },
              { label: "Connection", value: "https://slack.com/api · acme-workspace", mono: true },
              { label: "Catalog", value: "sha256:9f86d081…f00a08", mono: true },
              { label: "Payload", value: "sha256:2c26b46b…66e7ae", mono: true },
            ]}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Two-column key/value block with mono values. Lives inside <code>ActionCard</code> and is reused
            standalone in the audit row drilldown.
          </p>
        </SubSection>

        <SubSection title="Tool-access status keys (StatusBadge)">
          <div className="flex flex-wrap items-center gap-2">
            {[
              "allowed", "denied", "block", "require-approval", "redacted", "rate-limit",
              "deferred", "hidden", "quarantined", "healthy", "degraded", "runtime-error", "unchecked",
            ].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Policy decisions, connection/runtime health, and catalog quarantine all route through the canonical{" "}
            <code>StatusBadge</code> keys defined in <code>lib/status-colors</code>.
          </p>
        </SubSection>

        <SubSection title="EmptyState (canonical, with description + action)">
          <EmptyState
            icon={Inbox}
            message="No connections yet"
            description="Add a connection to an application to configure credentials and discover its tools."
            action="New connection"
            onAction={() => {}}
          />
        </SubSection>
      </Section>

      <Section title={t("pages.uxLabs.designGuide.sections.environmentVariablesEditor", { defaultValue: "Environment Variables Editor" })}>
        <p className="text-sm text-muted-foreground">
          Reusable env-var editor (agents, projects, environments, routines). One shared grid, an
          in-field Text/Secret source switch, a fuzzy secret picker with a pinned “Create secret”
          item, automatic sensitive-value detection, and inline secret-health warnings. See the
          Storybook <span className="font-mono">Product/Environment Variables Editor</span> stories
          for all 10 states.
        </p>
        <EnvironmentVariablesEditorShowcase />
      </Section>

      <Section title={t("pages.uxLabs.designGuide.sections.resizablePanels", { defaultValue: "Resizable Panels" })}>
        <p className="text-sm text-muted-foreground">
          Design-system wrapper over <span className="font-mono">react-resizable-panels</span>{" "}
          (Skill Studio D2). Drag a handle to resize; panels accept percentage or pixel
          (<span className="font-mono">minSize="240px"</span>) constraints and the middle panel is
          collapsible. Use anywhere a split view is needed.
        </p>
        <div className="h-48 max-w-2xl overflow-hidden rounded-md border border-border">
          <ResizablePanelGroup>
            <ResizablePanel id="a" minSize="120px" className="bg-muted/30">
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                {t("pages.uxLabs.designGuide.panels.panelA", { defaultValue: "Panel A" })}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="b" minSize="120px" collapsible collapsedSize="40px" className="bg-muted/10">
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                {t("pages.uxLabs.designGuide.panels.panelB", { defaultValue: "Panel B (collapsible)" })}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="c" minSize="120px" className="bg-muted/30">
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                {t("pages.uxLabs.designGuide.panels.panelC", { defaultValue: "Panel C" })}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  INLINE BANNER + BUILT-IN AGENTS                              */}
      {/* ============================================================ */}
      <Section title={t("pages.uxLabs.designGuide.sections.inlineBanner", { defaultValue: "Inline Banner" })}>
        <p className="text-sm text-muted-foreground">
          Token-backed full-width notice (<span className="font-mono">brandBanner</span> tones). Use{" "}
          <span className="font-mono">info</span> for provenance/context and{" "}
          <span className="font-mono">warning</span> for paused/attention. Supports an optional bold
          title and a trailing actions slot. Replaces hand-rolled{" "}
          <span className="font-mono">bg-yellow-*</span>/<span className="font-mono">bg-blue-*</span>{" "}
          banners.
        </p>
        <div className="space-y-3">
          <InlineBanner
            tone="info"
            title={t("pages.uxLabs.designGuide.banner.builtInAgentTitle", { defaultValue: "Built-in agent" })}
            actions={<Button variant="outline" size="sm">{t("pages.uxLabs.designGuide.banner.resetToDefaults", { defaultValue: "Reset to defaults" })}</Button>}
          >
            {t("pages.uxLabs.designGuide.banner.builtInAgentBodyBefore", { defaultValue: "Ships with Paperclip and powers " })}
            <strong>Briefs</strong>
            {t("pages.uxLabs.designGuide.banner.builtInAgentBodyAfter", { defaultValue: ". It can be paused but not deleted." })}
          </InlineBanner>
          <InlineBanner
            tone="warning"
            title={t("pages.uxLabs.designGuide.banner.briefsPausedTitle", { defaultValue: "Briefs is paused." })}
            actions={
              <>
                <Button variant="ghost" size="sm">{t("pages.uxLabs.designGuide.banner.viewAgent", { defaultValue: "View agent" })}</Button>
                <Button size="sm">{t("pages.uxLabs.designGuide.banner.resumeAgent", { defaultValue: "Resume agent" })}</Button>
              </>
            }
          >
            {t("pages.uxLabs.designGuide.banner.briefsPausedBody", { defaultValue: "Its built-in agent was paused 2 days ago, so new briefs aren't being generated." })}
          </InlineBanner>
          <InlineBanner tone="info" compact>
            {t("pages.uxLabs.designGuide.banner.compactVariant", { defaultValue: "Compact variant for embedding inside dialogs and modals." })}
          </InlineBanner>
        </div>
      </Section>

      <Section title={t("pages.uxLabs.designGuide.sections.builtInAgentBadges", { defaultValue: "Built-in Agent Badges" })}>
        <p className="text-sm text-muted-foreground">
          Provenance badge (constant, blue) plus a derived lifecycle chip (amber) for attention
          states. The lifecycle chip is separate from the agent status vocabulary and only shows for{" "}
          <span className="font-mono">needs_setup</span> / <span className="font-mono">pending_approval</span>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <BuiltInAgentBadge />
            <BuiltInLifecycleChip status="needs_setup" />
          </div>
          <div className="flex items-center gap-1.5">
            <BuiltInAgentBadge />
            <BuiltInLifecycleChip status="pending_approval" />
          </div>
          <div className="flex items-center gap-1.5">
            <BuiltInAgentBadge compact />
            <BuiltInLifecycleChip status="needs_setup" compact />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-mono">&lt;BuiltInAgentGate agentKey&gt;</span> composes{" "}
          <span className="font-mono">PageSkeleton</span> + <span className="font-mono">EmptyState</span>{" "}
          + <span className="font-mono">InlineBanner</span> to render the loading / setup /
          pending-approval / paused / ready states of a feature that depends on a built-in agent.
        </p>
      </Section>
    </div>
  );
}
