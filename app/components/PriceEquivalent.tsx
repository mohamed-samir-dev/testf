import { formatEGP, EGP_PER_SAR } from '../lib/currency';

/** Secondary reference price; orders and all stored prices remain in EGP. */
export default function PriceEquivalent({ amount, rate = EGP_PER_SAR }: { amount: number; rate?: number }) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return null;
  return <span className="text-xs font-medium text-gray-500 whitespace-nowrap" dir="rtl">≈ {formatEGP(amount / rate)} ر.س</span>;
}
