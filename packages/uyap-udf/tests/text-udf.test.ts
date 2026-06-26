import { describe, expect, test } from "bun:test";
import { buildContentXml, countCharacters, createTextUdfBuffer, inspectUdf } from "../src/index";

describe("text UDF POC", () => {
  test("Turkce karakterleri karakter sayisi olarak hesaplar", () => {
    expect(countCharacters("Dünya")).toBe(5);
    expect(countCharacters("İtiraz")).toBe(6);
  });

  test("content.xml offset ve length alanlarini metin havuzuna gore uretir", () => {
    const xml = buildContentXml("Merhaba\nDünya");

    expect(xml).toContain('<template format_id="1.8">');
    expect(xml).toContain('startOffset="0" length="7"');
    expect(xml).toContain('startOffset="8" length="5"');
    expect(xml).toContain("<![CDATA[Merhaba\nDünya]]>");
  });

  test("UDF arsivinde content.xml kokte yer alir", () => {
    const udf = createTextUdfBuffer("Merhaba UYAP");
    const inspection = inspectUdf(udf);

    expect(inspection.entries).toEqual(["content.xml"]);
    expect(inspection.hasContentXml).toBe(true);
    expect(inspection.formatId).toBe("1.8");
    expect(inspection.contentXml).toContain("Merhaba UYAP");
  });
});
