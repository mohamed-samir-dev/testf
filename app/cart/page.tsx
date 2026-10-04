"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, ArrowRight, Sparkles, CreditCard, PackageCheck } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import CartItem from "./components/CartItem";
import PurchaseSteps from "./components/PurchaseSteps";
import { formatEGP } from "../lib/currency";
import "./cart.css";
import PriceEquivalent from "../components/PriceEquivalent";

function PoundLabel({ size = 18 }: { size?: number }) {
  return (
    <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQty, totalItems, totalEGP } = useCartStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return <main className="purchase-page" aria-busy="true" />;
  const total = totalEGP();
  const count = totalItems();
  return (
    <main className="purchase-page" dir="rtl">
      <div className="purchase-shell">
        <div className="purchase-topline">
          <Link href="/" className="purchase-back"><ArrowRight size={16} /> كمّل تسوّق</Link>
          <span>اختياراتك على ذوقك</span>
        </div>
        <PurchaseSteps current={1} />
        <header className="purchase-heading">
          <span className="purchase-kicker">كل اللي اخترته</span>
          <h1>سلّتك<span>.</span></h1>
          <p>راجع اختياراتك وكمّل طلبك على راحتك.</p>
        </header>
        {!items.length ? (
          <section className="purchase-empty">
            <div className="purchase-empty-icon"><ShoppingBag size={40} strokeWidth={1.4} /></div>
            <span className="purchase-kicker">وش ودّك تقتني؟</span>
            <h2>سلّتك تنتظر اختياراتك</h2>
            <p>ما أضفت شيء للحين. تصفّح الأجهزة واختر اللي يناسبك.</p>
            <Link className="purchase-primary" href="/">تصفّح الأجهزة <ArrowLeft size={18} /></Link>
          </section>
        ) : (
          <div className="purchase-layout">
            <div className="purchase-main">
              <section className="purchase-panel">
                <div className="purchase-section-heading"><h2><ShoppingBag size={20} /> اختياراتك</h2><span className="purchase-badge">{count} قطعة</span></div>
                <div className="basket-items">
                  {items.map((item) => <CartItem key={item.id || `${item.product._id}_${item.color || ""}_${item.storage || ""}`} item={item} onUpdateQty={updateQty} onRemove={removeItem} />)}
                </div>
              </section>
              <div className="purchase-banner">
                <span className="purchase-banner-icon"><Sparkles size={23} /></span>
                <div><h3>طلبك على وشك الاكتمال</h3><p>أكمل بياناتك وسنتواصل معك لتأكيد الطلب والتوصيل.</p></div>
                <ArrowLeft size={21} className="purchase-banner-arrow" />
              </div>
            </div>
            <aside className="purchase-summary">
              <span className="purchase-kicker">كل التفاصيل قدّامك</span>
              <h2>ملخص طلبك</h2>
              <dl className="purchase-totals">
                <div><dt>عدد القطع</dt><dd>{count} قطعة</dd></div>
                <div>
                  <dt>قيمة المنتجات</dt>
                  <dd className="flex items-center gap-1">
                    {formatEGP(total)} <PoundLabel size={18} />
                  </dd>
                </div>
              </dl>
              <div className="purchase-grand-total">
                <span>إجمالي السلة</span>
                <div className="flex flex-col items-end">
                  <strong className="flex items-center gap-1">
                    {formatEGP(total)} <PoundLabel size={22} />
                  </strong>
                  <PriceEquivalent amount={total} />
                </div>
              </div>
              <p className="purchase-caption">تفاصيل التوصيل تطلع لك بالخطوة الجاية.</p>
              <Link href="/checkout" className="purchase-primary">أكمل طلبك<ArrowLeft size={18} /></Link>
              <div className="purchase-footnote"><CreditCard size={16} /><span>الدفع عند الاستلام</span></div>
              <div className="purchase-summary-bottom"><PackageCheck size={20} /><p>راجع براحتك<span>تقدر تعدّل اختياراتك قبل ما تكمّل طلبك.</span></p></div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
