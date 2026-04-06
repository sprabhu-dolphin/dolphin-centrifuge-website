import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getTopLevelKeys(lines: string[]): Map<string, string> {
  const keys = new Map<string, string>();
  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (match) {
      keys.set(match[1], match[2]);
    }
  }
  return keys;
}

function getYamlList(lines: string[], key: string): string[] | null {
  const start = lines.findIndex((line) => line.match(new RegExp(`^${key}:\\s*$`)));
  if (start === -1) return null;

  const items: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (/^[A-Za-z0-9_]+:\s*/.test(line)) break;

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch) {
      items.push(stripQuotes(listMatch[1]));
    }
  }

  return items;
}

function main() {
  const filePath = resolve(process.cwd(), "contracts/legacy/homepage.sample.yml");
  const errors: string[] = [];

  if (!existsSync(filePath)) {
    console.error("Homepage contract validation failed:");
    console.error(`- Missing file: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const keys = getTopLevelKeys(lines);

  const requiredKeys = [
    "url",
    "page_type",
    "traffic_tier",
    "status",
    "title_legacy",
    "h1_legacy",
    "required_headings",
    "required_internal_links",
    "approved_deltas",
    "notes",
  ];

  for (const key of requiredKeys) {
    if (!keys.has(key)) {
      errors.push(`Missing required key: ${key}`);
    }
  }

  const titleLegacy = keys.get("title_legacy");
  if (!titleLegacy || stripQuotes(titleLegacy) === "") {
    errors.push("title_legacy must be a non-empty string");
  }

  const h1Legacy = keys.get("h1_legacy");
  if (!h1Legacy || stripQuotes(h1Legacy) === "") {
    errors.push("h1_legacy must be a non-empty string");
  }

  const requiredHeadings = getYamlList(lines, "required_headings");
  if (!requiredHeadings || requiredHeadings.length === 0) {
    errors.push("required_headings must be a non-empty list");
  }

  if (errors.length > 0) {
    console.error("Homepage contract validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Homepage contract validation passed: ${requiredHeadings.length} required headings.`,
  );
}

main();
