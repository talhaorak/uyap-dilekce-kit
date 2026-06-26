import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectUdf } from "@uyap-dilekce-kit/uyap-udf";

describe("uyap-dilekce CLI", () => {
  test("trafik cezasi itiraz ciktilarini yazar", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "uyap-dilekce-cli-"));
    const cliPath = new URL("../src/index.ts", import.meta.url).pathname;
    const factsPath = new URL("../../../examples/trafik-cezasi-facts.json", import.meta.url).pathname;
    const narrativePath = new URL("../../../examples/trafik-cezasi-olay.md", import.meta.url).pathname;

    const proc = Bun.spawn(
      [
        process.execPath,
        "run",
        cliPath,
        "trafik-cezasi-itiraz",
        "--facts",
        factsPath,
        "--narrative",
        narrativePath,
        "--out",
        outDir,
        "--udf",
      ],
      { stderr: "pipe", stdout: "pipe" },
    );

    const exitCode = await proc.exited;
    const stderr = await new Response(proc.stderr).text();

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);

    const petition = await readFile(join(outDir, "petition.md"), "utf8");
    const checklist = await readFile(join(outDir, "checklist.md"), "utf8");
    const udf = await readFile(join(outDir, "petition.udf"));

    expect(petition).toContain("ISTANBUL NOBETCI SULH CEZA HAKIMLIGI'NE");
    expect(petition).toContain("Radar veya EDS kaydinin");
    expect(checklist).toContain("# Kontrol Listesi");
    expect(udf.byteLength).toBeGreaterThan(100);

    const inspection = inspectUdf(new Uint8Array(udf));
    expect(inspection.contentXml).toContain("ISTANBUL NOBETCI SULH CEZA HAKIMLIGI'NE");
    expect(inspection.contentXml).toContain("BASVURAN: Ali Veli");
    expect(inspection.contentXml).not.toContain("# ISTANBUL");
  });
});
