import BannerSlider from "./BannerSlider";

const API = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";

export default async function Banner() {
  let images: string[] = [];

  try {
    // revalidate: 18000 — banners change infrequently (few times per week at most).
    // tag:"banners" — admin mutation routes call revalidateTag("banners") so the
    // cache is flushed immediately on any change without waiting the full hour.
    //
    // CRITICAL FIX: was previously revalidate:0 which opted the entire homepage
    // OUT of ISR/Full Route Cache, forcing server-side execution on every request
    // and accounting for a large fraction of the 528ms Active CPU P75.
    const res = await fetch(`${API}/api/admin/banners`, {
      next: { revalidate: 18000, tags: ["banners"] },
    });
    if (!res.ok) throw new Error("banners fetch failed");
    const data: { url: string; active: boolean }[] = await res.json();
    if (Array.isArray(data)) {
      images = data
        .filter((b) => b.url && b.active)
        .map((b) => {
          const full = b.url.startsWith("http") ? b.url : `${API}${b.url}`;
          if (full.includes("cloudinary.com") && !full.includes("/f_auto,q_auto/")) {
            return full.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
          }
          return full;
        });
    }
  } catch {
    images = ["/banner1.webp", "/banner2.webp"];
  }

  if (!images.length) {
    return (
      <section className="w-full flex justify-center py-6 px-4">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-gray-200"
          style={{ maxWidth: 2048, aspectRatio: "2048/700" }}
        />
      </section>
    );
  }

  return <BannerSlider images={images} />;
}
