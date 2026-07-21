import { PageHero } from "@/components/PageHero";
import { linkSlug } from "@/lib/slug";
import type { CategoryPayload } from "@/lib/content.functions";

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export function CategoryView({ category }: { category: CategoryPayload }) {
  return (
    <div dir="rtl">
      <PageHero title="מאמרים" crumbs={[{ label: "קטגוריות" }, { label: decodeEntities(category.name) }]} />



      {category.description && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div
              className="prose prose-article max-w-none text-right"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {category.posts.length === 0 ? (
          <p className="text-center text-muted-foreground">אין עדיין מאמרים בקטגוריה זו.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.posts.map((p) => (
              <a
                key={p.slug}
                href={`/${linkSlug(p.slug)}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[hsl(var(--muted))]">
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--navy))] text-white">
                      <span className="text-3xl font-black">RR</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-[hsl(var(--primary))]">
                    {decodeEntities(p.title)}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {decodeEntities(p.excerpt.replace(/<[^>]+>/g, ""))}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
