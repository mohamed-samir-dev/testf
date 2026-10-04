"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IoCartOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { GoShieldCheck } from "react-icons/go";
import { MdOutlinePayment } from "react-icons/md";
import { BsCreditCard2Front } from "react-icons/bs";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";

import { formatEGP } from "../../lib/currency";
import PriceEquivalent from "../PriceEquivalent";

const formatStorage = (storage: string): string => {
  if (!storage) return storage;
  return storage
    .replace(/(\d+)\s*جيجابايت/gi, '$1 GB')
    .replace(/(\d+)\s*جيجا\s*بايت/gi, '$1 GB')
    .replace(/(\d+)\s*جيجا/gi, '$1 GB')
    .replace(/(\d+)\s*تيرابايت/gi, '$1 TB')
    .replace(/(\d+)\s*تيرا\s*بايت/gi, '$1 TB')
    .replace(/(\d+)\s*تيرا/gi, '$1 TB')
    .trim();
};

const API = process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app";
const resolveImg = (src: string) => {
  const clean = src.replace(/&amp;/g, "&");
  return clean.startsWith("http") ? clean : `${API}${clean.startsWith("/") ? clean : "/" + clean}`;
};

export default function ProductCard({ product, priority = false, zoomOnHover = false, prefetch }: { product: Product; priority?: boolean; zoomOnHover?: boolean; prefetch?: false }) {
  const { name, salePrice, discountPercent = 0, inStock } = product;
  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImg(image) : undefined;
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscount = salePrice != null && salePrice !== originalPrice;
  const displayPrice = hasDiscount ? salePrice! : originalPrice;
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState(false);
  // Track the redirect timer so we can clear it on unmount.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the pending redirect if the component unmounts before the timer fires.
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product);
    setAdded(true);
    setToast(true);
    // Clear any previous timer before setting a new one.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast(false);
      setAdded(false);
      window.scrollTo(0, 0);
      router.push("/cart");
    }, 1000);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-fade-in-down">
          <IoCheckmarkCircleOutline size={18} />
          تمت إضافة المنتج للسلة
        </div>
      )}

      <Link
        href={`/product/${product._id}`}
        prefetch={prefetch}
        dir="rtl"
        className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        {/* ── Image ── */}
        <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] bg-white overflow-hidden">
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={name}
              fill
              className="object-contain p-1.5 sm:p-3"
              sizes="(max-width: 640px) 55vw, (max-width: 1024px) 33vw, (max-width: 1152px) 25vw, 276px"
              quality={75}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">📱</div>
          )}

          {discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">غير متوفر</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-2 sm:p-3.5 gap-1.5 sm:gap-2.5">

          {/* Name */}
          <h3 className="text-[11px] sm:text-[13.5px] font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
            {name}
          </h3>

          {/* Badges */}
          {(product.storage || product.freeDelivery || product.warrantyYears >= 2) && (
            <div className="flex flex-wrap gap-1">
              {product.storage && (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {formatStorage(product.storage)}
                </span>
              )}
              {product.freeDelivery && (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 sm:px-2 py-0.5 rounded-full">
                  <TbTruckDelivery size={10} />توصيل مجاني
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-1 flex flex-col gap-0.5">
            {/* السعر الأساسي بالجنيه المصري */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-[15px] sm:text-[21px] font-black text-gray-900 leading-none tracking-tight">
                  {formatEGP(displayPrice)}
                </span>
                <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
                <PriceEquivalent amount={displayPrice} rate={product.exchangeRate} />
              </div>
              {hasDiscount && (
                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] text-gray-400 line-through font-medium">
                  {formatEGP(originalPrice)}
                  <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
                </span>
              )}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={
              `w-full flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[13px] font-bold py-1.5 sm:py-2.5 transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white"
                  : inStock
                  ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`
            }
          >
            {added ? (
              <><IoCheckmarkCircleOutline size={12} className="sm:w-[15px] sm:h-[15px]" />تمتالإضافة</>
            ) : inStock ? (
              <><IoCartOutline size={12} className="sm:w-[15px] sm:h-[15px]" />أضف للسلة</>
            ) : (
              <>غير متوفر</>
            )}
          </button>

        </div>
      </Link>
    </>
  );
}
