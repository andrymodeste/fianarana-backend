const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export function photoUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE}${url}`;
}
