import { describe, expect, test } from "bun:test";
import { strToU8, zipSync } from "fflate";
import { buildContentXml, countCharacters, createTextUdfBuffer, inspectUdf, validateUdf } from "../src/index";

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

  test("gecerli UDF arsivini validate eder", () => {
    const udf = createTextUdfBuffer("Merhaba\nDünya");
    const validation = validateUdf(udf);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  test("CDATA bitis sekansini guvenli boler", () => {
    const xml = buildContentXml("abc]]>def");

    expect(xml).toContain("abc]]]]><![CDATA[>def");
  });

  test("content.xml olmayan arsivi reddeder", () => {
    const invalid = zipSync({ "nested/content.xml": strToU8("<template format_id=\"1.8\"/>") });
    const validation = validateUdf(invalid);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain("Arsiv kokunde content.xml bulunamadi.");
  });

  test("offset sinirini asan content elemanini reddeder", () => {
    const invalidXml =
      '<?xml version="1.0" encoding="UTF-8"?><template format_id="1.8"><content><![CDATA[Kisa]]></content><properties></properties><elements><paragraph><content startOffset="3" length="10"/></paragraph></elements><styles></styles></template>';
    const invalid = zipSync({ "content.xml": strToU8(invalidXml) });
    const validation = validateUdf(invalid);

    expect(validation.valid).toBe(false);
    expect(validation.errors.some((error) => error.includes("Offset siniri asildi"))).toBe(true);
  });
});
