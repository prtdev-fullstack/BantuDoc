import * as pdfjsLib from 'pdfjs-dist';
import { ConversionResult } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const convertPdfToImages = async (file: File): Promise<ConversionResult[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results: ConversionResult[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
  canvasContext: ctx,
  canvas: canvas,
  viewport: viewport,
}).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to convert page'));
      }, 'image/png');
    });

    const filename = `${file.name.replace('.pdf', '')}_page_${i}.png`;
    results.push({ blob, filename });
  }

  return results;
};
