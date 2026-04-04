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

function getYamlBlock(lines: string[], key: string): string[] | null {
  const start = lines.findIndex((line) => line.match(new RegExp(`^${key}:\\s*$`)));
  if (start === -1) return null;

  const block: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[A-Za-z0-9_]+:\s*/.test(line)) break;
    block.push(line);
  }
  return block;
}

function main() {
  const filePath = resolve(
    process.cwd(),
    "contracts/legacy/contact-for-alfa-laval-centrifuges.yml",
  );
  const errors: string[] = [];

  if (!existsSync(filePath)) {
    console.error("Contact contract validation failed:");
    console.error(`- Missing file: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const keys = getTopLevelKeys(lines);

  const requiredKeys = [
    "title_legacy",
    "h1_legacy",
    "required_headings",
    "required_form_field_groups",
    "required_contact_actions",
    "required_images_alt_text",
    "schema_expectations",
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

  const formFieldGroupsBlock = getYamlBlock(lines, "required_form_field_groups");
  const hasFormFieldGroup =
    !!formFieldGroupsBlock &&
    formFieldGroupsBlock.some((line) => /^\s*-\s+[^-].*$/.test(line.trimEnd()));
  if (!hasFormFieldGroup) {
    errors.push("required_form_field_groups must be a non-empty list");
  }

  const contactActionsBlock = getYamlBlock(lines, "required_contact_actions");
  if (!contactActionsBlock) {
    errors.push("required_contact_actions must exist");
  } else {
    const actionTypes = new Set<string>();
    for (const line of contactActionsBlock) {
      const typeMatch = line.match(/^\s*-\s*type:\s*(.+)\s*$/);
      if (typeMatch) {
        actionTypes.add(stripQuotes(typeMatch[1]));
      }
    }

    for (const actionType of ["phone", "email", "maps"]) {
      if (!actionTypes.has(actionType)) {
        errors.push(`required_contact_actions must include type: ${actionType}`);
      }
    }
  }

  if (!keys.has("required_images_alt_text")) {
    errors.push("required_images_alt_text must exist (can be empty)");
  }

  const schemaExpectations = getYamlList(lines, "schema_expectations");
  if (!schemaExpectations || schemaExpectations.length === 0) {
    errors.push("schema_expectations must be a non-empty list");
  }

  if (errors.length > 0) {
    console.error("Contact contract validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Contact contract validation passed: ${requiredHeadings?.length ?? 0} required headings, ${schemaExpectations?.length ?? 0} schema expectations.`,
  );
}

main();
