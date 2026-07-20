/**
 * Site configuration — code-DEFAULTS canonical model.
 * No DB settings table. Update here to change branding/contact info.
 */

export const SITE_URL = "https://www.rrshamaut.co.il";

/** Build an absolute canonical URL with trailing slash. Accepts decoded-Hebrew paths. */
export function canonicalUrl(path: string): string {
  let p = path || "/";
  if (!p.startsWith("/")) p = "/" + p;
  // Encode segments (skip already-encoded), preserve slashes.
  const encoded = p
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      try {
        // Re-encode after decode to normalize.
        return encodeURIComponent(decodeURIComponent(seg));
      } catch {
        return encodeURIComponent(seg);
      }
    })
    .join("/");
  const withSlash = encoded.endsWith("/") ? encoded : encoded + "/";
  return SITE_URL + withSlash;
}

export const siteConfig = {
  brandName: "רפאל שמאות רכוש",
  siteUrl: SITE_URL,

  // Brand assets (rehosted to Supabase Storage `media` bucket).
  logoDarkUrl:
    "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/brand/logo-dark.png",
  logoLightUrl:
    "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/brand/logo-light.webp",
  faviconUrl:
    "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/brand/favicon.png",
  ogImageUrl:
    "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/brand/og-image.png",

  // Contact
  phone: "077-805-1266",
  whatsapp: "972502629120",
  email: "office@rrshamaut.co.il",

  // Hours
  hours: [
    { days: "א׳-ה׳", time: "07:00-21:00" },
    { days: "ו׳", time: "07:00-16:00" },
    { days: "שבת", time: "סגור" },
  ],

  // Branches
  branches: [
    { name: "סניף דרום", addr: "הבנאים 5, א.ת אשדוד" },
    { name: "סניף צפון", addr: "השושנים 1, פוריה - נווה עובד" },
  ],

  coverage: "כל הארץ",

  // Brand colors (reference — canonical values live in src/styles.css tokens)
  colors: {
    primary: "#056FC4",
    accent: "#CC3366",
    navy: "#063760",
    navyAlt: "#144268",
    navyDeep: "#042D50",
    gold: "#CBA436",
    surface: "#F5F7FB",
    text: "#1F2023",
    body: "#333333",
  },
} as const;

export type SiteConfig = typeof siteConfig;
