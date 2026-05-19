const FALLBACK_SITE_URL = "https://2026-school-fair.vercel.app";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;

export function getSiteOrigin() {
  try {
    return new URL(SITE_URL).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
