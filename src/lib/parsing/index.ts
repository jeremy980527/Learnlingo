import { extractTextFromImage } from "./ocr";
import { extractTextFromPdf } from "./pdf";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export class UnsupportedFileTypeError extends Error {
  constructor(fileType: string) {
    super(`不支援的檔案格式：${fileType}`);
    this.name = "UnsupportedFileTypeError";
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string,
): Promise<string> {
  if (fileType === "application/pdf") {
    return extractTextFromPdf(buffer);
  }

  if (SUPPORTED_IMAGE_TYPES.has(fileType)) {
    return extractTextFromImage(buffer);
  }

  if (fileType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new UnsupportedFileTypeError(fileType);
}

export function isSupportedFileType(fileType: string): boolean {
  return (
    fileType === "application/pdf" ||
    fileType === "text/plain" ||
    SUPPORTED_IMAGE_TYPES.has(fileType)
  );
}

export const ACCEPTED_FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt"];
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  ...SUPPORTED_IMAGE_TYPES,
];
