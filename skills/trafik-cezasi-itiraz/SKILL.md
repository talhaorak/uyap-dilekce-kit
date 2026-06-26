---
name: trafik-cezasi-itiraz
description: "Prepare Turkish traffic fine objection workflows: extract fine facts from PDF/image, ask missing questions, draft petition text, build evidence checklist, and export UYAP-ready outputs."
---

# Trafik Cezasi Itiraz

Use this skill when the user wants to object to a Turkish traffic administrative
fine and needs a petition draft plus UYAP-ready output.

This is not legal representation. Make uncertainty and user-verification points
explicit.

## Workflow

1. Extract facts from the fine document and user narrative.
2. Mark OCR or PDF fields with low confidence.
3. Check deadline risk before drafting.
4. Classify likely objection type.
5. Ask only for missing facts that materially affect the petition.
6. Draft Turkish petition text, evidence list, requested outcome, and checklist.
7. Export through the document layers:
   - Markdown first,
   - DOCX when renderer exists,
   - UDF through `skills/uyap-udf` or `packages/uyap-udf`.

## References

- Read `references/workflow.md` for fields, objection classes, and output
  checklist.
- Read `../../docs/yargi-mcp-adapter.md` before using optional yargi-mcp
  research or case-law citation support.

## Gotchas

- Do not invent report number, plate, dates, or legal article.
- Do not guarantee cancellation of the fine.
- Do not upload to UYAP without explicit approval.
- `yargi-mcp` is optional enrichment, not a required dependency.
