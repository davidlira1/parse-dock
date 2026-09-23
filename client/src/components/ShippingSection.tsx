import type { PurchaseOrder } from "../types/purchase-order";
import { TextField } from "./TextField";

type ShippingSectionProps = {
  shipTo: PurchaseOrder["shipTo"];
  onChange: (shipTo: PurchaseOrder["shipTo"]) => void;
};

export function ShippingSection({ shipTo, onChange }: ShippingSectionProps) {
  return (
    <section className="card">
      <h2>Ship To</h2>
      <div className="field-stack">
        <TextField
          id="ship-address"
          label="Address"
          value={shipTo.address}
          onChange={(address) => onChange({ ...shipTo, address })}
        />
        <div className="field-grid field-grid-three">
          <TextField
            id="ship-city"
            label="City"
            value={shipTo.city}
            onChange={(city) => onChange({ ...shipTo, city })}
          />
          <TextField
            id="ship-state"
            label="State"
            value={shipTo.state}
            onChange={(state) => onChange({ ...shipTo, state })}
          />
          <TextField
            id="ship-zip"
            label="ZIP"
            value={shipTo.zip}
            onChange={(zip) => onChange({ ...shipTo, zip })}
          />
        </div>
      </div>
    </section>
  );
}
