import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const configSchema = z.object({
  openai: z
    .object({
      model: z.string().optional(),
    })
    .optional(),
  gitlab: z
    .object({
      enabled: z.boolean().optional(),
    })
    .optional(),
});

export type GhWeeklyConfig = z.infer<typeof configSchema>;

const defaultConfig: GhWeeklyConfig = {};

export function configPath(): string {
  return join(homedir(), ".config", "gh-weekly", "config.yaml");
}

export async function loadConfig(): Promise<GhWeeklyConfig> {
  const path = configPath();
  try {
    const raw = await readFile(path, "utf8");
    const parsed = parseYaml(raw);
    return configSchema.parse(parsed ?? {});
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return defaultConfig;
    }
    throw error;
  }
}

export function resolveOpenAiModel(config: GhWeeklyConfig): string {
  return config.openai?.model ?? "gpt-4o-mini";
}
