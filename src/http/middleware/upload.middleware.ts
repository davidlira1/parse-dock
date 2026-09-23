import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../../errors/app-error.js";
import { logger } from "../../logger.js";

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;

const supportedMimeTypes = new Set<string>(SUPPORTED_DOCUMENT_MIME_TYPES);
const uploadDetails = new WeakMap<Request, { filename: string; mimeType: string }>();

export function isSupportedDocumentMimeType(mimeType: string): boolean {
  return supportedMimeTypes.has(mimeType);
}

export function createUploadMiddleware(maxUploadBytes: number) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      files: 1,
      fileSize: maxUploadBytes,
    },
    fileFilter(req, file, callback) {
      uploadDetails.set(req, {
        filename: file.originalname,
        mimeType: file.mimetype,
      });

      if (!isSupportedDocumentMimeType(file.mimetype)) {
        callback(
          new AppError(
            "Unsupported file type. Upload a PDF, PNG, or JPEG.",
            400,
            "unsupported_mime_type",
          ),
        );
        return;
      }

      callback(null, true);
    },
  }).single("file");

  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (error) => {
      const details = uploadDetails.get(req);
      logger.info("request received", {
        filename: details?.filename ?? req.file?.originalname ?? null,
        mimeType: details?.mimeType ?? req.file?.mimetype ?? null,
        size: req.file?.size ?? null,
      });
      next(error);
    });
  };
}
