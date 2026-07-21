import { PageHero } from "@/components/PageHero";
import type { PressCard } from "@/lib/content.functions";

export function PressArchiveView({ cards }: { cards: PressCard[] }) {
  return (
    <div dir="rtl">
      <PageHero title="כתבו עלינו" />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {cards.length === 0 ? (
          <p className="text-center text-muted-foreground">אין כתבות להצגה.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <a
                key={c.href}
                href={c.href}
                target="_blank"
                rel="noopener"
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="h-72 w-full overflow-hidden bg-[hsl(var(--muted))]">
                  {c.img && (
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
                  <h3 className="text-base font-bold leading-snug text-[hsl(var(--primary))]">
                    {c.title}
                  </h3>
                  {c.logo && (
                    <img src={c.logo} alt="" loading="lazy" className="h-8 object-contain" />
                  )}
                </div>
                <div className="bg-[hsl(var(--gold))] py-3 text-center text-sm font-bold text-white">
                  לקריאת המאמר ←
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
