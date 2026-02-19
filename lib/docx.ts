import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { SECTION_ORDER, SECTION_LABELS, type SectionKey } from "@/types";

interface DraftSectionInput {
  sectionKey: string;
  content: string;
}

interface ProjectData {
  title: string;
  jurisdiction: string;
  sections: DraftSectionInput[];
}

function contentToParagraphs(content: string): Paragraph[] {
  return content
    .split("\n\n")
    .filter((p) => p.trim())
    .map(
      (text) =>
        new Paragraph({
          children: [new TextRun({ text: text.trim(), size: 24 })],
          spacing: { after: 200 },
        })
    );
}

export async function buildDocx(project: ProjectData): Promise<Buffer> {
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sectionMap = new Map(project.sections.map((s) => [s.sectionKey, s.content]));

  const children: Paragraph[] = [
    // Confidential header
    new Paragraph({
      children: [
        new TextRun({
          text: "CONFIDENTIAL — NOT LEGAL ADVICE — FOR INFORMATIONAL PURPOSES ONLY",
          bold: true,
          color: "CC0000",
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Title block
    new Paragraph({
      children: [
        new TextRun({ text: (sectionMap.get("TITLE") ?? project.title).toUpperCase(), bold: true, size: 32 }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Provisional Patent Application — ${project.jurisdiction}`, size: 24, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Date: ${now}`, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
  ];

  // Sections in canonical order (skip TITLE — already in header)
  for (const key of SECTION_ORDER) {
    if (key === "TITLE") continue;
    const content = sectionMap.get(key);
    if (!content) continue;

    const label = SECTION_LABELS[key as SectionKey] ?? key;

    children.push(
      new Paragraph({
        children: [new TextRun({ text: label.toUpperCase(), bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // CLAIMS: render as numbered list (each line that starts with a number)
    if (key === "CLAIMS") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "What is claimed is:", size: 24, italics: true })],
          spacing: { after: 200 },
        })
      );
      const claimLines = content.split("\n").filter((l) => l.trim());
      for (const line of claimLines) {
        const isNumbered = /^\d+\./.test(line.trim());
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24 })],
            spacing: { after: 180 },
            indent: isNumbered ? { left: 360 } : { left: 720 },
          })
        );
      }
    } else {
      children.push(...contentToParagraphs(content));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: { run: { font: "Times New Roman", size: 24 } },
      },
    },
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
