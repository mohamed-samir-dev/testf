export interface StorageOption {
  storage: string;
  ram?: string;
  gpu?: string;
  chip?: string;
  size?: string;
  // EGP — السعر الأساسي (source of truth)
  originalPrice: number;
  salePrice?: number;
}

export interface ProductVariant {
  name: string;
  color: string;
  colorCode: string;
  defaultStorage?: string;
  images?: string[];
  storageOptions?: StorageOption[];
}

export interface ProductSection {
  _id?: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  content?: Record<string, unknown>;
  media?: {
    type: string;
    url: string;
    urlMobile?: string;
    poster?: string;
    alt?: string;
    title?: string;
    sortOrder: number;
  }[];
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  exchangeRate?: number;
  _id: string;
  name: string;
  brief?: string;

  // ── أسعار EGP (source of truth — ما يُخزن في DB) ──
  originalPrice: number;   // السعر قبل الخصم بالجنيه المصري
  salePrice?: number;      // سعر الخصم بالجنيه المصري (اختياري)


  // ── الحقول المحسوبة القديمة (للتوافق) ──
  price?: number;             // virtual: salePrice || originalPrice
  discountPercent?: number;   // virtual: نسبة الخصم

  description?: string;
  image?: string;
  images?: string[];
  color?: string;
  storage?: string;
  network?: string;
  screenSize?: string;
  overview?: string;
  overviewImage?: string;
  features?: {
    screenAndDesign?: string[];
    performance?: string[];
    battery?: string[];
    frontCamera?: string[];
    rearCamera?: string[];
    videoAndPhotography?: string[];
  };
  detailedSpecs?: Record<string, string>;
  specs?: {
    screen?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    rearCamera?: string;
    frontCamera?: string;
    battery?: string;
    batteryLife?: string;
    charging?: string;
    os?: string;
    extras?: string;
  };
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
  sections?: ProductSection[];
  freeDelivery: boolean;
  deliveryTime: string;
  warrantyYears: number;
  installment?: {
    available: boolean;
    downPayment?: number;
    months?: number;
    note?: string;
    conditions?: string[];
    policy?: string;
  };
  taxIncluded: boolean;
  category?: string;
  subCategory?: string;
  brand?: string;
  inStock: boolean;
  status?: "PRE_LAUNCH" | "AVAILABLE" | "OUT_OF_STOCK";
  purchasable?: boolean;
  hideDetails?: boolean;
  variants?: ProductVariant[];
}
