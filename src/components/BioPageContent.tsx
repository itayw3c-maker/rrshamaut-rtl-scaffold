/**
 * Custom template for founder/staff bio pages.
 * Structured props are extracted server-side (see custom-pages.server.ts).
 */
import { PageHero } from "@/components/PageHero";
import type { BioPageData } from "@/lib/custom-pages.server";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  bio?: BioPageData;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const BIO_TITLE_OVERRIDES: Record<string, string> = {
  "השמאי-רפאל-ריבוח-מייסד-ובעלים-2": "השמאי רפאל ריבוח",
  "המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו": "המהנדס והשמאי ארז אריה",
  "השמאי-רפאל-ריבוח-מייסד-ובעלים": "עו\"ד קובי ליבוביץ'",
};

export function BioPageContent({ page }: { page: PageRow }) {
  const { img = null, subtitle = "", paragraphs = [] } = page.bio ?? {};
  const heroTitle = BIO_TITLE_OVERRIDES[page.slug] ?? decodeEntities(page.title);

  return (
    <>
      <PageHero title={heroTitle} />
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
                {paragraphs.map((p, i) => (
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
