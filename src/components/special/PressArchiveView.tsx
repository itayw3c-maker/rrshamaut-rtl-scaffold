import { useMemo } from "react";
import { PageHero } from "@/components/PageHero";

interface PressCard {
  href: string;
  img?: string;
  logo?: string;
  title: string;
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
}

function parsePress(html: string): PressCard[] {
  // Find external news links; group with nearest image + title.
  const cards: PressCard[] = [];
  const linkRe = /<a[^>]+href="(https?:\/\/(?:www\.)?(?:ynet|maariv|israelhayom|globes|calcalist|mako|walla|n12|kikar|now14|inn)[^"]+)"[^>]*>/g;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    const href = m[1];
    if (seen.has(href)) continue;
    seen.add(href);
    // window: 3000 chars around match
    const start = Math.max(0, m.index - 3000);
    const end = Math.min(html.length, m.index + 3000);
    const win = html.slice(start, end);
    const imgs = Array.from(win.matchAll(/<img[^>]+src="([^"]+)"/g)).map((x) => x[1]);
    // pick screenshot (larger) and logo (smaller). Heuristic: first non-logo, first logo (has "logo")
    const img = imgs.find((u) => !/logo/i.test(u) && !u.endsWith(".svg")) || imgs[0];
    const logo = imgs.find((u) => /logo/i.test(u)) || imgs.find((u) => u !== img);
    const titleMatch = win.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
    const title = titleMatch
      ? decodeEntities(titleMatch[1].replace(/<[^>]+>/g, "").trim())
      : "לקריאת הכתבה";
    cards.push({ href, img, logo, title });
  }
  return cards;
}

export function PressArchiveView({ html }: { html: string }) {
  const cards = useMemo(() => parsePress(html), [html]);
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
                      alt=""
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
