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
import { t, useTranslation } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { StatusBadge } from "@/components/StatusBadge";
import { StatusIcon } from "@/components/StatusIcon";
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
                "command", "dialog", "dropdown-menu", "input", "label", "popover", "scroll-area",
                "select", "separator", "sheet", "skeleton", "tabs", "textarea", "tooltip",
              ].map((name) => (
                <Badge key={name} variant="outline" className="font-mono text-[10px]">
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
                "PropertiesPanel", "Sidebar", "CommandPalette",
              ].map((name) => (
                <Badge key={name} variant="ghost" className="font-mono text-[10px]">
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
              <span key={label} className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
                {label}
              </span>
            ))}
          </div>
        </SubSection>

        <SubSection title="IssueReferencePill">
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
            subtitle={t("pages.uxLabs.designGuide.entityRows.assignedToAgentAlpha")}
            trailing={<StatusBadge status="in_progress" />}
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
            trailing={<StatusBadge status="done" />}
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
            trailing={<StatusBadge status="todo" />}
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
            trailing={<StatusBadge status="blocked" />}
            selected
          />
        </div>
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
                  className={`h-full rounded-full transition-[width,background-color] duration-150 ${color}`}
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
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 animate-pulse" />
              <span className="inline-flex h-full w-full rounded-full bg-cyan-400" />
            </span>
            <span className="text-cyan-400">{t("pages.uxLabs.designGuide.live")}</span>
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
            <span className="text-xs text-muted-foreground">{t("pages.uxLabs.designGuide.assignee")}</span>
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
          <div className="w-60 border border-border rounded-md p-3 space-y-0.5 bg-card">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-accent text-accent-foreground">
              <LayoutDashboard className="h-4 w-4" />
              {t("nav.dashboard")}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground cursor-pointer">
              <CircleDot className="h-4 w-4" />
              {t("nav.issues")}
              <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                12
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground cursor-pointer">
              <Bot className="h-4 w-4" />
              {t("nav.agents")}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground cursor-pointer">
              <Hexagon className="h-4 w-4" />
              {t("nav.projects")}
            </div>
          </div>
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
                <span className="text-[10px] text-muted-foreground font-mono">{name as string}</span>
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
    </div>
  );
}
