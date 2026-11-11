---
name: pdf
description: "Generate a well-formatted PDF report from the current conversation or provided data. Outputs a Markdown file ready for PDF conversion."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Write, Read, Bash
---

# PDF Report Generator

Generates a professional, structured document from the conversation context or provided data, formatted for PDF export.

## STEP 1: IDENTIFY CONTENT

Parse $ARGUMENTS for:
- Report type (audit, summary, analysis, proposal)
- Output filename (default: `report-{date}.md`)
- Any specific sections to include or exclude

If no arguments, generate a summary report of the current conversation.

## STEP 2: STRUCTURE THE DOCUMENT

Build a document with these sections (include only relevant ones):

```markdown
# [Report Title]
**Generated:** {date}
**Prepared by:** [context]

## Executive Summary
2-3 paragraph summary of key findings and recommendations.

## Background
Context and scope of the report.

## Findings
Organized findings with supporting data.

## Analysis
Interpretation of findings, patterns, implications.

## Recommendations
Numbered, actionable recommendations in priority order.

## Appendix
Supporting data, methodology notes, raw tables.
```

## STEP 3: FORMAT FOR READABILITY

- Use clear headings and subheadings
- Tables for comparative data
- Numbered lists for ranked items, bullet lists for unranked
- Code blocks for technical content
- Keep paragraphs to 3-4 sentences maximum
- No jargon without definition

## STEP 4: WRITE THE FILE

Save the document to the path specified in $ARGUMENTS or default to `report-{YYYY-MM-DD}.md` in the current directory.

## STEP 5: CONVERSION INSTRUCTIONS

Output instructions for converting to PDF:
- **Pandoc**: `pandoc report.md -o report.pdf --pdf-engine=weasyprint`
- **VS Code**: Markdown PDF extension
- **Typora**: File → Export → PDF
- **Chrome**: Open `.md` with a Markdown viewer extension, print to PDF

## ANTI-PATTERNS

- Outputting raw conversation logs without structuring
- Including redundant or filler content to appear thorough
- Using markdown formatting that doesn't translate to PDF (emoji, complex tables)
- Generating the file without confirming the output path
