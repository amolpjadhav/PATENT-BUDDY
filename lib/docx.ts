import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

interface Section {
  type: string;
  title: string;
  content: string;
  order: number;
}

interface Claim {
  number: number;
  claimType: string;
  content: string;
  dependsOn: number | null;
}

interface ProjectData {
  title: string;
  inventorName: string | null;
  sections: Section[];
  claims: Claim[];
}

function contentToParagraphs(content: string): Paragraph[] {
  return content
    .split("\n\n")
    .filter((p) => p.trim())
    .map(
      (text) =>
        new Paragraph({
          children: [
            new TextRun({
              text: text.trim(),
              size: 24, // 12pt
            }),
          ],
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

  const sortedSections = [...project.sections].sort((a, b) => a.order - b.order);

  const children: (Paragraph | Table)[] = [
    // Confidential header
    new Paragraph({
      children: [
        new TextRun({
          text: "CONFIDENTIAL — ATTORNEY-CLIENT PRIVILEGED (IF APPLICABLE)",
          bold: true,
          color: "CC0000",
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "NOT LEGAL ADVICE — FOR INFORMATIONAL PURPOSES ONLY",
          bold: true,
          color: "CC0000",
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Title
    new Paragraph({
      children: [
        new TextRun({
          text: project.title.toUpperCase(),
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Provisional Patent Application`,
          size: 24,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Inventor: ${project.inventorName ?? "Not specified"}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${now}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
  ];

  // Add specification sections (skip title section - already in header)
  for (const section of sortedSections) {
    if (section.type === "title") continue;

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    children.push(...contentToParagraphs(section.content));
  }

  // Claims section
  if (project.claims.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "CLAIMS",
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "What is claimed is:",
            size: 24,
            italics: true,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    const sortedClaims = [...project.claims].sort((a, b) => a.number - b.number);
    for (const claim of sortedClaims) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${claim.number}. `,
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: claim.content,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
          indent: { left: 360 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24,
          },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
