import CustomerReviews from "./CustomerReviews";

// Server Component wrapper — runs at ISR time (inherits revalidate:300 from page.tsx).
// Fetches approved reviews server-side so CustomerReviews receives initialReviews
// and skips its browser fetch entirely.
//
// This eliminates GET /api/reviews as a Vercel Function invocation per homepage visit.
// The fetch here uses Next.js Data Cache (revalidate:300) so MongoDB is only
// queried once per 5 minutes, not once per user visit.
//
// Cache behavior: Expected from configuration, not verified by Vercel telemetry.

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  gender: string;
  createdAt: string;
}

export default async function CustomerReviewsServer() {
  let reviews: Review[] = [];

  try {
    const res = await fetch(`${BACKEND}/api/admin/reviews`, {
      cache: "force-cache",
      next: { revalidate: 18000, tags: ["reviews"] },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) reviews = data;
    }
  } catch {
    // Fallback: CustomerReviews renders with empty array (shows "no reviews yet" state)
  }

  return <CustomerReviews initialReviews={reviews} />;
}
