import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Droplets, Flame, CloudRain, Home as HomeIcon, ShieldAlert, Scale,
  Lock, Gem, HardHat, Landmark, Car, Armchair,
  HeartHandshake, Award, Network, TrendingUp, Users,
} from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { LeadForm } from "@/components/LeadForm";
import { getHomeVideosFn, type HomeVideo } from "@/lib/home.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "רפאל שמאות רכוש - שמאי ביטוח פרטי לתביעות רכוש" },
      {
        name: "description",
        content:
          "משרד שמאי רכוש פרטי המייצג מבוטחים מול חברות הביטוח. ייעוץ ראשוני חינם, טיפול בנזקי מים, אש, טבע, פריצה והערכות שווי. עבודה על בסיס הצלחה.",
      },
      { property: "og:title", content: "רפאל שמאות רכוש - שמאי ביטוח פרטי" },
      {
        property: "og:description",
        content: "ייצוג מבוטחים מול חברות הביטוח. ייעוץ ראשוני חינם.",
      },
    ],
  }),
  component: HomePage,
});

const services: Array<{ title: string; href: string; Icon: any; gradient: string }> = [
  { title: "ייעוץ וליווי תביעות ביטוח", href: "/ייעוץ-וליווי-תביעות-ביטוח", Icon: HeartHandshake, gradient: "from-[hsl(var(--primary))] to-[#063760]" },
  { title: "נזקי מים הצפה ורטיבות", href: "/נזקי-מים-הצפה-ורטיבות", Icon: Droplets, gradient: "from-[#0891b2] to-[hsl(var(--primary))]" },
  { title: "נזקי אש ופיח", href: "/נזקי-אש-ופיח", Icon: Flame, gradient: "from-[#dc2626] to-[hsl(var(--accent))]" },
  { title: "נזקי טבע שיטפונות וסערה", href: "/נזקי-טבע-שיטפונות-וסערה", Icon: CloudRain, gradient: "from-[#0369a1] to-[#063760]" },
  { title: "נזקי שוכרים", href: "/נזקי-שוכרים", Icon: HomeIcon, gradient: "from-[hsl(var(--primary))] to-[#144268]" },
  { title: 'חו"ד קבילה משפטית', href: "/חוד-קבילה-משפטית", Icon: Scale, gradient: "from-[#063760] to-[hsl(var(--primary))]" },
  { title: "נזקי פריצה", href: "/נזקי-פריצה", Icon: Lock, gradient: "from-[#1f2937] to-[#063760]" },
  { title: "הערכת שווי רכוש", href: "/הערכת-שווי-רכוש", Icon: Gem, gradient: "from-[hsl(var(--gold))] to-[#a17a1f]" },
  { title: "נזקי עבודות קבלניות", href: "/נזקי-עבודות-קבלניות", Icon: HardHat, gradient: "from-[#b45309] to-[hsl(var(--gold))]" },
  { title: "הערכת רכוש לצורכי הזדכות במס שבח", href: "/הערכת-רכוש-לצורכי-הזדכות-במס-שבח", Icon: Landmark, gradient: "from-[#063760] to-[hsl(var(--accent))]" },
  { title: "נזקי התנגשות", href: "/נזקי-התנגשות", Icon: Car, gradient: "from-[hsl(var(--accent))] to-[#7f1d3d]" },
  { title: "הערכת שמאות לריהוט עתיק", href: "/הערכת-שמאות-לריהוט-עתיק", Icon: Armchair, gradient: "from-[#7c2d12] to-[hsl(var(--gold))]" },
];

const team = [
  { name: "רפאל ריבוח", role: "שמאי רכוש · מייסד ובעלים", href: "/about/רפאל-ריבוח", initial: "ר" },
  { name: "אינג׳ ארז אריה", role: "מהנדס ושמאי", href: "/about/ארז-אריה", initial: "א" },
  { name: 'עו"ד קובי ליבוביץ׳', role: "יועץ משפטי", href: "/about/קובי-ליבוביץ", initial: "ק" },
];

const whyUs = [
  { Icon: HeartHandshake, title: "שקט נפשי אמיתי", desc: "עובדים על בסיס הצלחה - לא קיבלתם פיצוי, לא שילמתם." },
  { Icon: Award, title: "מקצועיות מהשטח", desc: "ניסיון רב ומוכח בשמאות רכוש ובטיפול בנזקי רכוש מורכבים." },
  { Icon: Network, title: "הבנה מערכתית מלאה", desc: "היכרות מעמיקה עם עולם הביטוח והמשפט בתביעות רכוש, כולל אופן הפעולה של חברות הביטוח." },
  { Icon: TrendingUp, title: "מקסום התוצאה עבורכם", desc: "ידע ויכולות מקצועיות מתקדמות שמטרתן להגדיל משמעותית את היקף הפיצוי המגיע לכם." },
  { Icon: Users, title: "נאמנות לצד שלכם בלבד", desc: "אנו לא עובדים עבור חברות ביטוח - רק עבור מבוטחים." },
];

function encHref(h: string) {
  const [path, ...rest] = h.split("#");
  return encodeURI(path) + (rest.length ? "#" + rest.join("#") : "");
}

function youtubeIdFrom(url: string | null): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function HomePage() {
  const { data: videos = [] } = useQuery<HomeVideo[]>({
    queryKey: ["home-videos"],
    queryFn: () => getHomeVideosFn(),
    staleTime: 5 * 60_000,
  });

  return (
    <SiteChrome>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#063760] via-[#0a4b82] to-[hsl(var(--primary))] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20 lg:px-8">
          <div className="order-1 lg:order-1 text-right">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              אל תתמודדו לבד מול חברת הביטוח!
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90">
              שמאי הביטוח מטעם החברה פועל לקידום האינטרסים שלה, בעוד שבחירה בשמאי רכוש פרטי מעניקה לכם ייצוג אמיתי, הערכה מקצועית ומעמד שווה מול חברת הביטוח.
            </p>
            <p className="mt-4 text-base font-medium text-[hsl(var(--gold))]">
              משרדנו חבר באיגוד השמאים בישראל ומחזיק בתו איכות השירות.
            </p>
          </div>
          <div className="order-2 lg:order-2">
            <div className="rounded-2xl bg-white p-6 text-foreground shadow-2xl sm:p-8">
              <h2 className="text-2xl font-bold text-[hsl(var(--primary))]">צריכים שמאי רכוש?</h2>
              <p className="mt-1 text-sm text-muted-foreground">ייעוץ טלפוני ראשוני בחינם</p>
              <div className="mt-5">
                <LeadForm variant="hero" submitLabel="לייעוץ חינם" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-[hsl(var(--primary))] sm:text-4xl">
            הנושאים בהם משרדנו עוסק
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <a
                key={s.title}
                href={encHref(s.href)}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-40 w-full items-center justify-center bg-gradient-to-bl ${s.gradient}`}>
                  <s.Icon className="h-16 w-16 text-white/95" strokeWidth={1.5} />
                </div>
                <div className="p-5 text-right">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-[hsl(var(--primary))]">
                    {s.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TEAM */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-[hsl(var(--primary))] sm:text-4xl">
            צוות החברה
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((m) => (
              <a
                key={m.name}
                href={encHref(m.href)}
                className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm transition hover:shadow-lg"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-bl from-[hsl(var(--primary))] to-[#063760] text-4xl font-bold text-white shadow-md">
                  {m.initial}
                </div>
                <h3 className="mt-5 text-xl font-bold text-foreground">{m.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY US */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-[hsl(var(--primary))] sm:text-4xl">
            למה לבחור דווקא ברפאל שמאות רכוש
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            {whyUs.map((w) => (
              <div key={w.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                  <w.Icon className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. VIDEOS */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-[hsl(var(--primary))] sm:text-4xl">
            סרטונים
          </h2>
          {videos.length > 0 && (
            <div className="mt-10 -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
              {videos.map((v) => {
                const yt = youtubeIdFrom(v.video_url);
                const thumb = v.cover_url ?? (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null);
                return (
                  <a
                    key={v.slug}
                    href={encHref(`/movie/${v.slug}`)}
                    className="group block w-72 shrink-0 snap-start overflow-hidden rounded-xl bg-card shadow-sm transition hover:shadow-lg lg:w-auto"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      {thumb ? (
                        <img src={thumb} alt={v.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/70">▶</div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent))]/95 text-white shadow-lg">
                          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 text-right">
                      <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-[hsl(var(--primary))]">
                        {v.title}
                      </h3>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. CTA + LEAD FORM */}
      <section className="bg-gradient-to-bl from-[#042D50] via-[#063760] to-[#144268] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            מוזמנים להתקשר או להשאיר פרטים ליצירת קשר · ונשוב אליכם בהקדם!
          </h2>
          <p className="mt-3 text-lg text-[hsl(var(--gold))]">הייעוץ עלינו!</p>
          <div className="mt-8 rounded-2xl bg-white p-6 text-foreground shadow-2xl sm:p-8">
            <LeadForm variant="cta" submitLabel="חיזרו אלי!" />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
