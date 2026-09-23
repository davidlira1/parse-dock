type LogValue = string | number | boolean | null;

export const logger = {
  info(message: string, fields: Record<string, LogValue> = {}): void {
    write("info", message, fields);
  },
  error(message: string, fields: Record<string, LogValue> = {}): void {
    write("error", message, fields);
  },
};

function write(
  level: "info" | "error",
  message: string,
  fields: Record<string, LogValue>,
): void {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...fields,
  });

  if (level === "error") {
    console.error(line);
    return;
  }

  console.info(line);
}
