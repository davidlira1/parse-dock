import type { z } from "zod";
import type {
  PurchaseOrderItemSchema,
  PurchaseOrderSchema,
} from "./purchase-order.schema.js";

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;
