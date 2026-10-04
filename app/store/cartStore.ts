import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  id: string;
  product: Product;
  qty: number;
  color?: string;
  storage?: string;
  // السعر الأساسي بالجنيه المصري (source of truth)
  priceEGP: number;
  // السعر المقابل بالجنيه المصري (قادم من Backend)
  // الحقل القديم للتوافق مع مكونات تستخدمه
  price?: number;
  image?: string;
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  months: number;
  downPayment: number;
}

interface CartState {
  items: CartItem[];
  customer: CustomerInfo | null;
  addItem: (
    product: Product,
    qty?: number,
    variant?: {
      color?: string;
      storage?: string;
      priceEGP?: number;
      /** @deprecated استخدم priceEGP */
      price?: number;
      image?: string;
    }
  ) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  clear: () => void;
  totalItems: () => number;
  /** إجمالي السلة بالجنيه المصري */
  totalEGP: () => number;
  /** @deprecated استخدم totalEGP */
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,

      addItem: (product, qty = 1, variant) =>
        set((s) => {
          const color = variant?.color || product.color || "";
          const storage = variant?.storage || product.storage || "";

          // السعر بالجنيه المصري — source of truth
          const priceEGP =
            variant?.priceEGP !== undefined
              ? variant.priceEGP
              : variant?.price !== undefined
              ? variant.price
              : product.salePrice ?? product.originalPrice ?? product.price ?? 0;

          // السعر بالجنيه مصري — قادم من Backend


          const image =
            variant?.image ||
            product.images?.[0] ||
            (product as { image?: string }).image ||
            "";

          const itemId = `${product._id}_${color}_${storage}`.replace(/\s+/g, "-");

          const existingIndex = s.items.findIndex(
            (i) =>
              i.id === itemId ||
              (!i.id &&
                i.product._id === product._id &&
                (i.color || "") === color &&
                (i.storage || "") === storage)
          );

          if (existingIndex > -1) {
            const updated = [...s.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              qty: updated[existingIndex].qty + qty,
              priceEGP,
              price: priceEGP, // للتوافق
              image: image || updated[existingIndex].image,
            };
            return { items: updated };
          }

          // نحفظ نسخة مختصرة من المنتج
          const cleanProduct: Product = {
            _id: product._id,
            name: product.name,
            exchangeRate: product.exchangeRate,
            originalPrice: product.originalPrice,
            salePrice: product.salePrice,
            price: product.price,
            image: product.image,
            images: Array.isArray(product.images) ? product.images.slice(0, 3) : [],
            category: product.category,
            subCategory: product.subCategory,
            brand: product.brand,
            color: product.color,
            storage: product.storage,
            inStock: product.inStock,
            freeDelivery: product.freeDelivery,
            deliveryTime: product.deliveryTime,
            warrantyYears: product.warrantyYears,
            installment: product.installment,
            discountPercent: product.discountPercent,
            taxIncluded: product.taxIncluded,
          };

          return {
            items: [
              ...s.items,
              {
                id: itemId,
                product: cleanProduct,
                qty,
                color,
                storage,
                priceEGP,
                price: priceEGP, // للتوافق
                image,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id && i.product._id !== id),
        })),

      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id && i.product._id !== id)
              : s.items.map((i) =>
                  i.id === id || i.product._id === id ? { ...i, qty } : i
                ),
        })),

      setCustomer: (info) => set({ customer: info }),
      clear: () => set({ items: [], customer: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      totalEGP: () =>
        get().items.reduce((sum, i) => sum + (i.priceEGP ?? i.price ?? 0) * i.qty, 0),



      /** @deprecated استخدم totalEGP */
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + (i.priceEGP ?? i.price ?? 0) * i.qty, 0),
    }),
    { name: "cart-storage-egp-v2", version: 2 }
  )
);
