import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../../errors/app-error.js";
import { logger } from "../../logger.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    logger.error("request failed", {
      code: error.code,
      statusCode: error.statusCode,
    });
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const uploadError =
      error.code === "LIMIT_FILE_SIZE"
        ? new AppError("The uploaded file is too large.", 400, "file_too_large")
        : new AppError("The upload could not be processed.", 400, "invalid_upload");

    logger.error("request failed", {
      code: uploadError.code,
      statusCode: uploadError.statusCode,
    });
    res.status(uploadError.statusCode).json({
      error: {
        code: uploadError.code,
        message: uploadError.message,
      },
    });
    return;
  }

  logger.error("request failed", {
    code: "internal_error",
    statusCode: 500,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  res.status(500).json({
    error: {
      code: "internal_error",
      message: "An unexpected error occurred.",
    },
  });
};
