export interface SlugConfig {
  label: string;
  parentLabel: string;
  parentHref: string;
  heroImage?: string;
  filters: {
    brand?: string;
    category?: string;
    nameIncludes?: string[];
    nameExcludes?: string[];
  };
}

export const categoryHeroImages: Record<string, string> = {
  // Smartphones
  "iphone-18-pro-max": "https://res.cloudinary.com/dllmx2yf3/image/upload/v1789348035/fc7c6460-6a02-40eb-86ef-3fa23b06c673_1_hccf4o.webp",
  "iphone-18-pro":"https://res.cloudinary.com/dllmx2yf3/image/upload/v1789347926/b23c542a-4cfb-400d-a99d-f02ed9b882d9_dfunoo.webp",
  "iphone-18-duo": "https://res.cloudinary.com/dllmx2yf3/image/upload/v1789348464/472da8f7-71d6-4978-ad76-27cbfa1b0103_phiizy.webp",
  "iphone-13-pro-max": "/i17p.webp",
  "iphone-14-pro-max": "/i17.webp",
  "iphone-14-pro": "/i15pl.webp",
  "iphone-14-plus": "/i15pl.webp",
  "iphone-14": "/i15pl.webp",
  "iphone-15-pro-max": "/i15p.webp",
  "iphone-15-pro": "/i15p.webp",
  "iphone-15-plus": "/i15pl.webp",
  "iphone-15": "/i15pl.webp",
  "iphone-16-pro-max": "/i16p.webp",
  "iphone-16-pro": "/i16p.webp",
  "iphone-16-plus": "/i-16p.webp",
  "iphone-16": "/i-16p.webp",
  "iphone-17-pro-max": "/i17p.webp",
  "iphone-17-pro": "/i17.webp",
  "iphone-17": "/i-17.webp",
  "iphone-17-air": "/i17-air.webp",
  "apple-only": "/re.webp",
  "samsung-s22-ultra": "/heroes/samsung-s22-ultra.webp",
  "samsung-s23-ultra": "/heroes/samsung-s23-ultra.webp",
  "samsung-s24-ultra": "/heroes/samsung-s24-ultra.webp",
  "samsung-s25": "/heroes/samsung-s25.webp",
  "samsung-s25-ultra": "/heroes/samsung-s25-ultra.webp",
  "samsung-galaxy-s26-ultra": "/heroes/samsung-galaxy-s26-ultra.webp",
  "samsung-galaxy-s26-plus": "/heroes/samsung-galaxy-s26-plus.webp",
  // Apple Watches
  se: "/se.webp",
  "smart-watches": "/heroes/smart-watches.webp",
  // Audio
  "airpods-pro": "/heroes/airpods-pro.webp",
  "airpods-max": "/heroes/airpods-max.webp",
  "samsung-buds": "/heroes/samsung-buds.webp",
  // PlayStation
  ps5: "/heroes/ps5.webp",
  "ps5-slim": "/heroes/ps4.webp",
  "xbox-one": "/heroes/xbox.webp",
  controllers: "/heroes/controllers.webp",
  // Laptops
  "macbook-pro": "/heroes/macbook-pro.webp",
  "macbook-air": "/mac.webp",
  // Tablets
  "ipad-pro": "/heroes/ipad-pro.webp",
  "ipad-air": "/ip.webp",
};

export const slugConfigs: Record<string, SlugConfig> = {
  // ─── Smartphones ───────────────────────────────────────────
  "iphone-13-pro-max": {
    label: "آيفون 13 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 13 برو ماكس" },
  },
  "iphone-14-pro-max": {
    label: "آيفون 14 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 14 برو ماكس" },
  },
  "iphone-14-pro": {
    label: "آيفون 14 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 14 برو" },
  },
  "iphone-14-plus": {
    label: "آيفون 14 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 14 بلس" },
  },
  "iphone-14": {
    label: "آيفون 14 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 14" },
  },
  "iphone-15-pro-max": {
    label: "آيفون 15 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 15 برو ماكس" },
  },
  "iphone-15-pro": {
    label: "آيفون 15 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { brand: "Apple", nameIncludes: ["15 Pro", "15 pro", "15 برو"] },
  },
  "iphone-15-plus": {
    label: "آيفون 15 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 15 بلس" },
  },
  "iphone-15": {
    label: "آيفون 15 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 15" },
  },
  "iphone-16-pro-max": {
    label: "ابل ايفون 16 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 16 برو ماكس" },
  },
  "iphone-16-pro": {
    label: "ابل ايفون 16 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ايفون 16 برو" },
  },
  "iphone-16-plus": {
    label: "ابل ايفون 16 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ايفون 16 بلس" },
  },
  "iphone-16": {
    label: "ابل ايفون 16 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ايفون 16" },
  },
  "iphone-17-pro-max": {
    label: "ابل ايفون 17 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 17 برو ماكس" },
  },
  "iphone-17-pro": {
    label: "ابل ايفون 17 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 17 برو" },
  },
  "iphone-17": {
    label: "ابل ايفون 17 عادي",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 17" },
  },
  "iphone-17-air": {
    label: "ابل ايفون 17 Air",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 17 اير" },
  },
  "iphone-18": {
    label: "آيفون 18",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: {
      category: "ابل ايفون 18",
      nameIncludes: ["iphone 18", "iPhone 18", "ايفون 18", "آيفون 18"],
    },
  },
  "iphone-18-pro-max": {
    label: "آيفون 18 برو ماكس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 18 برو ماكس" },
  },
  "iphone-18-pro": {
    label: "آيفون 18 برو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 18 برو" },
  },
  "iphone-18-duo": {
    label: "آيفون 18 دو",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "ابل ايفون 18 دو" },
  },
  "apple-only": {
    label: "فقط آبل",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { brand: "Apple" },
  },
  "samsung-s22-ultra": {
    label: "سامسونج جالكسي اس 22 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { brand: "Samsung", nameIncludes: ["s22", "S22", "اس 22", "جالكسي 22", "galaxy s22"] },
  },
  "samsung-s23-ultra": {
    label: "سامسونج جالكسي اس 23 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { brand: "Samsung", nameIncludes: ["s23", "S23", "اس 23", "جالكسي 23", "galaxy s23"] },
  },
  "samsung-s24-ultra": {
    label: "سامسونج جالكسي اس 24 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { brand: "Samsung", nameIncludes: ["s24", "S24", "اس 24", "جالكسي 24", "galaxy s24"] },
  },
  "samsung-s25": {
    label: "سامسونج جالاكسي S25",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { brand: "Samsung", nameIncludes: ["s25", "S25", "اس 25", "جالكسي 25", "galaxy s25"] },
  },
  "samsung-s25-ultra": {
    label: "سامسونج جالاكسي S25 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "سامسونج جالاكسي S25" },
  },
  "samsung-galaxy-s26-ultra": {
    label: "سامسونج جالاكسي S26 الترا",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "سامسونج جالاكسي S26 الترا" },
  },
  "samsung-galaxy-s26-plus": {
    label: "سامسونج جالاكسي S26 بلس",
    parentLabel: "الهواتف الذكية",
    parentHref: "/smartphones",
    filters: { category: "سامسونج جالاكسي S26" },
  },

  // ─── Apple Watches ─────────────────────────────────────────
  se: {
    label: "ساعات ابل",
    parentLabel: "ساعات ابل",
    parentHref: "/apple-watches",
    filters: { category: "ساعات ابل" },
  },

  // ─── Smart Watches ─────────────────────────────────────────
  "smart-watches": {
    label: "الساعات الذكية",
    parentLabel: "الساعات الذكية",
    parentHref: "/smart-watches",
    filters: { category: "ساعات ذكية" },
  },

  // ─── Audio ─────────────────────────────────────────────────
  "airpods-pro": {
    label: "سماعات أبل",
    parentLabel: "أجهزة صوت و سماعات",
    parentHref: "/audio",
    filters: { category: "سماعات ابل" },
  },
  "airpods-max": {
    label: "سماعات سبيكر",
    parentLabel: "أجهزة صوت و سماعات",
    parentHref: "/audio",
    filters: { category: "speaker" },
  },
  "samsung-buds": {
    label: "سماعات متنوعة",
    parentLabel: "أجهزة صوت و سماعات",
    parentHref: "/audio",
    filters: { category: "earbuds" },
  },

  // ─── PlayStation ───────────────────────────────────────────
  ps5: {
    label: "بلاي ستيشن 5",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "ps5" },
  },
  "ps5-slim": {
    label: "بلاي ستيشن 4",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "ps4" },
  },
  "xbox-one": {
    label: "أكس بوكس ون",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "xbox" },
  },
  controllers: {
    label: "يد تحكم",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "controller" },
  },
  "ps-accessories": {
    label: "ملحقات بلاي ستيشن",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "gaming-accessories" },
  },
  accessories: {
    label: "ملحقات بلاي ستيشن",
    parentLabel: "أجهزة بلاي ستيشن",
    parentHref: "/playstation",
    filters: { category: "gaming-accessories" },
  },

  // ─── Laptops ───────────────────────────────────────────────
  "macbook-pro": {
    label: "لابتوبات أبل",
    parentLabel: "لابتوبات وشاشات",
    parentHref: "/laptops",
    filters: { category: "laptop" },
  },
  "macbook-air": {
    label: "ماك بوك اير",
    parentLabel: "لابتوبات وشاشات",
    parentHref: "/laptops",
    filters: { category: "ماك بوك إير" },
  },
  "samsung-monitors": {
    label: "شاشات سامسونج",
    parentLabel: "لابتوبات وشاشات",
    parentHref: "/laptops",
    filters: { category: "monitor" },
  },

  // ─── Tablets ───────────────────────────────────────────────
  "ipad-pro": {
    label: "أبل",
    parentLabel: "الاجهزة اللوحية ايبادات",
    parentHref: "/tablets",
    filters: { category: "tablet" },
  },
  "ipad-air": {
    label: "ايبادات ابل",
    parentLabel: "الاجهزة اللوحية ايبادات",
    parentHref: "/tablets",
    filters: { brand: "Apple", nameIncludes: ["ipad air", "ايباد اير", "آيباد إير", "آيباد اير", "آيباد"] },
  },

  // ─── Accessories ───────────────────────────────────────────
  "anker-batteries": {
    label: "بطاريات متنقلة",
    parentLabel: "بطاريات متنقلة وكيابل",
    parentHref: "/accessories",
    filters: { category: "بطاريات متنقله" },
  },

  // ─── Games ─────────────────────────────────────────────────
  "ps5-games": {
    label: "ألعاب الفيديو",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "gaming" },
  },
  "mice-keyboards": {
    label: "ماوسات وكيبوردات ألعاب",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "mice-keyboards" },
  },
  microphones: {
    label: "مايكروفونات",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "microphone" },
  },
  figures: {
    label: "مجسمات وفيقرز",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "figures" },
  },
  "rgb-lighting": {
    label: "اضاءات RGB",
    parentLabel: "ألعاب الفيديو",
    parentHref: "/games",
    filters: { category: "rgb" },
  },
};
