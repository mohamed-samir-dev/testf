const ALLOWED_HOSTS = ["localhost", "burjjstorre.com", "burj-phone-backend.vercel.app"];
const ALLOWED_PREFIXES = [
  "/api/admin",
  "/api/products",
  "/api/checkout",
  "/api/revalidate",
];

// Computed once at module load — the API base never changes at runtime.
// Previously getApiBase() was called on every apiFetch() invocation,
// re-parsing and re-validating the URL each time.
function _computeApiBase(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  const raw = (process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app").replace(/\/$/, "");
  try {
    const { hostname } = new URL(raw);
    if (!ALLOWED_HOSTS.includes(hostname)) throw new Error(`Blocked host: ${hostname}`);
    return raw;
  } catch {
    return "http://localhost:5000";
  }
}

// getApiBase is kept for backward-compat callers outside this module.
// Internally we use the pre-computed _API constant.
export function getApiBase(): string {
  return _computeApiBase();
}

export const API = _computeApiBase();

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    throw new Error(`Blocked path: ${path}`);
  }
  const base = API;
  const url = base ? `${base}${path}` : path;
  return fetch(url, init);
}
