export type FileType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "application/pdf"
  | "text/plain"
  | "application/docx"
  | "application/doc"
  | "unknown";

export type ConversionFormat =
  | "png"
  | "jpg"
  | "webp"
  | "pdf"
  | "image"
  | "txt"
  | "docx"
  | "doc";

export interface ConversionOption {
  value: ConversionFormat;
  label: string;
  icon?: string;
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
}

export const ALL_FORMATS: ConversionOption[] = [
  { value: "png", label: "PNG", icon: "🖼️" },
  { value: "jpg", label: "JPG", icon: "📷" },
  { value: "webp", label: "WebP", icon: "🌐" },
  { value: "pdf", label: "PDF", icon: "📄" },
  { value: "docx", label: "Word (DOCX)", icon: "📘" },
  { value: "txt", label: "Texte (TXT)", icon: "📝" },
];
