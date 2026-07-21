import { useMemo, useState } from "react";
import { PageHero } from "@/components/PageHero";

const TAB_NAMES = ["נזקי מים", "נזקי אש", "נזקי מלחמה", "הערכות שווי"];

function parseGallery(html: string): string[][] {
  // split on tab content markers
  const panels = html.split(/<div[^>]*id="e-n-tab-content-[^"]+"/);
  const groups: string[][] = [];
  for (const p of panels.slice(1)) {
    const imgs = Array.from(p.matchAll(/data-thumbnail="([^"]+)"/g)).map((m) => m[1]);
    // dedupe
    groups.push(Array.from(new Set(imgs)));
  }
  while (groups.length < 4) groups.push([]);
  return groups.slice(0, 4);
}

export function GalleryView({ html }: { html: string }) {
  const groups = useMemo(() => parseGallery(html), [html]);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div dir="rtl">
      <PageHero title="גלריה" />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {TAB_NAMES.map((n, i) => {
            const isActive = active === i;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-full px-6 py-2.5 text-base font-bold transition ${
                  isActive
                    ? "bg-[hsl(var(--gold))] text-white shadow-md"
                    : "bg-[hsl(var(--primary))] text-white opacity-80 hover:opacity-100"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(groups[active] || []).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(src)}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-72 w-full object-cover transition group-hover:scale-105"
              />
            </button>
          ))}
        </div>
        {(groups[active] || []).length === 0 && (
          <p className="text-center text-muted-foreground">אין תמונות בכרטיסייה זו.</p>
        )}
      </section>

      {lightbox && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-[95vw] rounded-lg" />
          <button
            type="button"
            className="absolute top-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-black"
            onClick={() => setLightbox(null)}
          >
            סגור ✕
          </button>
        </div>
      )}
    </div>
  );
}
