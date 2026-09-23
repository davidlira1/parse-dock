import type { PurchaseOrder } from "../types/purchase-order";
import { TextField } from "./TextField";

type GeneralSectionProps = {
  purchaseOrder: PurchaseOrder;
  onChange: (purchaseOrder: PurchaseOrder) => void;
};

export function GeneralSection({ purchaseOrder, onChange }: GeneralSectionProps) {
  return (
    <section className="card">
      <h2>General</h2>
      <div className="field-grid field-grid-three">
        <TextField
          id="po-number"
          label="PO Number"
          value={purchaseOrder.poNumber}
          onChange={(poNumber) => onChange({ ...purchaseOrder, poNumber })}
        />
        <TextField
          id="order-date"
          label="Order Date"
          type="date"
          value={purchaseOrder.orderDate}
          onChange={(orderDate) => onChange({ ...purchaseOrder, orderDate })}
        />
        <TextField
          id="requested-delivery-date"
          label="Requested Delivery Date"
          type="date"
          value={purchaseOrder.requestedDeliveryDate}
          onChange={(requestedDeliveryDate) =>
            onChange({ ...purchaseOrder, requestedDeliveryDate })
          }
        />
      </div>
    </section>
  );
}
