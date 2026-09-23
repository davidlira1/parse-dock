export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

export function validateDocumentFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Upload a PDF, PNG, or JPEG.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "This file is larger than 10 MB.";
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes >= 10 ? Math.round(megabytes) : megabytes.toFixed(1)} MB`;
}

export function fileKindLabel(file: File): string {
  switch (file.type) {
    case "application/pdf":
      return "PDF";
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPEG";
    default:
      return "File";
  }
}
