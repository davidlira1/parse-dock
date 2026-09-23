import { z } from "zod";

const nullableString = z.string().nullable();
const nullableNumber = z.number().finite().nullable();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealIsoDate, "Expected a real calendar date in YYYY-MM-DD form");

const nullableDate = isoDate.nullable();

export const PurchaseOrderItemSchema = z.object({
  sku: nullableString.describe("SKU or item identifier exactly as printed."),
  description: nullableString.describe("Line item description."),
  quantity: nullableNumber.describe("Quantity as a number."),
  unit: nullableString.describe("Unit of measure, such as EA or LF."),
  unitPrice: nullableNumber.describe("Price for one unit."),
  totalPrice: nullableNumber.describe("Extended price for the line."),
});

export const PurchaseOrderSchema = z.object({
  poNumber: nullableString.describe("Purchase order number."),
  customer: z.object({
    name: nullableString.describe("Customer or company name."),
    contactName: nullableString.describe("Customer contact name."),
    email: nullableString.describe("Customer email address."),
    phone: nullableString.describe("Customer phone number."),
  }),
  project: z.object({
    name: nullableString.describe("Project or job name."),
    jobNumber: nullableString.describe("Job or project number."),
  }),
  orderDate: nullableDate.describe("Order date in YYYY-MM-DD form."),
  requestedDeliveryDate: nullableDate.describe(
    "Requested delivery date in YYYY-MM-DD form.",
  ),
  shipTo: z.object({
    address: nullableString.describe("Ship-to street address."),
    city: nullableString.describe("Ship-to city."),
    state: nullableString.describe("Ship-to state or region."),
    zip: nullableString.describe("Ship-to postal code."),
  }),
  items: z
    .array(PurchaseOrderItemSchema)
    .describe("All visible purchase-order line items."),
  subtotal: nullableNumber.describe("Order subtotal."),
  tax: nullableNumber.describe("Tax amount."),
  total: nullableNumber.describe("Order total."),
});

function isRealIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const yearText = match[1];
  const monthText = match[2];
  const dayText = match[3];
  if (
    yearText === undefined ||
    monthText === undefined ||
    dayText === undefined
  ) {
    return false;
  }

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
