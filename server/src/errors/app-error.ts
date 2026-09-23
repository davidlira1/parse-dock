export type AppErrorCode =
  | "file_required"
  | "empty_file"
  | "unsupported_mime_type"
  | "file_too_large"
  | "invalid_upload"
  | "invalid_provider_response"
  | "provider_unavailable"
  | "provider_timeout"
  | "internal_error";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: AppErrorCode;

  constructor(message: string, statusCode: number, code: AppErrorCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
