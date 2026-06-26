#!/usr/bin/env bun

import { createTextUdfBuffer, inspectUdf, validateUdf } from "./index";

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
  const [inputPath] = args;
  if (!inputPath) {
    usage(1);
  }

  const buffer = new Uint8Array(await Bun.file(inputPath).arrayBuffer());
  console.log(JSON.stringify(inspectUdf(buffer), null, 2));
} else if (command === "validate") {
  const [inputPath] = args;
  if (!inputPath) {
    usage(1);
  }

  const buffer = new Uint8Array(await Bun.file(inputPath).arrayBuffer());
  const validation = validateUdf(buffer);
  console.log(JSON.stringify(validation, null, 2));
  process.exit(validation.valid ? 0 : 1);
} else {
  usage(command ? 1 : 0);
}

function usage(exitCode: number): never {
  console.log(`Kullanim:
  uyap-udf from-text <girdi.txt> <cikti.udf>
  uyap-udf inspect <dosya.udf>
  uyap-udf validate <dosya.udf>`);
  process.exit(exitCode);
}
