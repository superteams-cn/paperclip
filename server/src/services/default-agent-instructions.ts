import fs from "node:fs/promises";

const DEFAULT_AGENT_BUNDLE_FILES = {
  default: ["AGENTS.md"],
  ceo: ["AGENTS.md", "HEARTBEAT.md", "SOUL.md", "TOOLS.md"],
} as const;

type DefaultAgentBundleRole = keyof typeof DEFAULT_AGENT_BUNDLE_FILES;
type DefaultAgentBundleLocale = "en" | "zh-CN";

function resolveDefaultAgentBundleUrl(role: DefaultAgentBundleRole, fileName: string, locale: DefaultAgentBundleLocale = "en") {
  return new URL(`../onboarding-assets/${locale}/${role}/${fileName}`, import.meta.url);
}

export async function loadDefaultAgentInstructionsBundle(
  role: DefaultAgentBundleRole,
  locale: DefaultAgentBundleLocale = "en",
): Promise<Record<string, string>> {
  const fileNames = DEFAULT_AGENT_BUNDLE_FILES[role];
  const entries = await Promise.all(
    fileNames.map(async (fileName) => {
      const content = await fs.readFile(resolveDefaultAgentBundleUrl(role, fileName, locale), "utf8");
      return [fileName, content] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export function resolveDefaultAgentInstructionsBundleRole(role: string): DefaultAgentBundleRole {
  return role === "ceo" ? "ceo" : "default";
}
