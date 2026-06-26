#!/usr/bin/env bun

import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { renderPetitionMarkdown, type ChecklistItem } from "@uyap-dilekce-kit/dilekce-core";
import {
  assertTrafficFineFacts,
  buildTrafficFineChecklist,
  buildTrafficFinePetition,
} from "@uyap-dilekce-kit/trafik-cezasi-itiraz";
import { createTextUdfBuffer } from "@uyap-dilekce-kit/uyap-udf";

const [, , command, ...args] = Bun.argv;

if (command === "trafik-cezasi-itiraz") {
  await runTrafficFineObjection(args);
} else {
  usage(command ? 1 : 0);
}

async function runTrafficFineObjection(args: string[]): Promise<void> {
  const options = parseArgs(args);
  const factsPath = getRequiredOption(options, "facts");
  const narrativePath = getRequiredOption(options, "narrative");
  const outDir = options.out ?? "dist/trafik-cezasi-itiraz";
  const shouldWriteUdf = options.udf === "true";

  const factsJson = JSON.parse(await Bun.file(factsPath).text()) as unknown;
  assertTrafficFineFacts(factsJson);

  const narrative = await Bun.file(narrativePath).text();
  const petition = buildTrafficFinePetition(factsJson, { narrative });
  const checklist = buildTrafficFineChecklist({ ...factsJson, narrative });
  const petitionMarkdown = renderPetitionMarkdown(petition);
  const checklistMarkdown = renderChecklistMarkdown(checklist);

  await mkdir(outDir, { recursive: true });
  await Bun.write(join(outDir, "petition.md"), petitionMarkdown);
  await Bun.write(join(outDir, "checklist.md"), checklistMarkdown);

  const written = [join(outDir, "petition.md"), join(outDir, "checklist.md")];

  if (shouldWriteUdf) {
    try {
      const udf = createTextUdfBuffer(petitionMarkdown);
      await Bun.write(join(outDir, "petition.udf"), udf);
      written.push(join(outDir, "petition.udf"));
    } catch (error) {
      console.warn(`UDF yazilamadi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Ciktilar yazildi:\n${written.map((path) => `- ${path}`).join("\n")}`);
}

function renderChecklistMarkdown(items: ChecklistItem[]): string {
  const statusLabels: Record<ChecklistItem["status"], string> = {
    required: "zorunlu",
    recommended: "onerilen",
    verify: "kontrol",
  };

  return ["# Kontrol Listesi", ...items.map((item) => `- [ ] ${statusLabels[item.status]}: ${item.label}`)].join("\n");
}

function parseArgs(args: string[]): Record<string, string> {
  const options: Record<string, string> = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--udf") {
      options.udf = "true";
      continue;
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Bilinmeyen arguman: ${arg}`);
    }

    const key = arg.slice(2);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Eksik deger: --${key}`);
    }

    options[key] = value;
    index += 1;
  }

  return options;
}

function getRequiredOption(options: Record<string, string>, key: string): string {
  const value = options[key];
  if (!value) {
    usage(1);
  }

  return value;
}

function usage(exitCode: number): never {
  console.log(`Kullanim:
  uyap-dilekce trafik-cezasi-itiraz --facts <facts.json> --narrative <olay.md> --out <cikti-klasoru> [--udf]

Ornek:
  bun run trafik-cezasi-itiraz --facts examples/trafik-cezasi-facts.json --narrative examples/trafik-cezasi-olay.md --out /tmp/trafik-demo --udf`);
  process.exit(exitCode);
}
