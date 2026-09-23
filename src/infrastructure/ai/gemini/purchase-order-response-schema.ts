import { z } from "zod";
import { PurchaseOrderSchema } from "../../../domain/purchase-order/purchase-order.schema.js";

const DATE_PATTERN = String.raw`^\d{4}-\d{2}-\d{2}$`;

const ALLOWED_KEYS = new Set([
  "type",
  "title",
  "description",
  "properties",
  "required",
  "additionalProperties",
  "enum",
  "format",
  "minimum",
  "maximum",
  "items",
  "prefixItems",
  "minItems",
  "maxItems",
]);

export function toPurchaseOrderResponseSchema(): Record<string, unknown> {
  return normalizeSchema(z.toJSONSchema(PurchaseOrderSchema));
}

function normalizeSchema(node: unknown): Record<string, unknown> {
  const source = unwrapNullableUnion(asRecord(node));
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (key === "properties") {
      normalized.properties = normalizeProperties(value);
      continue;
    }

    if (key === "items") {
      normalized.items = normalizeSchema(value);
      continue;
    }

    if (key === "pattern") {
      if (value === DATE_PATTERN) {
        normalized.format = "date";
      }
      continue;
    }

    if (!ALLOWED_KEYS.has(key)) {
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

function normalizeProperties(value: unknown): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const [name, property] of Object.entries(asRecord(value))) {
    properties[name] = normalizeSchema(property);
  }

  return properties;
}

function unwrapNullableUnion(
  node: Record<string, unknown>,
): Record<string, unknown> {
  if (!Array.isArray(node.anyOf)) {
    return node;
  }

  const branches = node.anyOf.filter(isRecord);
  const valueBranches = branches.filter((branch) => branch.type !== "null");
  const nullBranches = branches.filter((branch) => branch.type === "null");
  const valueBranch = valueBranches[0];

  if (
    branches.length !== node.anyOf.length ||
    nullBranches.length !== 1 ||
    valueBranches.length !== 1 ||
    valueBranch === undefined
  ) {
    throw new Error(
      "Purchase order response schema contains an unsupported union.",
    );
  }

  const type = valueBranch.type;
  const types = Array.isArray(type) ? [...type] : [type];
  if (!types.includes("null")) {
    types.push("null");
  }

  return {
    ...valueBranch,
    description: node.description ?? valueBranch.description,
    type: types,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Purchase order response schema is not an object.");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
