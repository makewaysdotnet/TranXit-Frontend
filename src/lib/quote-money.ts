// Matches the backend's two-decimal, 15-significant-digit storage boundary.
export const MAX_QUOTE_CENTS = 999_999_999_999_999;
export const QUOTE_AMOUNT_ERROR =
  "Enter an amount from 0 to 9999999999999.99 with no more than two decimal places.";

export function parseQuoteCents(text: string): number | null {
  const value = text.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [integer, fraction = ""] = value.split(".");
  const whole = integer.replace(/^0+/, "") || "0";
  if (whole.length > 13) return null;
  const cents = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  return cents <= BigInt(MAX_QUOTE_CENTS) ? Number(cents) : null;
}

export function sumQuoteCents(values: readonly (number | null)[]): number | null {
  let total = 0;
  for (const value of values) {
    if (value === null || !Number.isSafeInteger(value) || value < 0 || value > MAX_QUOTE_CENTS - total) {
      return null;
    }
    total += value;
  }
  return total;
}

const quoteFormatter = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 2,
  // Do not hide extra precision in historical quotes that predate validation.
  maximumFractionDigits: 20,
});

export function hasQuoteAmount(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value) && value >= 0;
}

export function formatQuoteAmount(value: number | null | undefined, fallback = "Awaiting bids"): string {
  return hasQuoteAmount(value) ? `PKR ${quoteFormatter.format(value)}` : fallback;
}
