import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Droplets, Flame, CloudRain, Home as HomeIcon, ShieldAlert, Scale,
  Lock, Gem, HardHat, Landmark, Car, Armchair,
  HeartHandshake, Award, Network, TrendingUp, Users,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { QuickLeadBand } from "@/components/QuickLeadBand";
import { LeadForm } from "@/components/LeadForm";
import { getHomeVideosFn, type HomeVideo } from "@/lib/home.functions";
import { SITE_URL, canonicalUrl } from "@/lib/site-config";

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
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/") }],
  }),
  component: HomePage,
});

// ==== Resolved Supabase asset URLs (from media table, legacy_url lookup) ====
const IMG_HERO = "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/4097/media-4097.webp";
const IMG_IGUD = "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6072/igud.webp";
const IMG_QUALITY = "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6080/quality.webp";

const CLIENT_LOGOS: Array<{ src: string; alt: string }> = [
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3440/media-3440.webp", alt: "דור אלון" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3441/media-3441.webp", alt: "מיסים" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3435/fridenson.webp", alt: "Fridenson" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3436/g-city.webp", alt: "G-City" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3442/media-3442.webp", alt: "עותף" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3438/pit.webp", alt: "Pit" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3439/media-3439.webp", alt: "בורקין" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3437/icon.webp", alt: "Icon" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3443/media-3443.webp", alt: "שטיין" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/4232/gderot.webp", alt: "Gderot" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/4234/media-4234.webp", alt: "מרחב מוגן" },
  { src: "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/4238/media-4238.webp", alt: "דונה" },
];

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

const STATS = [
  { value: 6435250, label: 'סה"כ תגמולי ביטוח שהשגנו' },
  { value: 4587, label: "נכסים שבדקנו" },
  { value: 41584114, label: "הערכות נזק שהערכנו" },
  { value: 2896, label: "לקוחות מרוצים" },
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

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function Counter({ target }: { target: number }) {
  const [val, setVal] = useState(target); // SSR renders final
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  useEffect(() => {
    setVal(0);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const dur = 1600;
            const step = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(target * eased));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{fmt(val)}</span>;
}

function ClientLogosCarousel() {
  const [idx, setIdx] = useState(0);
  const [perView, setPerView] = useState(5);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 2 : w < 1024 ? 3 : 5);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  const total = CLIENT_LOGOS.length;
  const maxIdx = Math.max(0, total - perView);
  const safeIdx = Math.min(idx, maxIdx);
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i >= maxIdx ? 0 : i + 1));
    }, 3500);
    return () => clearInterval(id);
  }, [maxIdx]);
  const pageCount = maxIdx + 1;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIdx((i) => (i <= 0 ? maxIdx : i - 1))}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-[hsl(var(--muted))] sm:-right-3"
        aria-label="הקודם"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setIdx((i) => (i >= maxIdx ? 0 : i + 1))}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-[hsl(var(--muted))] sm:-left-3"
        aria-label="הבא"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="overflow-hidden px-8">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${(safeIdx * 100) / perView}%)` }}
        >
          {CLIENT_LOGOS.map((logo) => (
            <div
              key={logo.alt}
              className="shrink-0 px-2"
              style={{ width: `${100 / perView}%` }}
            >
              <div className="flex h-24 items-center justify-center rounded-lg border border-black/5 bg-white px-4 shadow-sm">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className="max-h-14 w-auto object-contain grayscale transition hover:grayscale-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`עמוד ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === safeIdx ? "w-6 bg-[hsl(var(--primary))]" : "w-2 bg-black/20"}`}
          />
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const { data: videos = [] } = useQuery<HomeVideo[]>({
    queryKey: ["home-videos"],
    queryFn: () => getHomeVideosFn(),
    staleTime: 5 * 60_000,
  });

  return (
    <SiteChrome>
      {/* 1. HERO — photo left, content right */}
      <section className="relative overflow-hidden bg-[#F7F8FB]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16 lg:px-8">
          <div className="order-2 text-right lg:order-2">
            <h1 className="text-3xl font-extrabold leading-tight text-[hsl(var(--primary))] sm:text-4xl lg:text-[42px]">
              שמאי רכוש לנזקי רכוש רפאל ריבוח
            </h1>
            <div className="mt-3 border-t-2 border-dashed border-[hsl(var(--primary))]/60" aria-hidden="true" />
            <p className="mt-4 text-xl font-bold text-[#1F2023] sm:text-2xl">
              אל תתמודדו לבד מול חברת הביטוח!
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#333333] sm:text-lg">
              שמאי הביטוח מטעם החברה פועל לקידום האינטרסים שלה, בעוד שבחירה בשמאי רכוש פרטי מעניקה לכם ייצוג אמיתי, הערכה מקצועית ומעמיקה, והבטחה למיצוי הפיצוי המקסימלי המגיע לכם.
            </p>
            <p className="mt-4 text-base font-semibold text-[hsl(var(--primary))]">
              משרדנו חבר באיגוד השמאים בישראל ומחזיק בתו איכות השירות.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <img src={IMG_IGUD} alt="חבר באיגוד השמאים בישראל" className="h-20 w-auto" loading="lazy" />
              <img src={IMG_QUALITY} alt="תו איכות השירות" className="h-16 w-auto" loading="lazy" />
            </div>
            <div className="mt-7">
              <a
                href="#contact-band"
                className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--gold))] px-8 py-3 text-base font-bold text-white shadow-md transition hover:brightness-95"
              >
                לשיחת ייעוץ חינם
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-1">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96 lg:h-[520px]">
              <img
                src={IMG_HERO}
                alt="רפאל ריבוח - שמאי רכוש"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTERS */}
      <section className="bg-[hsl(var(--muted))] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white p-6 text-center shadow-md ring-1 ring-black/5"
              >
                <div className="text-3xl font-extrabold tabular-nums text-[hsl(var(--primary))] sm:text-4xl lg:text-[40px]">
                  <Counter target={s.value} />
                </div>
                <div className="mt-2 text-sm font-medium text-[#4a4d55] sm:text-base">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CLIENTS CAROUSEL */}
      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[hsl(var(--primary))] sm:text-3xl">
              לקוחות שבחרו בנו
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          </div>
          <div className="mt-10">
            <ClientLogosCarousel />
          </div>
        </div>
      </section>

      {/* 4. QUICK LEAD BAND (anchor target) */}
      <div id="contact-form">
        <QuickLeadBand />
      </div>
      <span id="contact-band" />

      {/* 5. SERVICES */}
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

      {/* 6. TEAM */}
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

      {/* 7. WHY US */}
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

      {/* 8. VIDEOS */}
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

      {/* 9. CTA + LEAD FORM */}
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

// Also unused ShieldAlert import safeguard (kept to avoid tree-shake removals affecting original layout options)
export const _iconGuard = ShieldAlert;
