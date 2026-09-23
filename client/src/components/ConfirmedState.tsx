import type { PurchaseOrder } from "../types/purchase-order";

type ConfirmedStateProps = {
  purchaseOrder: PurchaseOrder;
  onReset: () => void;
};

export function ConfirmedState({ purchaseOrder, onReset }: ConfirmedStateProps) {
  const summary = purchaseOrder.poNumber
    ? `PO ${purchaseOrder.poNumber} is ready for the next workflow step.`
    : "This purchase order is ready for the next workflow step.";

  return (
    <section className="panel status-panel" aria-live="polite">
      <p className="status-mark" aria-hidden="true">
        ✓
      </p>
      <h1>Purchase order reviewed</h1>
      <p>{summary}</p>
      <p className="status-note">
        This confirmation stays on this page and is not saved.
      </p>
      <div className="actions">
        <button type="button" className="button button-primary" onClick={onReset}>
          Process Another Document
        </button>
      </div>
    </section>
  );
}
