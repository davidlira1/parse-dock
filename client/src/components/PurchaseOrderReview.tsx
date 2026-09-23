import type { PurchaseOrder } from "../types/purchase-order";
import { CustomerSection } from "./CustomerSection";
import { DocumentPreview } from "./DocumentPreview";
import { GeneralSection } from "./GeneralSection";
import { LineItemsTable } from "./LineItemsTable";
import { ProjectSection } from "./ProjectSection";
import { ShippingSection } from "./ShippingSection";
import { TotalsSection } from "./TotalsSection";

type PurchaseOrderReviewProps = {
  file: File;
  draft: PurchaseOrder;
  onChange: (draft: PurchaseOrder) => void;
  onConfirm: () => void;
};

export function PurchaseOrderReview({
  file,
  draft,
  onChange,
  onConfirm,
}: PurchaseOrderReviewProps) {
  return (
    <div className="review-layout">
      <DocumentPreview file={file} />
      <section className="review">
        <div className="panel-intro">
          <h1>Review Purchase Order</h1>
          <p>Review the extracted information before confirming.</p>
        </div>

        <GeneralSection purchaseOrder={draft} onChange={onChange} />

        <div className="review-grid">
          <CustomerSection
            customer={draft.customer}
            onChange={(customer) => onChange({ ...draft, customer })}
          />
          <ProjectSection
            project={draft.project}
            onChange={(project) => onChange({ ...draft, project })}
          />
        </div>

        <ShippingSection
          shipTo={draft.shipTo}
          onChange={(shipTo) => onChange({ ...draft, shipTo })}
        />
        <LineItemsTable
          items={draft.items}
          onChange={(items) => onChange({ ...draft, items })}
        />
        <TotalsSection purchaseOrder={draft} onChange={onChange} />

        <div className="actions actions-end">
          <button type="button" className="button button-primary" onClick={onConfirm}>
            Confirm Purchase Order
          </button>
        </div>
      </section>
    </div>
  );
}
