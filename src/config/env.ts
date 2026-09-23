import { z } from "zod";

const emptyToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const EnvSchema = z.object({
  PORT: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(3000),
  ),
  GEMINI_API_KEY: z.string().trim().min(1),
  GEMINI_MODEL: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).default("gemini-3.5-flash-lite"),
  ),
  MAX_UPLOAD_BYTES: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(10 * 1024 * 1024),
  ),
  GEMINI_TIMEOUT_MS: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(60_000),
  ),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);

  if (!parsed.success) {
    const fields = [
      ...new Set(
        parsed.error.issues
          .map((issue) => issue.path.join("."))
          .filter((field) => field.length > 0),
      ),
    ];

    throw new Error(
      `Missing or invalid configuration: ${fields.join(", ") || "environment"}`,
    );
  }

  return parsed.data;
}
