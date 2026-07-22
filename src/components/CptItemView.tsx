import { PageHero } from "@/components/PageHero";
import { SidebarPhoneCard, SidebarLeadForm } from "@/components/SidebarCards";
import { linkSlug } from "@/lib/slug";
import { appHref } from "@/lib/href";
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
  const crumbLabel = isVideo ? "סרטונים" : "ההצלחות שלנו";
  const crumbTo = isVideo ? "/סרטונים" : "/ההצלחות-שלנו";

  return (
    <article dir="rtl">
      <PageHero title={title} crumbs={[{ label: crumbLabel, to: crumbTo }]} />

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
            {!embed && item.cover_url && (
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
            <div className="space-y-6 lg:sticky lg:top-24">
              <SidebarPhoneCard />
              <SidebarLeadForm />
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
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
