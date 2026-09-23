import type { PurchaseOrder } from "../types/purchase-order";
import { NullableNumberInput } from "./NullableNumberInput";

type TotalsSectionProps = {
  purchaseOrder: PurchaseOrder;
  onChange: (purchaseOrder: PurchaseOrder) => void;
};

export function TotalsSection({ purchaseOrder, onChange }: TotalsSectionProps) {
  return (
    <section className="card totals-card" aria-label="Totals">
      <div className="totals">
        <NullableNumberInput
          id="subtotal"
          format="money"
          label="Subtotal"
          value={purchaseOrder.subtotal}
          onChange={(subtotal) => onChange({ ...purchaseOrder, subtotal })}
        />
        <NullableNumberInput
          id="tax"
          format="money"
          label="Tax"
          value={purchaseOrder.tax}
          onChange={(tax) => onChange({ ...purchaseOrder, tax })}
        />
        <NullableNumberInput
          id="total"
          format="money"
          label="Total"
          value={purchaseOrder.total}
          onChange={(total) => onChange({ ...purchaseOrder, total })}
        />
      </div>
    </section>
  );
}
