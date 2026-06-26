import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

export interface TextUdfOptions {
  fontFamily?: string;
  fontSize?: number;
}

export interface PageFormat {
  mediaSizeName: string;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  bottomMargin: number;
  paperOrientation: "0" | "1";
  headerFOffset: number;
  footerFOffset: number;
}

export interface TextRun {
  startOffset: number;
  length: number;
  family: string;
  size: number;
}

export interface Paragraph {
  family: string;
  size: number;
  description: string;
  content?: TextRun;
}

export interface UdfStyle {
  name: string;
  description: string;
  family: string;
  size: number;
  bold?: boolean;
  italic?: boolean;
}

export interface UdfDocument {
  formatId: string;
  content: string;
  pageFormat: PageFormat;
  paragraphs: Paragraph[];
  styles: UdfStyle[];
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

export interface InspectionOutputOptions {
  showXml?: boolean;
}

const DEFAULT_FONT_FAMILY = "Times New Roman";
const DEFAULT_FONT_SIZE = 12;

const DEFAULT_PAGE_FORMAT: PageFormat = {
  mediaSizeName: "1",
  leftMargin: 42.52,
  rightMargin: 28.35,
  topMargin: 14.17,
  bottomMargin: 14.17,
  paperOrientation: "1",
  headerFOffset: 20,
  footerFOffset: 20,
};

export function buildTextUdfDocument(text: string, options: TextUdfOptions = {}): UdfDocument {
  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const fontSize = options.fontSize ?? DEFAULT_FONT_SIZE;

  return {
    formatId: "1.8",
    content: text,
    pageFormat: DEFAULT_PAGE_FORMAT,
    paragraphs: buildParagraphs(text, fontFamily, fontSize),
    styles: [
      {
        name: "default",
        description: "Gecerli",
        family: fontFamily,
        size: fontSize,
        bold: false,
        italic: false,
      },
      {
        name: "hvl-default",
        description: "Gövde",
        family: fontFamily,
        size: fontSize,
      },
    ],
  };
}

export function buildContentXml(text: string, options: TextUdfOptions = {}): string {
  return serializeContentXml(buildTextUdfDocument(text, options));
}

export function serializeContentXml(document: UdfDocument): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<template format_id="${escapeXmlAttribute(document.formatId)}">`,
    `<content><![CDATA[${toSafeCdata(document.content)}]]></content>`,
    "<properties>",
    serializePageFormat(document.pageFormat),
    "</properties>",
    '<elements resolver="hvl-default">',
    document.paragraphs.map(serializeParagraph).join(""),
    "</elements>",
    "<styles>",
    document.styles.map(serializeStyle).join(""),
    "</styles>",
    "</template>",
  ].join("");
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

export function formatInspection(inspection: UdfInspection, options: InspectionOutputOptions = {}): Omit<UdfInspection, "contentXml"> & { contentXml?: string } {
  const output: Omit<UdfInspection, "contentXml"> & { contentXml?: string } = {
    entries: inspection.entries,
    hasContentXml: inspection.hasContentXml,
    formatId: inspection.formatId,
  };

  if (options.showXml) {
    output.contentXml = inspection.contentXml;
  }

  return output;
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
    validateContentXml(inspection.contentXml, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    inspection,
  };
}

function buildParagraphs(text: string, fontFamily: string, fontSize: number): Paragraph[] {
  const lines = text.split("\n");
  let offset = 0;

  return lines.map((line) => {
    const length = countCharacters(line);
    const paragraph: Paragraph = {
      family: fontFamily,
      size: fontSize,
      description: "Gövde",
    };

    if (length > 0) {
      paragraph.content = {
        startOffset: offset,
        length,
        family: fontFamily,
        size: fontSize,
      };
    }

    offset += length + 1;
    return paragraph;
  });
}

function serializePageFormat(pageFormat: PageFormat): string {
  return `<pageFormat mediaSizeName="${escapeXmlAttribute(pageFormat.mediaSizeName)}" leftMargin="${pageFormat.leftMargin}" rightMargin="${pageFormat.rightMargin}" topMargin="${pageFormat.topMargin}" bottomMargin="${pageFormat.bottomMargin}" paperOrientation="${pageFormat.paperOrientation}" headerFOffset="${pageFormat.headerFOffset}.0" footerFOffset="${pageFormat.footerFOffset}.0"/>`;
}

function serializeParagraph(paragraph: Paragraph): string {
  const content = paragraph.content ? serializeTextRun(paragraph.content) : "";
  return `<paragraph family="${escapeXmlAttribute(paragraph.family)}" size="${paragraph.size}" description="${escapeXmlAttribute(paragraph.description)}">${content}</paragraph>`;
}

function serializeTextRun(textRun: TextRun): string {
  return `<content startOffset="${textRun.startOffset}" length="${textRun.length}" family="${escapeXmlAttribute(textRun.family)}" size="${textRun.size}"/>`;
}

function serializeStyle(style: UdfStyle): string {
  return `<style name="${escapeXmlAttribute(style.name)}" description="${escapeXmlAttribute(style.description)}" family="${escapeXmlAttribute(style.family)}" size="${style.size}"${optionalBooleanAttribute("bold", style.bold)}${optionalBooleanAttribute("italic", style.italic)}/>`;
}

function optionalBooleanAttribute(name: string, value: boolean | undefined): string {
  return typeof value === "boolean" ? ` ${name}="${value ? "true" : "false"}"` : "";
}

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

function toSafeCdata(value: string): string {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

function validateContentXml(contentXml: string, errors: string[], warnings: string[]): void {
  const contentPool = extractContentPool(contentXml);
  if (contentPool === null) {
    errors.push("Ana <content><![CDATA[...]]></content> metin havuzu bulunamadi.");
    return;
  }

  validateOffsets(contentXml, contentPool, errors, warnings);
}

function extractContentPool(contentXml: string): string | null {
  const match = contentXml.match(/<template\b[\s\S]*?<content>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/content>/);
  return match ? match[1].replaceAll("]]]]><![CDATA[>", "]]>") : null;
}

function validateOffsets(contentXml: string, contentPool: string, errors: string[], warnings: string[]): void {
  const poolLength = countCharacters(contentPool);
  const contentElementPattern = /<content\b(?=[^>]*\bstartOffset="(\d+)")(?=[^>]*\blength="(\d+)")[^>]*\/>/g;
  let match: RegExpExecArray | null;
  let referenceCount = 0;

  while ((match = contentElementPattern.exec(contentXml)) !== null) {
    referenceCount += 1;
    const startOffset = Number(match[1]);
    const length = Number(match[2]);
    if (startOffset + length > poolLength) {
      errors.push(
        `Offset siniri asildi: startOffset=${startOffset}, length=${length}, metin uzunlugu=${poolLength}.`,
      );
    }
  }

  if (poolLength > 0 && referenceCount === 0) {
    warnings.push("Metin havuzu dolu ama startOffset/length referansi bulunamadi.");
  }
}

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
