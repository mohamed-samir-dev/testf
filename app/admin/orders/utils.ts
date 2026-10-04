// ---------------------------------------------------------------------------
// Shared utilities for the /admin/orders feature.
//
// WHY MODULE-LEVEL CONSTANTS:
// Instantiating Intl.DateTimeFormat / Intl.NumberFormat inside a render
// function or loop allocates a new object on every call.  With 25+ rows
// rendered per page that is 25+ allocations per render.  Hoisting them here
// means the objects are created exactly ONCE at module load time and reused
// on every subsequent call — zero per-render CPU cost.
// ---------------------------------------------------------------------------

/** Format a date string as a short Arabic locale date. */
const DATE_FORMATTER = new Intl.DateTimeFormat("ar-EG", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function formatDateShort(iso: string): string {
  try {
    return DATE_FORMATTER.format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Format a date as a full Arabic weekday + month name string. */
const DAYS_AR   = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                   "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function formatDateLong(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const period = h >= 12 ? "م" : "ص";
    const hour   = (h % 12 || 12).toString().padStart(2, "0");
    return `${DAYS_AR[d.getDay()]} ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()} | ${hour}:${m} ${period}`;
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// toArabicWords — single canonical implementation used by receipt, contract,
// and ReceiptVoucher.  Previously duplicated in three separate files.
// WHY: eliminates ~70 lines of duplicated code and one source of truth for
// the number-to-words conversion, which is pure CPU work done at render time.
// ---------------------------------------------------------------------------
export function toArabicWords(n: number): string {
  const ones = [
    "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر",
    "سبعة عشر", "ثمانية عشر", "تسعة عشر",
  ];
  const tens     = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  if (n === 0) return "صفر";
  if (n < 0)   return "سالب " + toArabicWords(-n);

  let result = "";
  if (n >= 1000) {
    const t = Math.floor(n / 1000);
    result += (t === 1 ? "ألف" : t === 2 ? "ألفان" : t <= 10 ? toArabicWords(t) + " آلاف" : toArabicWords(t) + " ألف") + " ";
    n %= 1000;
    if (n > 0) result += "و";
  }
  if (n >= 100) { result += hundreds[Math.floor(n / 100)] + " "; n %= 100; if (n > 0) result += "و"; }
  if (n >= 20)  { result += tens[Math.floor(n / 10)]     + " "; n %= 10;  if (n > 0) result += "و"; }
  if (n > 0)    { result += ones[n] + " "; }
  return result.trim();
}
