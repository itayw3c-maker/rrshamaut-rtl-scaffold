import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { submitLeadFn } from "@/lib/leads.functions";
import { useEffect, useRef, useState } from "react";
import {
  HeartHandshake, Award, Network, TrendingUp, Users,
  ChevronRight, ChevronLeft, ArrowLeft,
} from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { QuickLeadBand } from "@/components/QuickLeadBand";

import {
  getHomeVideosFn, type HomeVideo,
  getHomeSuccessesFn, type HomeSuccess,
  getHomeArticlesFn, type HomeArticle,
} from "@/lib/home.functions";
import { SITE_URL, canonicalUrl } from "@/lib/site-config";
import heroBgAsset from "@/assets/hero-bg.png.asset.json";
import heroPortraitAsset from "@/assets/hero-portrait.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "רפאל שמאות רכוש - שמאי ביטוח פרטי לתביעות רכוש" },
      {
        name: "description",
        content:
          "משרד שמאי רכוש פרטי המייצג מבוטחים מול חברות הביטוח. ייעוץ ראשוני חינם, טיפול בנזקי מים, אש, טבע, פריצה והערכות שווי. עבודה על בסיס הצלחה.",
      },
      { property: "og:title", content: "רפאל שמאות רכוש - שמאי ביטוח פרטי לתביעות רכוש" },
      {
        property: "og:description",
        content: "משרד שמאי רכוש פרטי המייצג מבוטחים מול חברות הביטוח. ייעוץ ראשוני חינם, טיפול בנזקי מים, אש, טבע, פריצה והערכות שווי. עבודה על בסיס הצלחה.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/") }],
  }),
  component: HomePage,
});

const SB = "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media";
const IMG_HERO = `${SB}/wp/4097/media-4097.webp`;
const IMG_IGUD = `${SB}/wp/6072/igud.webp`;
const IMG_QUALITY = `${SB}/wp/6080/quality.webp`;
const IMG_ABOUT = `${SB}/wp/4244/media-4244.webp`;

const CLIENT_LOGOS: Array<{ src: string; alt: string }> = [
  { src: `${SB}/wp/3440/media-3440.webp`, alt: "דור אלון" },
  { src: `${SB}/wp/3441/media-3441.webp`, alt: "מיסים" },
  { src: `${SB}/wp/3435/fridenson.webp`, alt: "Fridenson" },
  { src: `${SB}/wp/3436/g-city.webp`, alt: "G-City" },
  { src: `${SB}/wp/3442/media-3442.webp`, alt: "עותף" },
  { src: `${SB}/wp/3438/pit.webp`, alt: "Pit" },
  { src: `${SB}/wp/3439/media-3439.webp`, alt: "בורקין" },
  { src: `${SB}/wp/3437/icon.webp`, alt: "Icon" },
  { src: `${SB}/wp/3443/media-3443.webp`, alt: "שטיין" },
  { src: `${SB}/wp/4232/gderot.webp`, alt: "Gderot" },
  { src: `${SB}/wp/4234/media-4234.webp`, alt: "מרחב מוגן" },
  { src: `${SB}/wp/4238/media-4238.webp`, alt: "דונה" },
];

const services: Array<{ title: string; href: string; img: string }> = [
  { title: "ייעוץ וליווי תביעות ביטוח", href: "/ייעוץ-וליווי-תביעות-ביטוח", img: `${SB}/wp/2253/1.webp` },
  { title: "נזקי מים הצפה ורטיבות", href: "/נזקי-מים-הצפה-ורטיבות", img: `${SB}/wp/3317/media-3317.webp` },
  { title: "נזקי אש ופיח", href: "/נזקי-אש-ופיח", img: `${SB}/wp/98/photo-2023-11-10-14-56-32-1.jpg` },
  { title: "נזקי טבע שיטפונות וסערה", href: "/נזקי-טבע-שיטפונות-וסערה", img: `${SB}/wp/5511/600x800.jpg` },
  { title: "נזקי שוכרים", href: "/נזקי-שוכרים", img: `${SB}/wp/3318/media-3318.webp` },
  { title: 'חו"ד קבילה משפטית', href: "/חווד-קבילה-משפטית", img: `${SB}/wp/2250/7.webp` },
  { title: "נזקי פריצה", href: "/שמאי-נזקי-פריצה", img: `${SB}/wp/3712/media-3712.webp` },
  { title: "הערכת שווי רכוש", href: "/הערכת-שווי-רכוש", img: `${SB}/wp/3315/media-3315.webp` },
  { title: "נזקי עבודות קבלניות", href: "/שמאי-נזקי-עבודות-קבלניות", img: `${SB}/wp/5126/media-5126.jpg` },
  { title: "הערכת רכוש לצורכי הזדכות במס שבח", href: "/הערכת-רכוש-לצורכי-הזדכות-במס-שבח", img: `${SB}/wp/2042/385506.jpg` },
  { title: "נזקי התנגשות", href: "/שמאי-נזקי-התנגשות", img: `${SB}/wp/5515/2.jpg` },
  { title: "הערכת שמאות לריהוט עתיק", href: "/הערכת-שמאות-לריהוט-עתיק", img: `${SB}/wp/3314/media-3314.webp` },
];

const PROCESS_STEPS: Array<[string, string]> = [
  ["שיחת ייעוץ", "וניתוח המקרה"],
  ["העברת", "המסמכים"],
  ["ביקור במקום", "האירוע"],
  ["זימון מומחים", 'נוספים ע"פ צורך'],
  ["הגשת", "דרישה כספית"],
  ["הסכם פשרה/", "הליך משפטי"],
  ['אישור ההסכם ע"י', "הלקוח/פסק דין"],
  ["סילוק התביעה", "וקבלת תגמולים"],
];
const PROCESS_CURVE_URL = "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/72/vector-19.svg";


const ABOUT_PARAGRAPHS = [
  "אני רפאל ריבוח, משנת 2019 פועל כשמאי רכוש, מייסד ובעלים של חברת רפאל שמאות רכוש RR.",
  'לאורך השנים, רכשתי נסיון נרחב ומעמיק בתחום השמאות והביטוח. את תחילת דרכי עשיתי בחברת "מילגם", להסדר נזקי צנרת, שם התמחיתי בטיפול יומיומי בתיקי נזקי מים מורכבים, תוך היכרות מעמיקה עם נהלי העבודה והדרישות של חברות הביטוח והמבוטחים כאחד.',
  'לאחר מכן עבדתי בצוות גמולב שמאות כללית בע"מ – משרד שמאות ותיק ומוכר בארץ, שם התמקדתי בביצוע שמאויות והערכות שווי עבור מכלול חברות הביטוח, בתחומים כגון מבנים, הגנות, תכולות ופריטי רכוש ואמנות.',
  "היקף הפעילות שלי כולל: ביצוע אלפי הערכות שמאות לנזקי רכוש, סקרים שמאיים של תכולה ומבנים למטרות ביטוח, הערכת שווי של תכולות ביתיות, חפצי אמנות וריהוט עתיק שנפגעו כתוצאה משריפה, הצפה או נזק אחר, וכן ניהול והתנהלות מול חברות ביטוח בתביעות מורכבות.",
  "כיום אני מעניק שירותי שמאות רכוש ללקוחות פרטיים וגופים מוסדיים נוספים.",
];

const team = [
  {
    name: "רפאל ריבוח",
    role: "שמאי רכוש, בעלים",
    bio: "שמאי רכוש בהכשרתו, סוקר סיכונים, ומאתר ליקויי בניה מורשה, בעל ניסיון בייצוג וניהול תביעות נזקי מים, אש, פריצה, רכוש, ושיקום נזקים. מספק חוות דעת מקצועיות לבתי משפט.",
    photo: `${SB}/wp/3081/untitled-design-2025-09-17t110847-382.webp`,
    href: "/about/השמאי-רפאל-ריבוח-מייסד-ובעלים-2",
  },
  {
    name: "ארז אריה",
    role: "מהנדס אזרחי ושמאי מקרקעין",
    bio: "מהנדס אזרחי בהכשרתו, בוגר הטכניון בחיפה, בעל 26 שנות ניסיון, שמאי מקרקעין מוסמך, מפקח בניה, משמש כמומחה בתי משפט ומוכר בענף הביטוח.",
    photo: `${SB}/wp/5105/media-5105.jpg`,
    href: "/about/המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו",
  },
  {
    name: "קובי ליבוביץ'",
    role: "עורך דין",
    bio: 'עורך דין, בעל ניסיון רב בטיפול וניהול תביעות רכוש מול כל חברות הביטוח, מומחה בהליכי מו"מ, גישור, ייצוג והופעות בבתי משפט. מעביר הרצאות רבות בתחום תביעות נזקי הרכוש.',
    photo: `${SB}/wp/3092/untitled-design-2025-09-17t111247-317.webp`,
    href: "/about/השמאי-רפאל-ריבוח-מייסד-ובעלים",
  },
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

const GALLERY = [
  { title: "נזקי מים", img: `${SB}/wp/1022/media-1022.jpg` },
  { title: "נזקי אש", img: `${SB}/wp/98/photo-2023-11-10-14-56-32-1.jpg` },
  { title: "נזקי רכוש", img: `${SB}/wp/1106/dsc00424-3-jpg.webp` },
  { title: "הערכת שווי רכוש", img: `${SB}/wp/1073/photo-2024-07-19-02-54-32.jpg` },
];

const PRESS = [
  {
    href: "https://www.ynet.co.il/article/r1eu0i4mwe",
    img: `${SB}/wp/4304/media-4304.webp`,
    logo: `${SB}/wp/6127/ynet.webp`,
    title: 'שמאי רכוש מוביל בענף: "השליחות שלנו - שכל מבוטח יקבל את מלוא הפיצוי"',
    alt: "ynet",
  },
  {
    href: "https://www.israelhayom.co.il/mumlazim/article/19039227",
    img: `${SB}/wp/3501/media-3501.webp`,
    logo: `${SB}/wp/6126/media-6126.webp`,
    title: "רפאל ריבוח – השמאי שמחזיר לכם את הכוח מול חברות הביטוח",
    alt: "ישראל היום",
  },
  {
    href: "https://www.maariv.co.il/economy/consumerism/article-1204138",
    img: `${SB}/wp/5045/media-5045.jpg`,
    logo: `${SB}/wp/6125/media-6125.webp`,
    title: "שמאי רכוש: למה הוא קריטי ואיך הוא יכול לחסוך לכם כסף רב?",
    alt: "מעריב",
  },
];

import { appHref as encHref } from "@/lib/href";

function youtubeIdFrom(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function toEmbedUrl(url: string | null): string | null {
  const id = youtubeIdFrom(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "");
}

function formatDateIL(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("he-IL", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).formatToParts(d);
    const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${g("day")}/${g("month")}/${g("year")}`;
  } catch {
    return "";
  }
}

function Counter({ target }: { target: number }) {
  const [val, setVal] = useState(target);
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
      <button type="button" onClick={() => setIdx((i) => (i <= 0 ? maxIdx : i - 1))} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-[hsl(var(--muted))] sm:-right-3" aria-label="הקודם">
        <ChevronRight className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => setIdx((i) => (i >= maxIdx ? 0 : i + 1))} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-[hsl(var(--muted))] sm:-left-3" aria-label="הבא">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="overflow-hidden px-8">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(${(safeIdx * 100) / perView}%)` }}>
          {CLIENT_LOGOS.map((logo) => (
            <div key={logo.alt} className="shrink-0 px-2" style={{ width: `${100 / perView}%` }}>
              <div className="flex h-24 items-center justify-center rounded-lg border border-black/5 bg-white px-4 shadow-sm">
                <img src={logo.src} alt={logo.alt} loading="lazy" className="max-h-14 w-auto object-contain grayscale transition hover:grayscale-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`עמוד ${i + 1}`} className={`h-2 rounded-full transition-all ${i === safeIdx ? "w-6 bg-[hsl(var(--primary))]" : "w-2 bg-black/20"}`} />
        ))}
      </div>
    </div>
  );
}

function GoldPill({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--gold))] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-95 sm:text-base"
    >
      {children}
    </a>
  );
}

function GoldOutlineBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--gold))] px-6 py-2 text-sm font-bold text-[hsl(var(--gold))] transition hover:bg-[hsl(var(--gold))] hover:text-white sm:text-base">
      {children}
      <ArrowLeft className="h-4 w-4" />
    </a>
  );
}

/** Generic responsive carousel — used for successes & videos */
function useCarousel<T>(items: T[], breakpoints: { mobile: number; tablet: number; desktop: number }) {
  const [idx, setIdx] = useState(0);
  const [perView, setPerView] = useState(breakpoints.desktop);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? breakpoints.mobile : w < 1024 ? breakpoints.tablet : breakpoints.desktop);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [breakpoints.mobile, breakpoints.tablet, breakpoints.desktop]);
  const total = items.length;
  const maxIdx = Math.max(0, total - Math.ceil(perView));
  const safeIdx = Math.min(idx, maxIdx);
  return { idx: safeIdx, setIdx, perView, maxIdx };
}

function SuccessCarousel({ items }: { items: HomeSuccess[] }) {
  const { idx, setIdx, perView, maxIdx } = useCarousel(items, { mobile: 1.2, tablet: 2, desktop: 4 });
  if (items.length === 0) return null;
  return (
    <div className="relative">
      <button type="button" onClick={() => setIdx((i) => (i <= 0 ? maxIdx : i - 1))} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-[hsl(var(--muted))] sm:-right-3" aria-label="הקודם">
        <ChevronRight className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => setIdx((i) => (i >= maxIdx ? 0 : i + 1))} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-[hsl(var(--muted))] sm:-left-3" aria-label="הבא">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="overflow-hidden px-8 pb-2">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(${(idx * 100) / perView}%)` }}>
          {items.map((s) => (
            <div key={s.slug} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
              <div className="flex h-full flex-col overflow-hidden bg-white shadow-md ring-1 ring-black/5" style={{ borderRadius: 0 }}>
                <div className="w-full bg-white">
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={decodeEntities(s.title)} loading="lazy" className="block h-auto w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-muted-foreground">מסמך</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 text-right">
                  <h3 className="line-clamp-3 min-h-[3.75rem] text-base font-bold text-[hsl(var(--primary))]">
                    {decodeEntities(s.title)}
                  </h3>
                  <div className="mt-4">
                    <GoldPill href={encHref(`/success/${s.slug}`)}>לפרטים ←</GoldPill>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: maxIdx + 1 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`עמוד ${i + 1}`} className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-[hsl(var(--primary))]" : "w-2 bg-black/20"}`} />
        ))}
      </div>
    </div>
  );
}

function VideoPlayer({ embed, ytId, title, coverUrl }: { embed: string; ytId: string | null; title: string; coverUrl: string | null }) {
  const [playing, setPlaying] = useState(false);
  const [posterSrc, setPosterSrc] = useState<string | null>(
    ytId ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg` : coverUrl
  );
  if (playing) {
    const sep = embed.includes("?") ? "&" : "?";
    return (
      <iframe
        src={`${embed}${sep}autoplay=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block h-full w-full overflow-hidden bg-black"
      aria-label={`נגן וידאו: ${title}`}
    >
      {posterSrc ? (
        <img
          src={posterSrc}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => {
            if (ytId && posterSrc?.includes("maxresdefault")) {
              setPosterSrc(`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`);
            }
          }}
        />
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[hsl(var(--primary))] shadow-lg transition group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7"><path d="M8 5v14l11-7z"/></svg>
        </span>
      </div>
    </button>
  );
}

function VideoCarousel({ items }: { items: HomeVideo[] }) {
  const { idx, setIdx, perView, maxIdx } = useCarousel(items, { mobile: 1, tablet: 2, desktop: 3 });
  if (items.length === 0) return null;
  return (
    <div className="relative">
      <button type="button" onClick={() => setIdx((i) => (i <= 0 ? maxIdx : i - 1))} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-white sm:-right-3" aria-label="הקודם">
        <ChevronRight className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => setIdx((i) => (i >= maxIdx ? 0 : i + 1))} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-white sm:-left-3" aria-label="הבא">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="overflow-hidden px-8">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(${(idx * 100) / perView}%)` }}>
          {items.map((v) => {
            const ytId = youtubeIdFrom(v.video_url);
            const embed = toEmbedUrl(v.video_url);
            return (
              <div key={v.slug} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
                  <div className="aspect-video w-full bg-black">
                    {embed ? (
                      <VideoPlayer embed={embed} ytId={ytId} title={decodeEntities(v.title)} coverUrl={v.cover_url} />
                    ) : v.cover_url ? (
                      <img src={v.cover_url} alt={decodeEntities(v.title)} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="bg-white px-4 py-3 text-right">
                    <h3 className="line-clamp-2 text-base font-semibold text-[hsl(var(--primary))]">
                      <a href={encHref(`/movie/${v.slug}`)} className="hover:underline">
                        {decodeEntities(v.title)}
                      </a>
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: maxIdx + 1 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`עמוד ${i + 1}`} className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-[hsl(var(--primary))]" : "w-2 bg-black/20"}`} />
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
  const { data: successes = [] } = useQuery<HomeSuccess[]>({
    queryKey: ["home-successes"],
    queryFn: () => getHomeSuccessesFn(),
    staleTime: 5 * 60_000,
  });
  const { data: articles = [] } = useQuery<HomeArticle[]>({
    queryKey: ["home-articles"],
    queryFn: () => getHomeArticlesFn(),
    staleTime: 5 * 60_000,
  });

  return (
    <SiteChrome>
      {/* 1. HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.7) 100%), url(${heroBgAsset.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 pb-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16 lg:pb-10 lg:px-8">
          <div className="order-2 text-right lg:order-1">
            <h1 className="text-3xl font-extrabold leading-tight text-[hsl(var(--primary))] sm:text-4xl lg:text-[39px]">
              שמאי רכוש לנזקי רכוש רפאל ריבוח
            </h1>
            <div
              aria-hidden="true"
              className="mt-4 h-[3px] w-full max-w-[380px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to left, #056FC4 0 10px, transparent 10px 20px)",
              }}
            />
            <p className="mt-4 text-xl font-bold text-[rgb(50,66,64)] sm:text-[20px]">
              אל תתמודדו לבד מול חברת הביטוח!
            </p>
            <p className="mt-4 text-[20px] leading-[30px] text-[rgb(50,66,64)]">
              שמאי הביטוח מטעם החברה פועל לקידום האינטרסים שלה, בעוד שבחירה בשמאי רכוש פרטי מעניקה לכם ייצוג אמיתי, הערכה מקצועית ומעמיקה, והבטחה למיצוי הפיצוי המקסימלי המגיע לכם.
            </p>
            <p className="mt-4 text-base font-semibold text-[hsl(var(--primary))]">משרדנו חבר באיגוד השמאים בישראל ומחזיק בתו איכות השירות.</p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <img src={IMG_IGUD} alt="חבר באיגוד השמאים בישראל" className="h-20 w-auto" loading="lazy" />
              <img src={IMG_QUALITY} alt="תו איכות השירות" className="h-16 w-auto" loading="lazy" />
            </div>
            <div className="mt-7">
              <a
                href="#contact-band"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-bold transition hover:brightness-95"
                style={{
                  backgroundColor: "rgb(233,234,240)",
                  color: "rgb(203,164,54)",
                  border: "3px solid rgb(203,164,54)",
                  borderRadius: "40px",
                }}
              >
                לשיחת ייעוץ חינם
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
            <img
              src={heroPortraitAsset.url}
              alt="רפאל ריבוח - שמאי רכוש"
              width={682}
              height={1024}
              className="h-auto w-full max-w-md lg:max-w-lg"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 2. STATS — translucent cards floating over photo/white seam */}
      <section className="relative z-10 -mt-16 sm:-mt-20 lg:-mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="text-center"
                style={{
                  background: "rgba(255,255,255,0.81)",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px 0 rgba(117,118,122,0.38)",
                  padding: "24px 0",
                }}
              >
                <div className="text-4xl text-[rgb(36,113,175)] sm:text-5xl lg:text-[62px] font-[family-name:var(--font-heading)]" style={{ fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  <Counter target={s.value} />
                </div>
                <div className="mt-2 text-[20px] font-normal text-[rgb(50,66,64)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 3. CLIENTS */}
      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#056FC4] sm:text-[48px]">לקוחות שבחרו בנו</h2>
            <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          </div>
          <div className="mt-10">
            <ClientLogosCarousel />
          </div>
        </div>
      </section>

      {/* 4. QUICK LEAD BAND */}
      <div id="contact-form">
        <QuickLeadBand />
      </div>
      <span id="contact-band" />

      {/* 5. SERVICES */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="order-1 text-right text-3xl font-medium text-[hsl(var(--primary))] sm:text-[32px]">הנושאים בהם משרדנו עוסק</h2>
            <div className="order-2"><GoldOutlineBtn href="#contact-band">לייעוץ חינם</GoldOutlineBtn></div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <a
                key={s.title}
                href={encHref(s.href)}
                className="group block overflow-hidden bg-card transition hover:-translate-y-1"
                style={{ boxShadow: "0 0 10px 0 rgba(0,0,0,0.16)", borderRadius: 0 }}
              >
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "363 / 260" }}>
                  <img src={s.img} alt={s.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-center bg-[#056FC4] px-4">
                    <h3 className="text-base font-semibold text-white">{s.title}</h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROCESS */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="order-1 text-right text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">הליך תביעת ביטוח</h2>
            <div className="order-2"><GoldOutlineBtn href="#contact-band">לייעוץ חינם</GoldOutlineBtn></div>
          </div>
          <div className="relative mt-12">
            {[0, 1].map((row) => (
              <div key={row} className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-4" style={row === 1 ? { marginTop: "140px" } : undefined}>
                {PROCESS_STEPS.slice(row * 4, row * 4 + 4).map(([l1, l2], idx) => {
                  const num = String(row * 4 + idx + 1).padStart(2, "0");
                  const isLastInRow = idx === 3;
                  return (
                    <div key={num} className="relative flex flex-col items-center px-4 text-center">
                      <div className="text-[44px] font-extrabold leading-none text-[hsl(var(--gold))]">{num}</div>
                      <h3 className="mt-3 text-[20px] font-semibold leading-snug text-[#056FC4]">
                        <span className="block">{l1}</span>
                        <span className="block">{l2}</span>
                      </h3>
                      {!isLastInRow && (
                        <div className="pointer-events-none absolute top-[22px] hidden h-0 items-center sm:flex" style={{ left: "-12%", width: "24%" }} aria-hidden="true">
                          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
                          <span className="flex-1 border-t-2 border-dashed border-[hsl(var(--gold))]/70" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Curved dashed connector from under step 04 (left) to above step 05 (right) */}
            <img
              src={PROCESS_CURVE_URL}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute hidden sm:block"
              style={{ left: "12.5%", right: "12.5%", width: "75%", top: "calc(50% - 55px)", height: "110px" }}
            />
          </div>

        </div>
      </section>

      {/* 7. ABOUT */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="order-2 text-right lg:order-1">
            <div className="relative h-full min-h-[420px]">
              <div className="pointer-events-none absolute -top-4 right-[-16px] z-10 h-24 w-24 rounded-full opacity-30" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--gold)) 1.5px, transparent 2px)", backgroundSize: "12px 12px" }} aria-hidden="true" />
              <div className="h-full overflow-hidden shadow-xl ring-1 ring-black/5" style={{ borderRadius: "8px 100px 8px 8px" }}>
                <img src={IMG_ABOUT} alt="רפאל ריבוח - אודות" className="h-full min-h-[420px] w-full object-cover" loading="lazy" />
              </div>
              <div className="pointer-events-none absolute -bottom-4 left-[-16px] z-10 h-24 w-24 rounded-full opacity-30" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--gold)) 1.5px, transparent 2px)", backgroundSize: "12px 12px" }} aria-hidden="true" />
            </div>
          </div>
          <div className="order-1 text-right lg:order-2">
            <h2 className="text-4xl font-extrabold text-[hsl(var(--gold))] sm:text-[40px]">אודות רפאל שמאות רכוש</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-[#333333]">
              {ABOUT_PARAGRAPHS.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
            </div>
            <div className="mt-7">
              <a
                href={encHref("/about")}
                className="inline-flex items-center justify-center px-6 py-3 text-[20px] font-bold transition hover:brightness-95"
                style={{
                  backgroundColor: "rgb(239,241,241)",
                  color: "rgb(203,164,54)",
                  borderRadius: "40px",
                }}
              >
                קראו עוד
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* 8. TEAM */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">צוות החברה</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((m) => (
              <div
                key={m.name}
                className="flex flex-col items-center bg-card p-8 text-center"
                style={{
                  borderRadius: "10px",
                  border: "1px solid rgb(6,55,96)",
                  borderBottomWidth: "11px",
                  boxShadow: "0 0 10px 0 rgba(0,0,0,0.24)",
                }}
              >
                <img src={m.photo} alt={m.name} loading="lazy" className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow" />
                <h3 className="mt-5 text-[24px] font-bold text-[#056FC4]">{m.name}</h3>
                <p className="mt-1 text-base text-[#333333]">{m.role}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-[#333333]">{m.bio}</p>
                <a href={encHref(m.href)} className="mt-5 inline-flex items-center gap-1 text-[20px] font-bold text-[rgb(204,51,102)] hover:underline">
                  עוד <ArrowLeft className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SUCCESSES */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">ההצלחות שלנו</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12">
            <SuccessCarousel items={successes} />
          </div>
          <div className="mt-10 text-center">
            <GoldPill href={encHref("/ההצלחות-שלנו")}>לכל ההצלחות</GoldPill>
          </div>
        </div>
      </section>

      {/* 10. WHY US — blue band */}
      <section className="relative overflow-hidden py-16 text-white sm:py-20" style={{ backgroundColor: "rgb(5,111,196)" }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--gold)) 1.5px, transparent 2px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-white sm:text-[48px]">למה לבחור דווקא ברפאל שמאות רכוש</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            {whyUs.map((w) => (
              <div key={w.title} className="text-center">
                <div
                  className="mx-auto flex items-center justify-center rounded-full"
                  style={{
                    height: "110px",
                    width: "110px",
                    backgroundColor: "#F2DFA7",
                  }}
                >
                  <w.Icon className="h-12 w-12" strokeWidth={1.75} style={{ color: "rgb(163,127,32)" }} />
                </div>
                <h3 className="mt-5 text-[20px] font-bold text-white">{w.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-white/95">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. GALLERY */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">גלריית הפרויקטים</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((g) => (
              <a key={g.title} href={encHref("/גלריית-נזקי-מים-אש-ומלחמה")} className="group block text-center">
                <h3 className="mb-3 text-[18px] font-bold text-[#056FC4]">{g.title}</h3>
                <div className="overflow-hidden" style={{ borderBottom: "3px solid rgb(203,164,54)" }}>
                  <img src={g.img} alt={g.title} loading="lazy" className="h-80 w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 text-center">
            <GoldPill href={encHref("/גלריית-נזקי-מים-אש-ומלחמה")}>לצפיה בגלריה</GoldPill>
          </div>
        </div>
      </section>

      {/* 12. VIDEOS */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">סרטונים</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12">
            <VideoCarousel items={videos} />
          </div>
        </div>
      </section>

      {/* 13. PRESS */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">כתבו עלינו</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PRESS.map((p) => (
              <a
                key={p.href}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-72 w-full overflow-hidden bg-[#F7F8FB]">
                  <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6 text-right">
                  <h3 className="line-clamp-3 flex-1 text-base font-bold leading-snug text-[hsl(var(--primary))]">{p.title}</h3>
                  <div className="mt-5 flex justify-end">
                    <img src={p.logo} alt={p.alt} loading="lazy" className="h-10 w-auto object-contain" />
                  </div>
                </div>
                <div className="bg-[hsl(var(--gold))] py-3 text-center text-base font-bold text-white group-hover:brightness-95">
                  לקריאת המאמר
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 text-center">
            <GoldPill href={encHref("/כתבו-עלינו")}>לכל הכתבות</GoldPill>
          </div>
        </div>
      </section>

      {/* 14. ARTICLES */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">מאמרים בנושא שמאות רכוש</h2>
          <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const excerpt = a.excerpt ? decodeEntities(a.excerpt) : "";
              return (
                <article
                  key={a.slug}
                  className="flex flex-col bg-white p-6 text-right"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid rgb(229,231,235)",
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.06)",
                  }}
                >
                  <h3 className="text-[20px] font-bold leading-snug text-[#056FC4]">
                    <a href={encHref(`/${a.slug}`)} className="hover:underline">{a.title}</a>
                  </h3>
                  {excerpt && (
                    <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-relaxed text-[#333333]">{excerpt}</p>
                  )}
                  <div className="mt-5">
                    <a href={encHref(`/${a.slug}`)} className="inline-flex items-center gap-1 text-base font-bold text-[rgb(203,164,54)] hover:underline">
                      קרא עוד »
                    </a>
                  </div>
                  {a.published_at && (
                    <div className="mt-4 text-xs text-muted-foreground">{formatDateIL(a.published_at)}</div>
                  )}
                </article>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <GoldPill href={encHref("/category/מידע-מקצועי")}>לכל המאמרים</GoldPill>
          </div>
        </div>
      </section>

      {/* 15. HELP BAND (blue) + reviews + SEO sections */}
      <HelpBand />
      <ReviewsSection />
      <SeoSections />
    </SiteChrome>
  );
}

/* ============ NEW SECTIONS ============ */

const REVIEW_SCREENSHOTS: string[] = [
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2383/2025-04-09-172128.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2384/2025-04-09-172200.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2385/2025-04-09-172208.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2386/2025-04-09-172214.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2387/2025-04-09-172237.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2388/2025-04-09-172246.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2389/2025-04-09-172252.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2390/2025-04-09-172307.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2391/2025-04-09-172316.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2392/2025-04-09-172323.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2393/2025-04-09-172340.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2394/2025-04-09-172352.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2396/2025-04-09-172407.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2397/2025-04-09-172413.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2398/2025-04-09-172418.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2399/2025-04-09-172425.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2400/2025-04-09-172437.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2401/2025-04-09-172444.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2402/2025-04-09-172505.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2403/2025-04-09-172511.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2404/2025-04-09-172521.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2405/2025-04-09-172542.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2406/2025-04-09-172609.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2407/2025-04-09-172616.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2408/2025-04-09-172622.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2409/2025-04-09-172640.png",
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2410/2025-04-09-172649.png",
];

const MIDRAG_IMG =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/2382/whatsapp-2025-03-11-18-16-20-cf0b428d.jpg";

const HELP_DAMAGE = [
  "נזק מים",
  "נזק אש",
  "נזק טבע",
  "נזקי רכוש",
  "דחיית תביעה",
  "הערכת שווי רכוש",
  "אחר",
];

function HelpBand() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [damage, setDamage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errs, setErrs] = useState<{ name?: string; phone?: string; email?: string; consent?: string; submit?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errs = {};
    if (!name.trim()) next.name = "יש להזין שם";
    if (!phone.trim()) next.phone = "יש להזין טלפון";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "אימייל לא תקין";
    if (!agreed) next.consent = "יש לאשר את מדיניות הפרטיות";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await submitLeadFn({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          damageType: damage || undefined,
          sourceUrl: typeof window !== "undefined" ? window.location.pathname : "/",
          sourceVariant: "cta",
          agreed: true,
        },
      });
      navigate({ to: "/thank-you" });
    } catch (err) {
      setErrs({ submit: err instanceof Error ? err.message : "אירעה שגיאה, נסו שוב" });
      setBusy(false);
    }
  }

  const inputCls =
    "block h-10 w-full rounded-[10px] border-0 px-3 text-[15px] text-[#0B2B4B] placeholder:text-[#4a5b6d] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]";

  return (
    <section id="contact-band" dir="rtl" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16"
          style={{
            backgroundColor: "rgb(5,111,196)",
            borderRadius: "16px 200px 16px 16px",
            backgroundImage:
              "radial-gradient(rgba(203,164,54,0.28) 1.2px, transparent 1.4px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-right text-white">
              <h2 className="text-4xl font-extrabold leading-tight sm:text-[48px]">
                אנו כאן<br />כדי לעזור
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/95 sm:text-xl">
                מוזמנים להתקשר או להשאיר פרטים ליצירת קשר ונשוב אליכם בהקדם!
              </p>
              <p className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
                הייעוץ עלינו!
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 text-right">
              <div>
                <input
                  type="text"
                  placeholder="שם מלא"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errs.name}
                  className={inputCls}
                  style={{ backgroundColor: "rgb(207,224,242)" }}
                />
                {errs.name && <p className="mt-1 text-xs text-white">{errs.name}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="טלפון"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!errs.phone}
                  className={inputCls}
                  style={{ backgroundColor: "rgb(207,224,242)" }}
                />
                {errs.phone && <p className="mt-1 text-xs text-white">{errs.phone}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="אימייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errs.email}
                  className={inputCls}
                  style={{ backgroundColor: "rgb(207,224,242)" }}
                />
                {errs.email && <p className="mt-1 text-xs text-white">{errs.email}</p>}
              </div>
              <div>
                <select
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                  className={inputCls}
                  style={{ backgroundColor: "rgb(207,224,242)" }}
                >
                  <option value="">באיזה נזק מדובר?</option>
                  {HELP_DAMAGE.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <label className="mt-1 flex cursor-pointer items-start gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--gold))]"
                />
                <span>
                  אני מאשר/ת כי קראתי את{" "}
                  <a href={`/${encodeURIComponent("מדיניות-פרטיות")}/`} className="underline hover:opacity-90">מדיניות הפרטיות</a>{" "}
                  ואני מסכימ/ה לשמירת הפרטים לצורך יצירת קשר.
                </span>
              </label>
              {errs.consent && <p className="text-sm font-semibold text-[#FFD6D6]">{errs.consent}</p>}
              {errs.submit && <p className="text-sm font-semibold text-[#FFD6D6]">{errs.submit}</p>}
              <div className="mt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-8 text-base font-semibold text-white transition hover:brightness-95 disabled:opacity-70"
                  style={{
                    backgroundColor: "rgb(203,164,54)",
                    borderRadius: "40px",
                    height: "44px",
                  }}
                >
                  {busy ? "שולח…" : "חיזרו אלי!"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function ReviewsSection() {
  const { idx, setIdx, perView, maxIdx } = useCarousel(REVIEW_SCREENSHOTS, {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  });

  return (
    <section dir="rtl" className="bg-[hsl(var(--muted))] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">
          מה אומרים עלינו?
        </h2>
        <div className="mx-auto mt-3 h-1 w-[120px] rounded bg-[hsl(var(--gold))]" />

        {/* Google summary */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="text-2xl font-extrabold text-[#0B2B4B]">מְעוּלֶה</div>
          <div className="flex items-center gap-1" aria-label="5 מתוך 5 כוכבים">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className="h-6 w-6 fill-[hsl(var(--gold))]" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-[#4a4d55]">
            מבוסס על <strong>513 ביקורות</strong>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <GoogleG className="h-6 w-6" />
            <span className="text-lg font-bold text-[#4a4d55]">Google</span>
          </div>
        </div>

        {/* Screenshots carousel */}
        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => setIdx((i) => (i <= 0 ? maxIdx : i - 1))}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-white sm:-right-3"
            aria-label="הקודם"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i >= maxIdx ? 0 : i + 1))}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-white sm:-left-3"
            aria-label="הבא"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="overflow-hidden px-8">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${(idx * 100) / perView}%)` }}
            >
              {REVIEW_SCREENSHOTS.map((src, i) => (
                <div key={src} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                  <div className="flex h-72 items-center justify-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5">
                    <img
                      src={src}
                      alt={`ביקורת לקוח ${i + 1}`}
                      loading="lazy"
                      className="h-64 w-auto max-w-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Midrag block */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <img src={MIDRAG_IMG} alt="הדירוג שלי במידרג" loading="lazy" className="h-16 w-auto" />
          <p className="text-sm font-semibold text-[#4a4d55]">הדירוג שלי במידרג</p>
        </div>
      </div>
    </section>
  );
}

function SeoSections() {
  return (
    <section dir="rtl" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-14 px-4 sm:px-6 lg:px-8">
        <article className="text-right">
          <h2 className="text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">
            מהי שמאות רכוש?
          </h2>
          <div className="mt-3 h-0 w-24 border-t-2 border-dashed border-[hsl(var(--primary))]/60" aria-hidden="true" />
          <div className="prose-article mt-6 space-y-4 text-base leading-relaxed text-[#333333] sm:text-lg [&_a]:font-bold [&_a]:text-[#dc2f5a] [&_a:hover]:underline [&_strong>a]:text-[hsl(var(--gold))]">
            <p>
              שמאות רכוש היא הערכה מקצועית של רכוש קיים או הערכת נזקים לרכוש הנגרמים כתוצאה מאירועים ביטוחיים שונים. תחום השמאות כולל קטגוריות מגוונות:{" "}
              שמאות רכוש כללית, <strong><a href={encHref("/נזקי-אש-ופיח")}>שמאות נזקי אש</a></strong>,{" "}
              <strong><a href={encHref("/נזקי-מים-הצפה-ורטיבות")}>נזקי מים</a></strong>, נזקי ביוב, הצפות, נזקי מזג אוויר קשה ו
              <strong><a href={encHref("/הערכת-שווי-רכוש")}>אובדן רכוש</a></strong>.
            </p>
            <p>
              תפקידו של שמאי הרכוש הוא ביצוע הערכה מדויקת של הנזק שנגרם, הכנת חוות דעת מפורטת וסיוע למבוטח במימוש זכויות הפיצוי מול חברות הביטוח, בהתאם ל
              <strong>
                <a href="https://main.knesset.gov.il/activity/legislation/laws/pages/lawprimary.aspx?t=lawlaws&st=lawlaws&lawitemid=2000653" target="_blank" rel="noopener noreferrer">חוק חוזה הביטוח</a>
              </strong>
              , ולפיקוח{" "}
              <strong>
                <a href="https://www.gov.il/he/departments/capital_market_authority/govil-landing-page" target="_blank" rel="noopener noreferrer">רשות שוק ההון, ביטוח וחיסכון</a>
              </strong>
              . שמאות רכוש מבוצעת עבור מבוטחים פרטיים, עסקים, חברות ביטוח וגופים מוסדיים נוספים.
            </p>
          </div>
        </article>

        <article className="text-right">
          <h2 className="text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-[48px]">
            שירותי שמאי רכוש
          </h2>
          <div className="mt-3 h-0 w-24 border-t-2 border-dashed border-[hsl(var(--primary))]/60" aria-hidden="true" />
          <div className="prose-article mt-6 space-y-4 text-base leading-relaxed text-[#333333] sm:text-lg [&_a]:font-bold [&_a]:text-[#dc2f5a] [&_a:hover]:underline [&_strong>a]:text-[hsl(var(--gold))]">
            <p>
              שירותי שמאי רכוש פרטי כפי שמספקת חברתנו הינם חיוניים לכל מי שחווה נזק לרכושו ומבקש לקבל פיצוי הוגן. למעשה, שמאי רכוש הוא בעל מקצוע מוסמך המעריך את היקף הפגיעה / הנזק ברכושם, בין אם מדובר בנזקים אשר נגרמו כתוצאה מכוח עליון לבין רשלנות או צד ג'.
            </p>
            <p>
              חברתנו מתמחה באבחון נזקים ייחודיים לכל מקרה, עם מתן חוות דעת מקצועית, יש יכולת השפעה ישירה על סכום הפיצוי שיקבל הנפגע.
            </p>
            <p>
              שירותי הערכת נזקי רכוש מסופקים על ידינו עבור לקוחות מן הסקטור הפרטי והעסקי כאחד, והם מסייעים להבין את הנזקים, ההוצאות והמצב הכלכלי לאחר אירוע נזק.{" "}
              <b>הערכת שמאי רכוש מוגשת בחוות דעת מפורטת שמתארת ומעריכה את היקף עלויות הנזקים. חו"ד שמאי רכוש הינה מרכיב חיוני בניהול תביעות ביטוח ובחתירה להשגת פיצוי הולם.</b>
            </p>
            <p>
              אז אם אתם סובלים מנזקים ורוצים לתבוע את הביטוח, אל תוותרו על שירותיו של שמאי רכוש פרטי, חברתנו – <strong>רפאל שמאות רכוש | RR</strong>, מספקת שירותי שמאות רכוש והערכת נזקים מדויקת ומקצועית המוכרת על ידי כלל חברות הביטוח בישראל, וכן בבתי המשפט ובפני כל גורם רשמי רלוונטי אחר.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
