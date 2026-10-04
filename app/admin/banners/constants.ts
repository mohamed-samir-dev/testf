// FIX #7: API base URL removed from this file.
// It was only used to prefix banner image src values in BannerCard, but
// all banner URLs stored in the DB are already absolute (https://…).
// Exposing NEXT_PUBLIC_API_URL here included the backend origin in every
// client bundle — unnecessary for a pure admin UI that only talks through
// Next.js API routes (/api/…).

export const LABELS = [
  "البانر الأول", "البانر الثاني", "البانر الثالث", "البانر الرابع",
  "البانر الخامس", "البانر السادس", "البانر السابع", "البانر الثامن",
  "البانر التاسع", "البانر العاشر",
];
