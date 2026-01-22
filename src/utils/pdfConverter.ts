import * as pdfjsLib from "pdfjs-dist";
import { ConversionResult } from "../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const convertPdfToImages = async (
  file: File
): Promise<ConversionResult[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const results: ConversionResult[] = [];

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) continue;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({
      canvasContext: ctx,
      canvas, // ✅ ajouté pour corriger l'erreur TypeScript
      viewport,
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Échec lors de la conversion en image"));
      }, "image/png");
    });

    const safeName = file.name.replace(/\.pdf$/i, "");
    const filename = `${safeName}_page_${pageIndex}.png`;

    results.push({ blob, filename });
  }

  return results;
};
