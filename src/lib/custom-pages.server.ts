/**
 * Server-side extractors for the custom-template pages.
 * Runs inside resolveSlugFn so the giant raw Elementor `content` never
 * ships to the client for these 4 page types.
 */

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sliceBetween(html: string, start: string, end: string): string {
  const i = html.indexOf(start);
  if (i < 0) return "";
  const j = end ? html.indexOf(end, i + start.length) : -1;
  return j < 0 ? html.slice(i) : html.slice(i, j);
}

function extractTextEditors(seg: string): string {
  const re = /widget-text-editor[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(seg)) !== null) parts.push(m[1]);
  return parts.join(" ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFirstImg(seg: string): { src: string; alt: string } | null {
  const m = seg.match(/<img[^>]*?src="([^"]+)"[^>]*?(?:alt="([^"]*)")?[^>]*>/i);
  if (!m) return null;
  return { src: m[1], alt: decodeEntities(m[2] || "") };
}

const H2 = {
  intro: "איך אנחנו יכולים לעזור",
  water: "שמאי נזקי מים",
  fire: "שמאי נזקי אש שריפה ופיח",
  property: "שמאי נזקי רכוש ומבנה",
  why: "למה לבחור בנו",
  faq: "שאלות ותשובות על שמאות פרטית",
} as const;

export type ServiceBlock = {
  heading: string;
  text: string;
  img: { src: string; alt: string } | null;
};

export type ServicePageData = {
  intro: string;
  blocks: ServiceBlock[];
  faq: Array<{ q: string; a: string }>;
};

function parseFaqItems(html: string): Array<{ q: string; a: string }> {
  const items: Array<{ q: string; a: string }> = [];
  const parts = html.split(/<div class="elementor-accordion-item">/);
  for (const p of parts.slice(1)) {
    const t = p.match(/<a[^>]*class="elementor-accordion-title"[^>]*>([\s\S]*?)<\/a>/);
    const b = p.match(/<div[^>]*class="elementor-tab-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="elementor-accordion-item"|$)/);
    if (t) {
      items.push({
        q: decodeEntities(t[1].replace(/<[^>]+>/g, "").trim()),
        a: b ? b[1].trim() : "",
      });
    }
  }
  return items;
}

export function extractServicePage(html: string): ServicePageData {
  const intro = extractTextEditors(sliceBetween(html, H2.intro, H2.water));
  const mkBlock = (start: string, end: string, heading: string): ServiceBlock => {
    const seg = sliceBetween(html, start, end);
    return { heading, text: extractTextEditors(seg), img: extractFirstImg(seg) };
  };
  const blocks = [
    mkBlock(H2.water, H2.fire, "שמאי נזקי מים"),
    mkBlock(H2.fire, H2.property, "שמאי נזקי אש שריפה ופיח"),
    mkBlock(H2.property, H2.why, "שמאי נזקי רכוש ומבנה"),
  ];
  const faqSeg = sliceBetween(html, H2.faq, "");
  return { intro, blocks, faq: parseFaqItems(faqSeg) };
}

export type BioPageData = {
  img: { src: string; alt: string } | null;
  subtitle: string;
  paragraphs: string[];
};

function extractSubtitle(html: string): string {
  const re = /widget-heading[\s\S]*?<div class="elementor-widget-container">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const txt = decodeEntities(m[1].replace(/<[^>]+>/g, "")).trim();
    if (!txt) continue;
    if (/דף\s*הבית/.test(txt)) continue;
    return txt;
  }
  return "";
}

function extractBioParagraphs(html: string): string[] {
  const paras: string[] = [];
  const editorRe = /widget-text-editor[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = editorRe.exec(html)) !== null) {
    const inner = m[1];
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pm: RegExpExecArray | null;
    while ((pm = pRe.exec(inner)) !== null) {
      const raw = pm[1].trim();
      if (!raw) continue;
      const withBreaks = raw.replace(/<br\s*\/?>/gi, "\n");
      const txt = decodeEntities(withBreaks.replace(/<[^>]+>/g, "")).trim();
      if (txt) paras.push(txt);
    }
  }
  return paras.filter((p, i) => i === 0 || p !== paras[i - 1]);
}

export function extractBioPage(html: string): BioPageData {
  return {
    img: extractFirstImg(html),
    subtitle: extractSubtitle(html),
    paragraphs: extractBioParagraphs(html),
  };
}

export const CUSTOM_SERVICE_SLUG = "damage-assessments-loss-adjusting";
export const CUSTOM_CERT_SLUG = "תעודות";
export const CUSTOM_BIO_SLUGS = new Set([
  "השמאי-רפאל-ריבוח-מייסד-ובעלים",
  "השמאי-רפאל-ריבוח-מייסד-ובעלים-2",
  "המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו",
]);
