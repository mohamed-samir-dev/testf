"use client";
import { memo } from "react";
import { fields } from "../constants";
import type { CompanyData } from "../types";

interface CompanyFieldsProps {
  data: CompanyData;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

// Pre-built lookup map — computed once at module load, not on every render.
const fieldLabelMap = new Map(fields.map((f) => [f.key, f.label]));

// Map field keys to their proper HTML input type so the browser renders the
// correct keyboard on mobile and applies built-in format hints.
const fieldTypeMap: Record<string, string> = {
  phone:     "tel",
  whatsapp:  "tel",
  email:     "email",
  website:   "url",
};

const ltrFields = new Set(["phone", "whatsapp", "website", "email", "taxNumber"]);

// Memoised per-field input — receives only its primitive string `value`.
// When any other sibling field changes, this component's props remain identical
// and React skips re-rendering entirely (true O(1) keystroke latency).
const FieldInput = memo(function FieldInput({
  fieldKey,
  value,
  onChange,
  disabled,
}: {
  fieldKey: string;
  value: string;
  onChange: (k: string, v: string) => void;
  disabled?: boolean;
}) {
  const label = fieldLabelMap.get(fieldKey);
  const inputType = fieldTypeMap[fieldKey] ?? "text";
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        className={inputClass}
        dir={ltrFields.has(fieldKey) ? "ltr" : undefined}
        disabled={disabled}
      />
    </div>
  );
});

const PaymentMethodSelect = memo(function PaymentMethodSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (k: string, v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1">طريقة الدفع</label>
      <select
        value={value}
        onChange={(e) => onChange("paymentMethod", e.target.value)}
        className={inputClass}
        disabled={disabled}
      >
        <option value="الدفع عند الاستلام">الدفع عند الاستلام</option>
      </select>
    </div>
  );
});

const DetailsTextarea = memo(function DetailsTextarea({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (k: string, v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1">التفاصيل</label>
      <textarea
        value={value}
        onChange={(e) => onChange("details", e.target.value)}
        rows={3}
        className={inputClass}
        disabled={disabled}
      />
    </div>
  );
});

// Memoised container: renders grid of isolated FieldInputs
const CompanyFields = memo(function CompanyFields({ data, onChange, disabled }: CompanyFieldsProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["nameAr", "nameEn"].map((k) => (
          <FieldInput key={k} fieldKey={k} value={data[k] || ""} onChange={onChange} disabled={disabled} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["addressAr", "addressEn"].map((k) => (
          <FieldInput key={k} fieldKey={k} value={data[k] || ""} onChange={onChange} disabled={disabled} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["phone", "whatsapp"].map((k) => (
          <FieldInput key={k} fieldKey={k} value={data[k] || ""} onChange={onChange} disabled={disabled} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["website", "email"].map((k) => (
          <FieldInput key={k} fieldKey={k} value={data[k] || ""} onChange={onChange} disabled={disabled} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {["currencyAr", "currencyEn"].map((k) => (
          <FieldInput key={k} fieldKey={k} value={k === "currencyAr" ? "جنيه مصري" : "EGP"} onChange={onChange} disabled />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {["taxNumber", "shippingCompany"].map((k) => (
          <FieldInput key={k} fieldKey={k} value={data[k] || ""} onChange={onChange} disabled={disabled} />
        ))}
        <PaymentMethodSelect value={data.paymentMethod || ""} onChange={onChange} disabled={disabled} />
      </div>
      <DetailsTextarea value={data.details || ""} onChange={onChange} disabled={disabled} />
    </div>
  );
});

export default CompanyFields;
