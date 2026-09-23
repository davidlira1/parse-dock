import type { NextFunction, Request, Response } from "express";
import { ExtractPurchaseOrder } from "../../application/use-cases/extract-purchase-order.js";
import { AppError } from "../../errors/app-error.js";
import { isSupportedDocumentMimeType } from "../middleware/upload.middleware.js";

export class DocumentController {
  constructor(private readonly extractPurchaseOrder: ExtractPurchaseOrder) {}

  extract = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const file = req.file;

      if (!file) {
        throw new AppError(
          'No file was supplied. Upload a file in the "file" field.',
          400,
          "file_required",
        );
      }

      if (file.size === 0) {
        throw new AppError("The uploaded file is empty.", 400, "empty_file");
      }

      if (!isSupportedDocumentMimeType(file.mimetype)) {
        throw new AppError(
          "Unsupported file type. Upload a PDF, PNG, or JPEG.",
          400,
          "unsupported_mime_type",
        );
      }

      const purchaseOrder = await this.extractPurchaseOrder.execute({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      });

      res.status(200).json({ purchaseOrder });
    } catch (error) {
      next(error);
    }
  };
}
