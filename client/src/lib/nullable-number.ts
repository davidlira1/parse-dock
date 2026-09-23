const COMPLETE_NUMBER = /^-?(?:\d+|\d*\.\d+)$/;

export function parseNullableNumber(raw: string): number | null | undefined {
  const normalized = raw.trim().replace(/[$,]/g, "");

  if (normalized === "") {
    return null;
  }

  if (!COMPLETE_NUMBER.test(normalized)) {
    return undefined;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
