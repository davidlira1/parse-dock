import type { PurchaseOrderItem } from "../types/purchase-order";
import { NullableNumberInput } from "./NullableNumberInput";
import { TextField } from "./TextField";

type LineItemsTableProps = {
  items: PurchaseOrderItem[];
  onChange: (items: PurchaseOrderItem[]) => void;
};

export function LineItemsTable({ items, onChange }: LineItemsTableProps) {
  function updateItem(index: number, patch: Partial<PurchaseOrderItem>) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <section className="card">
      <h2>Line Items</h2>
      {items.length === 0 ? (
        <p className="empty-copy">No line items were found on this document.</p>
      ) : null}
      <div className="table-scroll">
        <table className="line-items">
          <thead>
            <tr>
              <th scope="col">SKU</th>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Unit</th>
              <th scope="col">Unit Price</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const line = index + 1;
              return (
                <tr key={line}>
                  <td>
                    <TextField
                      id={`item-${line}-sku`}
                      appearance="cell"
                      label={`SKU for line ${line}`}
                      value={item.sku}
                      onChange={(sku) => updateItem(index, { sku })}
                    />
                  </td>
                  <td>
                    <TextField
                      id={`item-${line}-description`}
                      appearance="cell"
                      label={`Description for line ${line}`}
                      value={item.description}
                      onChange={(description) => updateItem(index, { description })}
                    />
                  </td>
                  <td>
                    <NullableNumberInput
                      id={`item-${line}-quantity`}
                      appearance="cell"
                      label={`Quantity for line ${line}`}
                      value={item.quantity}
                      onChange={(quantity) => updateItem(index, { quantity })}
                    />
                  </td>
                  <td>
                    <TextField
                      id={`item-${line}-unit`}
                      appearance="cell"
                      label={`Unit for line ${line}`}
                      value={item.unit}
                      onChange={(unit) => updateItem(index, { unit })}
                    />
                  </td>
                  <td>
                    <NullableNumberInput
                      id={`item-${line}-unit-price`}
                      appearance="cell"
                      format="money"
                      label={`Unit price for line ${line}`}
                      value={item.unitPrice}
                      onChange={(unitPrice) => updateItem(index, { unitPrice })}
                    />
                  </td>
                  <td>
                    <NullableNumberInput
                      id={`item-${line}-total`}
                      appearance="cell"
                      format="money"
                      label={`Total for line ${line}`}
                      value={item.totalPrice}
                      onChange={(totalPrice) => updateItem(index, { totalPrice })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
