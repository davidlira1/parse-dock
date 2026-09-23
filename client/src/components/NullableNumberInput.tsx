import { useState } from "react";
import { formatMoney, parseNullableNumber } from "../lib/nullable-number";

type NullableNumberInputProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  format?: "number" | "money";
  appearance?: "field" | "cell";
  id?: string;
};

export function NullableNumberInput({
  label,
  value,
  onChange,
  format = "number",
  appearance = "field",
  id,
}: NullableNumberInputProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  const shown = focused ? text : displayValue(value, format);

  function commit(nextText: string) {
    const parsed = parseNullableNumber(nextText);
    if (parsed !== undefined) {
      onChange(parsed);
    }
  }

  const input = (
    <input
      id={id}
      className={format === "money" ? "number-input money-input" : "number-input"}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label={appearance === "cell" ? label : undefined}
      value={shown}
      onFocus={() => {
        setText(value === null ? "" : String(value));
        setFocused(true);
      }}
      onChange={(event) => {
        setText(event.target.value);
        commit(event.target.value);
      }}
      onBlur={(event) => {
        const parsed = parseNullableNumber(event.target.value);
        if (parsed === undefined) {
          setText(value === null ? "" : String(value));
        } else {
          onChange(parsed);
        }
        setFocused(false);
      }}
    />
  );

  if (appearance === "cell") {
    return input;
  }

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {input}
    </label>
  );
}

function displayValue(value: number | null, format: "number" | "money"): string {
  if (value === null) {
    return "";
  }

  return format === "money" ? formatMoney(value) : String(value);
}
