import { Document, Packer, Paragraph, TextRun } from "docx";
import { ConversionResult } from "../types";

/* =========================
   TEXTE → DOCX (FRONTEND)
========================== */
export const convertTextToDocx = async (
  file: File
): Promise<ConversionResult> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/);

  const doc = new Document({
    sections: [
      {
        children: lines.map(
          (line) =>
            new Paragraph({
              text: line.trim() || " ",
              spacing: { line: 360 },
            })
        ),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, ".docx"),
  };
};

/* =========================
   IMAGE → DOCX (INFO ONLY)
========================== */
export const convertImageToDocx = async (
  file: File
): Promise<ConversionResult> => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Image convertie en document Word",
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: `Fichier source : ${file.name}` }),
          new Paragraph({
            text:
              "⚠️ L’image n’est pas intégrée visuellement. Conversion textuelle uniquement.",
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, ".docx"),
  };
};

/* =========================
   PDF → DOCX (BACKEND API)
========================== */
export const convertPdfToDocx = async (
  file: File
): Promise<ConversionResult> => {
  const API_URL = import.meta.env.VITE_API_URL;

  if (!API_URL) {
    throw new Error("VITE_API_URL non définie");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/convert/pdf-to-docx`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Backend error:", errorText);
    throw new Error(errorText || "Erreur serveur lors de la conversion");
  }

  const blob = await response.blob();

  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, ".docx"),
  };
};
