import { Check } from "lucide-react";

export default function PurchaseSteps({ current }: { current: 1 | 2 }) {
  return (
    <nav className="purchase-steps" aria-label="مراحل الطلب">
      <ol>{["سلة المشتريات", "طريقة السداد", "إتمام الطلب"].map((label, index) => (
        <li key={label} className={index + 1 === current ? "is-current" : index + 1 < current ? "is-complete" : ""} aria-current={index + 1 === current ? "step" : undefined}>
          <span>{index + 1 < current ? <Check size={15} /> : `0${index + 1}`}</span><b>{label}</b>
        </li>
      ))}</ol>
    </nav>
  );
}
