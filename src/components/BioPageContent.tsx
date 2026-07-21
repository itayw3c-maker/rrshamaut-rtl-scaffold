/**
 * Custom template for founder/staff bio pages.
 * 2-column layout: person photo beside bio text (stacked on mobile).
 * Extracts photo + subtitle + bio paragraphs from Elementor content.
 */
import { PageHero } from "@/components/PageHero";

type PageRow = { id: string; title: string; slug: string; content: string | null };

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractFirstImg(html: string): { src: string; alt: string } | null {
  const m = html.match(/<img[^>]*?src="([^"]+)"[^>]*?(?:alt="([^"]*)")?[^>]*>/i);
  if (!m) return null;
  return { src: m[1], alt: decodeEntities(m[2] || "") };
}

/** Subtitle = the first non-breadcrumb <p> inside a heading widget. */
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

/** Bio paragraphs = <p>...</p> inside text-editor widgets. Preserves <br />. */
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
      // Convert <br> to newline; strip other tags.
      const withBreaks = raw.replace(/<br\s*\/?>/gi, "\n");
      const txt = decodeEntities(withBreaks.replace(/<[^>]+>/g, "")).trim();
      if (txt) paras.push(txt);
    }
  }
  // Dedupe consecutive identical paragraphs.
  return paras.filter((p, i) => i === 0 || p !== paras[i - 1]);
}

export function BioPageContent({ page }: { page: PageRow }) {
  const html = page.content || "";
  const img = extractFirstImg(html);
  const subtitle = extractSubtitle(html);
  const paras = extractBioParagraphs(html);

  return (
    <>
      <PageHero title={page.title} />
      <section dir="rtl" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,300px)_1fr] md:gap-12 lg:gap-16">
            {img && (
              <div className="mx-auto w-full max-w-[300px] md:sticky md:top-24">
                <div className="overflow-hidden rounded-2xl border border-border bg-[hsl(var(--muted))] shadow-sm">
                  <img
                    src={img.src}
                    alt={img.alt || page.title}
                    className="block h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
            <div>
              {subtitle && (
                <p className="mb-3 text-lg font-semibold text-[hsl(var(--primary))] sm:text-xl">
                  {subtitle}
                </p>
              )}
              <div className="space-y-5 text-base leading-8 text-foreground sm:text-lg">
                {paras.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BioPageContent;
