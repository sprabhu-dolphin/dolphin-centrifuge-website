import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type YamlValue = string | null;
type YamlEntry = Record<string, YamlValue>;

function parseInlineValue(raw: string): YamlValue {
  const value = raw.trim();
  if (value === "null") return null;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseYamlList(filePath: string, listKey: string): YamlEntry[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const entries: YamlEntry[] = [];
  let inTargetList = false;
  let current: YamlEntry | null = null;

  const flushCurrent = () => {
    if (current && Object.keys(current).length > 0) {
      entries.push(current);
    }
    current = null;
  };

  for (const line of lines) {
    if (!inTargetList) {
      if (line.trim() === `${listKey}:`) {
        inTargetList = true;
      }
      continue;
    }

    if (!line.trim()) continue;
    if (/^[^\s#]/.test(line)) break;

    const itemMatch = line.match(/^\s*-\s+([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (itemMatch) {
      flushCurrent();
      current = {};
      current[itemMatch[1]] = parseInlineValue(itemMatch[2]);
      continue;
    }

    const fieldMatch = line.match(/^\s+([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (fieldMatch && current) {
      current[fieldMatch[1]] = parseInlineValue(fieldMatch[2]);
    }
  }

  flushCurrent();
  return entries;
}

function requireField(
  entry: YamlEntry,
  key: string,
  kind: string,
  index: number,
  errors: string[],
) {
  const value = entry[key];
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${kind}[${index}] is missing required field "${key}"`);
  }
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function main() {
  const redirectsPath = resolve(process.cwd(), "decisions/redirects.yml");
  const pageStatusPath = resolve(process.cwd(), "decisions/page-status.yml");
  const errors: string[] = [];

  let redirects: YamlEntry[] = [];
  let pages: YamlEntry[] = [];

  try {
    redirects = parseYamlList(redirectsPath, "redirects");
  } catch (error) {
    errors.push(`Failed reading redirects file: ${(error as Error).message}`);
  }

  try {
    pages = parseYamlList(pageStatusPath, "pages");
  } catch (error) {
    errors.push(`Failed reading page-status file: ${(error as Error).message}`);
  }

  redirects.forEach((entry, index) => {
    requireField(entry, "from", "redirects", index, errors);
    requireField(entry, "type", "redirects", index, errors);
    requireField(entry, "note", "redirects", index, errors);
  });

  pages.forEach((entry, index) => {
    requireField(entry, "url", "pages", index, errors);
    requireField(entry, "status", "pages", index, errors);
    requireField(entry, "note", "pages", index, errors);
  });

  const duplicateFrom = findDuplicates(
    redirects
      .map((entry) => entry.from)
      .filter((value): value is string => typeof value === "string" && value !== ""),
  );
  if (duplicateFrom.length > 0) {
    errors.push(`Duplicate redirects.from values: ${duplicateFrom.join(", ")}`);
  }

  const duplicateUrls = findDuplicates(
    pages
      .map((entry) => entry.url)
      .filter((value): value is string => typeof value === "string" && value !== ""),
  );
  if (duplicateUrls.length > 0) {
    errors.push(`Duplicate pages.url values: ${duplicateUrls.join(", ")}`);
  }

  if (errors.length > 0) {
    console.error("Decision validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Decision validation passed: ${redirects.length} redirects, ${pages.length} pages.`,
  );
}

main();
