import { jsPDF } from 'jspdf';
import { ConversionResult } from '../types';

export const convertTextToPdf = async (file: File): Promise<ConversionResult> => {
  const text = await file.text();
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = 7;
  let yPosition = margin;

  const lines = pdf.splitTextToSize(text, maxWidth);

  for (const line of lines) {
    if (yPosition + lineHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += lineHeight;
  }

  const blob = pdf.output('blob');
  const filename = file.name.replace(/\.[^/.]+$/, '.pdf');

  return { blob, filename };
};
