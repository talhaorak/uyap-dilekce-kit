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

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
