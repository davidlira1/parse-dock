type TextFieldProps = {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  type?: "text" | "email" | "tel" | "date";
  appearance?: "field" | "cell";
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  appearance = "field",
}: TextFieldProps) {
  const input = (
    <input
      id={id}
      type={type}
      autoComplete="off"
      aria-label={appearance === "cell" ? label : undefined}
      value={value ?? ""}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === "" ? null : next);
      }}
      onBlur={(event) => {
        if (type === "date") {
          return;
        }
        const trimmed = event.target.value.trim();
        onChange(trimmed === "" ? null : trimmed);
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
