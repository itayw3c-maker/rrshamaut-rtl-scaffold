import { LeadForm } from "@/components/LeadForm";
import { linkSlug } from "@/lib/slug";
import { toYouTubeEmbed, youTubeThumb } from "@/lib/video";
import type { CptItem } from "@/lib/content.functions";

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export function CptItemView({ item }: { item: CptItem }) {
  const title = decodeEntities(item.title);
  const embed = toYouTubeEmbed(item.video_url);
  const isVideo = item.cpt_type === "movie" || item.cpt_type === "shorts";
  const relBase =
    item.cpt_type === "movie" ? "/movie/" : item.cpt_type === "shorts" ? "/shorts/" : "/success/";

  return (
    <article dir="rtl">
      <header className="border-b border-border bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-7xl px-4 py-8 text-right sm:px-6 sm:py-12 lg:px-8">
          <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {isVideo && embed && (
              <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-md">
                <iframe
                  src={embed}
                  title={title}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
            {isVideo && !embed && item.cover_url && (
              <img
                src={item.cover_url}
                alt=""
                className="mb-8 w-full rounded-xl border border-border object-cover"
              />
            )}
            {!isVideo && item.cover_url && (
              <img
                src={item.cover_url}
                alt=""
                className="mb-8 w-full rounded-xl border border-border object-cover"
              />
            )}

            {item.content && (
              <div
                className="prose prose-article max-w-none text-right"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-24">
              {item.related.length > 0 && (
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-lg font-bold text-[hsl(var(--primary))]">
                    {isVideo ? "עוד סרטונים" : "עוד הצלחות"}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {item.related.slice(0, 5).map((r) => {
                      const thumb = r.cover_url || youTubeThumb(r.video_url);
                      return (
                        <li key={r.slug}>
                          <a href={`${relBase}${linkSlug(r.slug)}`} className="group flex items-start gap-3">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                loading="lazy"
                                className="h-14 w-20 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <div className="h-14 w-20 shrink-0 rounded bg-[hsl(var(--muted))]" />
                            )}
                            <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--primary))] line-clamp-3">
                              {decodeEntities(r.title)}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-[hsl(var(--primary))]">צריכים ייעוץ?</h2>
                <p className="mt-1 text-sm text-muted-foreground">השאירו פרטים ונחזור אליכם</p>
                <div className="mt-4">
                  <LeadForm variant="sidebar" submitLabel="חיזרו אלי!" />
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
