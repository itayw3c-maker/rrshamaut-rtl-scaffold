/**
 * Custom template for the /תעודות/ page ("הסמכות").
 * Renders a responsive grid of all certificate images rehosted to our media bucket,
 * with a click-to-enlarge lightbox. Ignores the raw Elementor markup in pages.content.
 */
import { useEffect, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { X } from "lucide-react";

type PageRow = { id: string; title: string; slug: string; content: string | null };

const CERTS: Array<{ url: string; alt: string }> = [
  { url: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6025/1-1.webp", alt: "תעודה 1" },
  { url: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6024/2-1.webp", alt: "תעודה 2" },
  { url: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6018/3-1.webp", alt: "תעודה 3" },
  { url: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6249/media-6249.webp", alt: "תעודת קורס שמאות רכוש" },
  { url: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/11/rectangle-45.png", alt: "הסמכה מקצועית" },
  { url: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/185/rectangle-45-2.png", alt: "הסמכה מקצועית" },
];

export function CertificatesContent({ page }: { page: PageRow }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <PageHero title={page.title || "הסמכות"} />
      <section dir="rtl" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mx-auto mb-10 max-w-3xl text-center text-base text-[hsl(var(--muted-foreground))] sm:text-lg">
            להלן ההסמכות והתעודות המקצועיות של רפאל שמאות רכוש. לחצו על כל תעודה להגדלה.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CERTS.map((c, i) => (
              <button
                key={c.url}
                type="button"
                onClick={() => setOpen(i)}
                className="group overflow-hidden rounded-xl border border-border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                aria-label={`הגדלת ${c.alt}`}
              >
                <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md bg-[hsl(var(--muted))]">
                  <img
                    src={c.url}
                    alt={c.alt}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-black hover:bg-white"
            aria-label="סגירה"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={CERTS[open].url}
            alt={CERTS[open].alt}
            className="max-h-[92vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default CertificatesContent;
