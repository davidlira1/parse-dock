export interface PurchaseOrderItem {
  sku: string | null;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
}

export interface PurchaseOrder {
  poNumber: string | null;
  customer: {
    name: string | null;
    contactName: string | null;
    email: string | null;
    phone: string | null;
  };
  project: {
    name: string | null;
    jobNumber: string | null;
  };
  orderDate: string | null;
  requestedDeliveryDate: string | null;
  shipTo: {
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  items: PurchaseOrderItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
}
