import { PageHero } from "@/components/PageHero";
import type { PressCard } from "@/lib/content.functions";

export function PressArchiveView({ cards }: { cards: PressCard[] }) {
  return (
    <div dir="rtl">
      <PageHero title="כתבו עלינו" />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {cards.length === 0 ? (
          <p className="text-center text-muted-foreground">אין כתבות להצגה.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <a
                key={`${c.href}-${i}`}
                href={c.href}
                target="_blank"
                rel="noopener nofollow"
                className="group flex flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm transition hover:shadow-lg"
              >
                {/* Portrait screenshot area */}
                <div className="w-full overflow-hidden bg-[hsl(var(--muted))]">
                  {c.img && (
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      className="block h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                {/* Title */}
                <div className="flex flex-col items-center gap-3 px-4 pt-5 pb-3 text-center">
                  <h3 className="text-[15px] font-bold leading-snug text-[hsl(var(--primary))] sm:text-base">
                    {c.title}
                  </h3>
                  {c.excerpt && (
                    <p className="text-[13px] leading-relaxed text-[#555]">
                      {c.excerpt}
                    </p>
                  )}
                </div>
                {/* Publisher logo */}
                <div className="mt-auto flex items-center justify-center px-4 pb-4 pt-2">
                  {c.logo && (
                    <img
                      src={c.logo}
                      alt=""
                      loading="lazy"
                      className="h-14 w-auto object-contain"
                    />
                  )}
                </div>
                {/* Gold CTA bar */}
                <div
                  className="py-3 text-center text-[16px] font-bold text-white"
                  style={{ backgroundColor: "hsl(var(--gold))" }}
                >
                  לקריאת המאמר
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
