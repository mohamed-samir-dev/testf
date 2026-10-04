/** All storefront amounts are Egyptian pounds, with piastre precision. */
export const EGP_PER_SAR = 13.9276;
export function formatEGP(amount: number | null | undefined, options: { withLabel?: boolean } = {}): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  const formatted = amount.toLocaleString('en-US', {maximumFractionDigits:2});
  return options.withLabel ? formatted + ' ج.م' : formatted;
}
export const formatProductPrice = formatEGP;
export function getDisplayPrice(product: {originalPrice?:number;salePrice?:number|null;price?:number}): number {
  return product.salePrice ?? product.originalPrice ?? product.price ?? 0;
}
