// utils/media.ts
const BASE_URL = "https://backend-v2-production-789a.up.railway.app";

export const resolveMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // "/uploads/..." 같은 상대경로 대응
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
