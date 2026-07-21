import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { QuickLeadBand } from "@/components/QuickLeadBand";
import { InlineCtaBand } from "@/components/SidebarCards";

interface QA {
  q: string;
  a: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function parseFaq(html: string): { items: QA[]; disclaimer: string } {
  const items: QA[] = [];
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
  // disclaimer: everything after the accordion widget's closing (paragraphs starting with ***)
  const discMatch = html.match(/(\*{2,}[\s\S]*?)(?:<\/section>|$)/);
  const disclaimer = discMatch ? discMatch[1] : "";
  return { items, disclaimer };
}

export function FaqView({ html }: { html: string }) {
  const { items, disclaimer } = parseFaq(html);
  const [open, setOpen] = useState<number>(0);

  return (
    <div dir="rtl">
      <PageHero title="שאלות ותשובות" />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-right"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-[hsl(var(--primary))] sm:text-lg">
                    {it.q}
                  </span>
                  <ChevronDown
                    className={`h-6 w-6 shrink-0 text-[hsl(var(--gold))] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div
                    className="prose prose-article max-w-none border-t border-border p-4 text-right"
                    dangerouslySetInnerHTML={{ __html: it.a }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {disclaimer && (
          <div
            className="prose prose-article mt-8 max-w-none text-right text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: disclaimer }}
          />
        )}
      </section>

      <QuickLeadBand />
      <InlineCtaBand />
    </div>
  );
}
