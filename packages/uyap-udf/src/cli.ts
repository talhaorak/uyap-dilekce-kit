#!/usr/bin/env bun

import { createTextUdfBuffer, formatInspection, inspectUdf, validateUdf } from "./index";

const [, , command, ...args] = Bun.argv;

if (command === "from-text") {
  const [inputPath, outputPath] = args;
  if (!inputPath || !outputPath) {
    usage(1);
  }

  const text = await Bun.file(inputPath).text();
  const udf = createTextUdfBuffer(text);
  await Bun.write(outputPath, udf);
  console.log(`UDF yazildi: ${outputPath}`);
} else if (command === "inspect") {
  const { flags, positional } = parseArgs(args);
  const [inputPath] = positional;
  if (!inputPath) {
    usage(1);
  }

  const buffer = new Uint8Array(await Bun.file(inputPath).arrayBuffer());
  console.log(JSON.stringify(formatInspection(inspectUdf(buffer), { showXml: flags.has("--show-xml") }), null, 2));
} else if (command === "validate") {
  const { flags, positional } = parseArgs(args);
  const [inputPath] = positional;
  if (!inputPath) {
    usage(1);
  }

  const buffer = new Uint8Array(await Bun.file(inputPath).arrayBuffer());
  const validation = validateUdf(buffer);
  console.log(
    JSON.stringify(
      { ...validation, inspection: formatInspection(validation.inspection, { showXml: flags.has("--show-xml") }) },
      null,
      2,
    ),
  );
  process.exit(validation.valid ? 0 : 1);
} else {
  usage(command ? 1 : 0);
}

function parseArgs(args: string[]): { flags: Set<string>; positional: string[] } {
  const flags = new Set(args.filter((arg) => arg.startsWith("--")));
  const positional = args.filter((arg) => !arg.startsWith("--"));
  return { flags, positional };
}

function usage(exitCode: number): never {
  console.log(`Kullanim:
  uyap-udf from-text <girdi.txt> <cikti.udf>
  uyap-udf inspect [--show-xml] <dosya.udf>
  uyap-udf validate [--show-xml] <dosya.udf>`);
  process.exit(exitCode);
}
