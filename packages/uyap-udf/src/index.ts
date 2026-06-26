import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

export interface TextUdfOptions {
  fontFamily?: string;
  fontSize?: number;
}

export interface UdfInspection {
  entries: string[];
  hasContentXml: boolean;
  formatId: string | null;
  contentXml?: string;
}

export interface UdfValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  inspection: UdfInspection;
}

const DEFAULT_FONT_FAMILY = "Times New Roman";
const DEFAULT_FONT_SIZE = 12;

export function buildContentXml(text: string, options: TextUdfOptions = {}): string {
  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;
  const paragraphs = buildParagraphElements(text, fontFamily, fontSize);

  return `<?xml version="1.0" encoding="UTF-8"?><template format_id="1.8"><content><![CDATA[${toSafeCdata(text)}]]></content><properties><pageFormat mediaSizeName="1" leftMargin="42.52" rightMargin="28.35" topMargin="14.17" bottomMargin="14.17" paperOrientation="1" headerFOffset="20.0" footerFOffset="20.0"/></properties><elements resolver="hvl-default">${paragraphs}</elements><styles><style name="default" description="Gecerli" family="${escapeXmlAttribute(fontFamily)}" size="${fontSize}" bold="false" italic="false"/><style name="hvl-default" description="Gövde" family="${escapeXmlAttribute(fontFamily)}" size="${fontSize}"/></styles></template>`;
}

export function createTextUdfBuffer(text: string, options: TextUdfOptions = {}): Uint8Array {
  const contentXml = buildContentXml(text, options);
  return zipSync(
    {
      "content.xml": strToU8(contentXml),
    },
    { level: 6 },
  );
}

export function inspectUdf(buffer: Uint8Array): UdfInspection {
  const entries = unzipSync(buffer);
  const names = Object.keys(entries).sort();
  const contentEntry = entries["content.xml"];
  const contentXml = contentEntry ? strFromU8(contentEntry) : undefined;
  const formatId = contentXml?.match(/<template\s+[^>]*format_id="([^"]+)"/)?.[1] ?? null;

  return {
    entries: names,
    hasContentXml: Boolean(contentEntry),
    formatId,
    contentXml,
  };
}

export function validateUdf(buffer: Uint8Array): UdfValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let inspection: UdfInspection;

  try {
    inspection = inspectUdf(buffer);
  } catch (error) {
    return {
      valid: false,
      errors: [`UDF arsivi okunamadi: ${error instanceof Error ? error.message : String(error)}`],
      warnings,
      inspection: {
        entries: [],
        hasContentXml: false,
        formatId: null,
      },
    };
  }

  if (!inspection.hasContentXml) {
    errors.push("Arsiv kokunde content.xml bulunamadi.");
  }

  if (inspection.entries.some((entry) => entry.includes("/content.xml"))) {
    warnings.push("content.xml kokte olmali; alt klasordeki content.xml UYAP tarafinda beklenmeyebilir.");
  }

  if (inspection.formatId !== "1.8") {
    errors.push(`Beklenen format_id 1.8, bulunan: ${inspection.formatId ?? "yok"}.`);
  }

  if (inspection.contentXml) {
    const contentPool = extractContentPool(inspection.contentXml);
    if (contentPool === null) {
      errors.push("Ana <content><![CDATA[...]]></content> metin havuzu bulunamadi.");
    } else {
      validateOffsets(inspection.contentXml, contentPool, errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    inspection,
  };
}

function buildParagraphElements(text: string, fontFamily: string, fontSize: number): string {
  const lines = text.split("\n");
  let offset = 0;

  return lines
    .map((line) => {
      const length = countCharacters(line);
      const content =
        length > 0
          ? `<content startOffset="${offset}" length="${length}" family="${escapeXmlAttribute(fontFamily)}" size="${fontSize}"/>`
          : "";
      const paragraph = `<paragraph family="${escapeXmlAttribute(fontFamily)}" size="${fontSize}" description="Gövde">${content}</paragraph>`;
      offset += length + 1;
      return paragraph;
    })
    .join("");
}

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

function toSafeCdata(value: string): string {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

function extractContentPool(contentXml: string): string | null {
  const match = contentXml.match(/<template\b[\s\S]*?<content><!\[CDATA\[([\s\S]*?)\]\]><\/content><properties>/);
  return match ? match[1].replaceAll("]]]]><![CDATA[>", "]]>") : null;
}

function validateOffsets(contentXml: string, contentPool: string, errors: string[]): void {
  const poolLength = countCharacters(contentPool);
  const contentElementPattern = /<content\b(?=[^>]*\bstartOffset="(\d+)")(?=[^>]*\blength="(\d+)")[^>]*\/>/g;
  let match: RegExpExecArray | null;

  while ((match = contentElementPattern.exec(contentXml)) !== null) {
    const startOffset = Number(match[1]);
    const length = Number(match[2]);
    if (startOffset + length > poolLength) {
      errors.push(
        `Offset siniri asildi: startOffset=${startOffset}, length=${length}, metin uzunlugu=${poolLength}.`,
      );
    }
  }
}

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
