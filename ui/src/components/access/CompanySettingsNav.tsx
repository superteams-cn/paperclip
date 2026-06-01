import { PageTabBar } from "@/components/PageTabBar";
import { Tabs } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "@/lib/router";
import { useTranslation } from "@/i18n";

const items = [
  { value: "general", labelKey: "nav.general", fallback: "General", href: "/company/settings" },
  { value: "environments", labelKey: "nav.environments", fallback: "Environments", href: "/company/settings/environments" },
  { value: "cloud-upstream", labelKey: "nav.cloudUpstream", fallback: "Cloud upstream", href: "/company/settings/cloud-upstream" },
  { value: "members", labelKey: "nav.members", fallback: "Members", href: "/company/settings/members" },
  { value: "invites", labelKey: "nav.invites", fallback: "Invites", href: "/company/settings/invites" },
  { value: "secrets", labelKey: "nav.secrets", fallback: "Secrets", href: "/company/settings/secrets" },
] as const;

type CompanySettingsTab = (typeof items)[number]["value"];

export function getCompanySettingsTab(pathname: string): CompanySettingsTab {
  if (pathname.includes("/company/settings/environments")) {
    return "environments";
  }

  if (pathname.includes("/company/settings/cloud-upstream")) {
    return "cloud-upstream";
  }

  if (pathname.includes("/company/settings/members") || pathname.includes("/company/settings/access")) {
    return "members";
  }

  if (pathname.includes("/company/settings/invites")) {
    return "invites";
  }

  if (pathname.includes("/company/settings/secrets")) {
    return "secrets";
  }

  return "general";
}

export function CompanySettingsNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = getCompanySettingsTab(location.pathname);

  function handleTabChange(value: string) {
    const nextTab = items.find((item) => item.value === value);
    if (!nextTab || nextTab.value === activeTab) return;
    navigate(nextTab.href);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <PageTabBar
        items={items.map(({ value, labelKey, fallback }) => ({
          value,
          label: t(labelKey, { defaultValue: fallback }),
        }))}
        value={activeTab}
        onValueChange={handleTabChange}
        align="start"
      />
    </Tabs>
  );
}
