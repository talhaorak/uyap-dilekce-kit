---
name: uyap-udf
description: "Create, inspect, validate, or convert Turkish UYAP .udf files; use for UYAP Vatandas/Editor document export, content.xml debugging, and UDF archive checks."
---

# UYAP UDF

Use this skill only for UYAP Dokuman Format work. It is a document-format skill,
not a legal reasoning skill.

## Workflow

1. Identify the source: plain text, Markdown, DOCX, scanned PDF, or existing UDF.
2. For simple text, use the local TypeScript package:
   `bun run uyap-udf from-text <input.txt> <output.udf>`.
3. Inspect output with `bun run uyap-udf inspect <output.udf>`.
4. For rich DOCX/PDF conversion, read `references/format.md` and compare against
   public UDF tooling before promising compatibility.
5. Tell the user to verify legally important documents in UYAP Editor or UYAP
   Vatandas before upload.

## References

- Read `references/format.md` for UDF archive/XML structure and gotchas.

## Gotchas

- UDF is a ZIP archive with root `content.xml`, not raw XML.
- Offsets must be character counts, not UTF-8 byte counts.
- A technically valid UDF can still contain a bad legal document.
- Do not send private legal documents to online converters without explicit
  approval.
