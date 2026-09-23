import type { PurchaseOrder } from "../types/purchase-order";
import { TextField } from "./TextField";

type CustomerSectionProps = {
  customer: PurchaseOrder["customer"];
  onChange: (customer: PurchaseOrder["customer"]) => void;
};

export function CustomerSection({ customer, onChange }: CustomerSectionProps) {
  return (
    <section className="card">
      <h2>Customer</h2>
      <div className="field-stack">
        <TextField
          id="customer-name"
          label="Customer Name"
          value={customer.name}
          onChange={(name) => onChange({ ...customer, name })}
        />
        <TextField
          id="customer-contact"
          label="Contact Name"
          value={customer.contactName}
          onChange={(contactName) => onChange({ ...customer, contactName })}
        />
        <TextField
          id="customer-email"
          label="Email"
          type="email"
          value={customer.email}
          onChange={(email) => onChange({ ...customer, email })}
        />
        <TextField
          id="customer-phone"
          label="Phone"
          type="tel"
          value={customer.phone}
          onChange={(phone) => onChange({ ...customer, phone })}
        />
      </div>
    </section>
  );
}
