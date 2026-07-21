/**
 * Custom template for /damage-assessments-loss-adjusting/.
 * Structured props are extracted server-side (see custom-pages.server.ts)
 * so the giant raw Elementor `content` is not shipped to the client.
 */
import { PageHero } from "@/components/PageHero";
import { QuickLeadBand } from "@/components/QuickLeadBand";
import {
  TeamSection, WhyUsSection, SuccessesSection, HelpBand, ReviewsSection,
} from "@/components/home-sections";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ServicePageData, ServiceBlock } from "@/lib/custom-pages.server";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  service?: ServicePageData;
};

function ServiceRow({ block, reverse }: { block: ServiceBlock; reverse: boolean }) {
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

function FaqBlock({ items }: { items: Array<{ q: string; a: string }> }) {
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
  const data = page.service ?? { intro: "", blocks: [], faq: [] };
  const { intro, blocks, faq } = data;

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

      <FaqBlock items={faq} />

      <TeamSection />

      <SuccessesSection />

      <ReviewsSection />

      <HelpBand />
    </div>
  );
}

export default ServicePageContent;
