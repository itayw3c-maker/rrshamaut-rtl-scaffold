/**
 * Custom template for /damage-assessments-loss-adjusting/.
 * Replaces the flat Elementor dump with a proper 10-section layout.
 * Extracts intro + 3 service blocks from page.content, reuses shared
 * homepage sections and existing FAQ parser for the rest.
 */
import { PageHero } from "@/components/PageHero";
import { QuickLeadBand } from "@/components/QuickLeadBand";
import {
  TeamSection, WhyUsSection, SuccessesSection, HelpBand, ReviewsSection,
} from "@/components/home-sections";
import { parseFaq } from "@/components/special/FaqView";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
};

const H2_ANCHORS = {
  intro: "איך אנחנו יכולים לעזור",
  water: "שמאי נזקי מים",
  fire: "שמאי נזקי אש שריפה ופיח",
  property: "שמאי נזקי רכוש ומבנה",
  why: "למה לבחור בנו",
  faq: "שאלות ותשובות על שמאות פרטית",
} as const;

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
  const combined = parts.join(" ");
  // Strip tags, collapse whitespace
  return combined.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFirstImg(seg: string): { src: string; alt: string } | null {
  const m = seg.match(/<img[^>]+src="([^"]+)"[^>]*?(?:alt="([^"]*)")?[^>]*>/);
  if (!m) return null;
  return { src: m[1], alt: m[2] || "" };
}

type Block = { heading: string; text: string; img: { src: string; alt: string } | null };

function extractBlocks(html: string) {
  const intro = extractTextEditors(sliceBetween(html, H2_ANCHORS.intro, H2_ANCHORS.water));
  const mkBlock = (start: string, end: string, heading: string): Block => {
    const seg = sliceBetween(html, start, end);
    return { heading, text: extractTextEditors(seg), img: extractFirstImg(seg) };
  };
  const water = mkBlock(H2_ANCHORS.water, H2_ANCHORS.fire, "שמאי נזקי מים");
  const fire = mkBlock(H2_ANCHORS.fire, H2_ANCHORS.property, "שמאי נזקי אש שריפה ופיח");
  const property = mkBlock(H2_ANCHORS.property, H2_ANCHORS.why, "שמאי נזקי רכוש ומבנה");
  const faqSeg = sliceBetween(html, H2_ANCHORS.faq, "");
  return { intro, blocks: [water, fire, property], faqSeg };
}

function ServiceRow({ block, reverse }: { block: Block; reverse: boolean }) {
  return (
    <div
      dir="rtl"
      className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {block.img && (
        <div className="flex justify-center">
          <img
            src={block.img.src}
            alt={block.img.alt || block.heading}
            loading="lazy"
            className="w-full max-w-md rounded-2xl object-cover shadow-md"
          />
        </div>
      )}
      <div className="text-right">
        <h2 className="text-2xl font-extrabold text-[hsl(var(--primary))] sm:text-3xl">
          {block.heading}
        </h2>
        <div className="mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
        <p className="mt-5 text-base leading-relaxed text-[#4a4d55] sm:text-lg">
          {block.text}
        </p>
      </div>
    </div>
  );
}

function FaqBlock({ html }: { html: string }) {
  const { items } = parseFaq(html);
  const [open, setOpen] = useState<number>(0);
  if (items.length === 0) return null;
  return (
    <section dir="rtl" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">
          שאלות ותשובות על שמאות פרטית
        </h2>
        <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
        <div className="mt-10 space-y-3">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-right"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-[hsl(var(--primary))] sm:text-lg">{it.q}</span>
                  <ChevronDown className={`h-6 w-6 shrink-0 text-[hsl(var(--gold))] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="prose prose-article max-w-none border-t border-border p-4 text-right" dangerouslySetInnerHTML={{ __html: it.a }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServicePageContent({ page }: { page: PageRow }) {
  const html = page.content || "";
  const { intro, blocks, faqSeg } = extractBlocks(html);

  return (
    <div dir="rtl">
      <PageHero title={page.title} />

      <QuickLeadBand />

      {intro && (
        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">
              איך אנחנו יכולים לעזור?
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#4a4d55] sm:text-lg">
              {intro}
            </p>
          </div>
        </section>
      )}

      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8 sm:space-y-20">
          {blocks.map((b, i) => (
            <ServiceRow key={b.heading} block={b} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <WhyUsSection />

      <FaqBlock html={faqSeg} />

      <TeamSection />

      <SuccessesSection />

      <ReviewsSection />

      <HelpBand />
    </div>
  );
}

export default ServicePageContent;
