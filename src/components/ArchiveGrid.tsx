import { linkSlug } from "@/lib/slug";
import { appHref } from "@/lib/href";
import { youTubeThumb } from "@/lib/video";
import type { ArchiveItem } from "@/lib/content.functions";

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export function ArchiveGrid({
  items,
  type,
}: {
  items: ArchiveItem[];
  type: "movie" | "success";
}) {
  const base = type === "movie" ? "/movie/" : "/success/";
  if (!items.length) return null;
  return (
    <section dir="rtl" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const thumb = it.cover_url || youTubeThumb(it.video_url);
          return (
            <a
              key={it.slug}
              href={appHref(`${base}${linkSlug(it.slug)}`)}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[hsl(var(--muted))]">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--navy))] text-white">
                    <span className="text-3xl font-black">RR</span>
                  </div>
                )}
                {type === "movie" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow-lg">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-[hsl(var(--primary))]">
                  {decodeEntities(it.title)}
                </h3>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
