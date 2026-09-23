import { describe, expect, it } from "vitest";
import { toPurchaseOrderResponseSchema } from "../src/infrastructure/ai/gemini/purchase-order-response-schema.js";

describe("purchase order response schema", () => {
  const schema = toPurchaseOrderResponseSchema();

  it("uses nullable JSON types Gemini structured output accepts", () => {
    expect(schema.$schema).toBeUndefined();
    expect(schema.pattern).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain("anyOf");
    expect(JSON.stringify(schema)).not.toContain("pattern");

    const properties = schema.properties as Record<string, Record<string, unknown>>;
    expect(properties.poNumber?.type).toEqual(["string", "null"]);
    expect(properties.orderDate?.type).toEqual(["string", "null"]);
    expect(properties.orderDate?.format).toBe("date");
    expect(properties.total?.type).toEqual(["number", "null"]);

    const items = properties.items;
    const itemProperties = (
      items?.items as { properties: Record<string, { type: unknown }> }
    ).properties;
    expect(items?.type).toBe("array");
    expect(itemProperties.quantity?.type).toEqual(["number", "null"]);
    expect(itemProperties.sku?.type).toEqual(["string", "null"]);
  });
});
