import { ConversionResult } from '../types';

const getMimeType = (format: 'png' | 'jpg' | 'webp'): string => {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'jpg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/png';
  }
};

const getQuality = (format: 'png' | 'jpg' | 'webp'): number => {
  return format === 'png' ? 1 : 0.95;
};

export const convertImage = async (
  file: File,
  targetFormat: 'png' | 'jpg' | 'webp'
): Promise<ConversionResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (targetFormat === 'jpg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const filename = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
            resolve({ blob, filename });
          } else {
            reject(new Error('Conversion failed'));
          }
        },
        getMimeType(targetFormat),
        getQuality(targetFormat)
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/* =========================
   IMAGE → PDF (BACKEND SAFE)
========================== */

export const convertImageToPdf = async (
  file: File
): Promise<ConversionResult> => {
  // ✅ fallback local si variable absente
  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/convert/image-to-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur conversion Image → PDF");
  }

  const blob = await response.blob();

  return {
    blob,
    filename: file.name.replace(/\.[^/.]+$/, ".pdf"),
  };
};
