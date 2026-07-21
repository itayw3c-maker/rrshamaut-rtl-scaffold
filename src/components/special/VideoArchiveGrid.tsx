import { linkSlug } from "@/lib/slug";
import { toYouTubeEmbed } from "@/lib/video";
import type { ArchiveItem } from "@/lib/content.functions";

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

export function VideoArchiveGrid({ items }: { items: (ArchiveItem & { cpt_type?: string })[] }) {
  if (!items.length) return null;
  return (
    <section dir="rtl" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const embed = toYouTubeEmbed(it.video_url);
          const cpt = (it as { cpt_type?: string }).cpt_type || "movie";
          const base = cpt === "shorts" ? "/shorts/" : "/movie/";
          return (
            <div key={`${cpt}-${it.slug}`} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="aspect-video w-full bg-black">
                {embed ? (
                  <iframe
                    src={embed}
                    title={it.title}
                    loading="lazy"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : it.cover_url ? (
                  <img src={it.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white">אין תצוגה</div>
                )}
              </div>
              <a href={`${base}${linkSlug(it.slug)}`} className="block bg-white p-3 text-center">
                <h3 className="line-clamp-2 text-sm font-bold text-[hsl(var(--primary))] hover:underline">
                  {decodeEntities(it.title)}
                </h3>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SuccessArchiveGrid({ items }: { items: ArchiveItem[] }) {
  if (!items.length) return null;
  return (
    <section dir="rtl" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center text-2xl font-extrabold text-[hsl(var(--primary))] sm:text-3xl">
        <span className="border-b-4 border-[hsl(var(--gold))] pb-2">תוצאות שהשגנו ללקוחותינו</span>
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <a
            key={it.slug}
            href={`/success/${linkSlug(it.slug)}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-72 items-center justify-center overflow-hidden bg-white">
              {it.cover_url ? (
                <img src={it.cover_url} alt="" loading="lazy" className="h-full w-full object-contain p-3" />
              ) : (
                <span className="text-3xl font-black text-[hsl(var(--primary))]">RR</span>
              )}
            </div>
            <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
              <h3 className="text-base font-bold leading-snug text-[hsl(var(--primary))]">
                {decodeEntities(it.title)}
              </h3>
              <span className="mt-auto inline-flex items-center rounded-full bg-[hsl(var(--gold))] px-5 py-2 text-sm font-bold text-white">
                לפרטים ←
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
