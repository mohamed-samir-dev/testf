import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, Package } from "lucide-react";
import type { CartItem as CartItemType } from "../../store/cartStore";
import { formatEGP } from "../../lib/currency";
import PriceEquivalent from "../../components/PriceEquivalent";

const API = process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app";

interface Props {
  item: CartItemType;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function PoundLabel({ size = 22 }: { size?: number }) {
  return (
    <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
  );
}

export default function CartItem({ item, onUpdateQty, onRemove }: Props) {
  const { product, qty, id, color, storage, priceEGP, price, image: itemImage } = item;
  // السعر الأساسي بالجنيه المصري
  const itemPriceEGP = priceEGP ?? price ?? product.salePrice ?? product.originalPrice ?? 0;
  // السعر المعادل بالجنيه مصري
  const raw = itemImage || product.images?.[0] || product.image;
  const image = raw
    ? raw.startsWith("http")
      ? raw
      : `${API}${raw.startsWith("/") ? raw : `/${raw}`}`
    : undefined;

  const displayColor = color || product.color;
  const displayStorage = storage || product.storage;
  const itemId = id || product._id;

  return (
    <article className="basket-item">
      <div className="basket-item-image">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 760px) 92px, 126px"
            className="object-contain p-2"
          />
        ) : <Package size={32} strokeWidth={1.4} />}
      </div>
      <div className="basket-item-info">
        <h3>
          <Link href={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="basket-item-specs">
          {displayStorage && <span>{displayStorage}</span>}
          {displayColor && <span>{displayColor}</span>}
        </div>
        <div className="basket-item-bottom">
          <div className="flex flex-col">
            <strong className="flex items-center gap-1">
              {formatEGP(itemPriceEGP * qty)}
              <PoundLabel size={22} />
              <PriceEquivalent amount={itemPriceEGP * qty} rate={product.exchangeRate} />
            </strong>
          </div>
          <div className="basket-qty">
            <button
              aria-label={`تقليل كمية ${product.name}`}
              disabled={qty <= 1}
              onClick={() => onUpdateQty(itemId, qty - 1)}
            >
              <Minus size={13} />
            </button>
            <output>{qty}</output>
            <button
              aria-label={`زيادة كمية ${product.name}`}
              onClick={() => onUpdateQty(itemId, qty + 1)}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
      <button
        className="basket-remove"
        aria-label={`حذف ${product.name}`}
        onClick={() => onRemove(itemId)}
      >
        <Trash2 size={16} />
      </button>
    </article>
  );
}
