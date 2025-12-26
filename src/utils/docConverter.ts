import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { ConversionResult } from '../types';

/* =========================
   CONFIG PDF.JS (VITE SAFE)
========================== */
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/* =========================
   TEXT → DOCX
========================== */
export const convertTextToDocx = async (file: File): Promise<ConversionResult> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/);

  const doc = new Document({
    sections: [
      {
        children: lines.map(
          (line) =>
            new Paragraph({
              text: line.trim() || ' ',
              spacing: { line: 360 },
            })
        ),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, '.docx'),
  };
};

/* =========================
   IMAGE → DOCX (TEXTE)
========================== */
export const convertImageToDocx = async (file: File): Promise<ConversionResult> => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Image convertie en document Word', bold: true })],
          }),
          new Paragraph({ text: `Fichier : ${file.name}` }),
          new Paragraph({ text: '⚠️ L’image n’est pas intégrée visuellement.' }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, '.docx'),
  };
};

/* =========================
   PDF → DOCX (TEXTE ONLY)
========================== */
export const convertPdfToDocx = async (file: File): Promise<ConversionResult> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const paragraphs: Paragraph[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str)
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    paragraphs.push(
      new Paragraph({
        text: pageText || `[Page ${i} : aucun texte détecté]`,
        spacing: { line: 360 },
      })
    );

    if (i < pdf.numPages) {
      paragraphs.push(
        new Paragraph({
          text: `--- Page ${i} ---`,
          spacing: { before: 400, after: 400 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, '.docx'),
  };
};
