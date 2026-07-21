import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  HeartHandshake, Award, Network, TrendingUp, Users,
  ChevronRight, ChevronLeft, ArrowLeft,
} from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { QuickLeadBand } from "@/components/QuickLeadBand";
import { LeadForm } from "@/components/LeadForm";
import {
  getHomeVideosFn, type HomeVideo,
  getHomeSuccessesFn, type HomeSuccess,
  getHomeArticlesFn, type HomeArticle,
} from "@/lib/home.functions";
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
  { title: 'חו"ד קבילה משפטית', href: "/חוד-קבילה-משפטית", img: `${SB}/wp/2250/7.webp` },
  { title: "נזקי פריצה", href: "/נזקי-פריצה", img: `${SB}/wp/3712/media-3712.webp` },
  { title: "הערכת שווי רכוש", href: "/הערכת-שווי-רכוש", img: `${SB}/wp/3315/media-3315.webp` },
  { title: "נזקי עבודות קבלניות", href: "/נזקי-עבודות-קבלניות", img: `${SB}/wp/5126/media-5126.jpg` },
  { title: "הערכת רכוש לצורכי הזדכות במס שבח", href: "/הערכת-רכוש-לצורכי-הזדכות-במס-שבח", img: `${SB}/wp/2042/385506.jpg` },
  { title: "נזקי התנגשות", href: "/נזקי-התנגשות", img: `${SB}/wp/5515/2.jpg` },
  { title: "הערכת שמאות לריהוט עתיק", href: "/הערכת-שמאות-לריהוט-עתיק", img: `${SB}/wp/3314/media-3314.webp` },
];

const PROCESS_STEPS = [
  "שיחת ייעוץ וניתוח המקרה",
  "העברת המסמכים",
  "ביקור במקום האירוע",
  'זימון מומחים נוספים ע"פ צורך',
  "הגשת דרישה כספית",
  "הסכם פשרה/הליך משפטי",
  'אישור ההסכם ע"י הלקוח/פסק דין',
  "סילוק התביעה וקבלת תגמולים",
];

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

function encHref(h: string) {
  const [path, ...rest] = h.split("#");
  return encodeURI(path) + (rest.length ? "#" + rest.join("#") : "");
}

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
      <div className="overflow-hidden px-8">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(${(idx * 100) / perView}%)` }}>
          {items.map((s) => (
            <div key={s.slug} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
                <div className="flex h-56 items-center justify-center bg-[#F7F8FB] p-3">
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={s.title} loading="lazy" className="h-full w-auto max-w-full object-contain" />
                  ) : (
                    <div className="text-muted-foreground">מסמך</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 text-right">
                  <h3 className="line-clamp-3 min-h-[3.75rem] text-base font-bold text-[hsl(var(--primary))]">
                    {s.title}
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
            const embed = toEmbedUrl(v.video_url);
            return (
              <div key={v.slug} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
                  <div className="aspect-video w-full bg-black">
                    {embed ? (
                      <iframe
                        src={embed}
                        title={v.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : v.cover_url ? (
                      <img src={v.cover_url} alt={v.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="bg-white px-4 py-3 text-right">
                    <h3 className="line-clamp-2 text-base font-semibold text-[hsl(var(--primary))]">
                      {v.title}
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
      <section className="relative overflow-hidden bg-[#F7F8FB]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16 lg:px-8">
          <div className="order-2 text-right lg:order-2">
            <h1 className="text-3xl font-extrabold leading-tight text-[hsl(var(--primary))] sm:text-4xl lg:text-[42px]">
              שמאי רכוש לנזקי רכוש רפאל ריבוח
            </h1>
            <div className="mt-3 border-t-2 border-dashed border-[hsl(var(--primary))]/60" aria-hidden="true" />
            <p className="mt-4 text-xl font-bold text-[#1F2023] sm:text-2xl">אל תתמודדו לבד מול חברת הביטוח!</p>
            <p className="mt-4 text-base leading-relaxed text-[#333333] sm:text-lg">
              שמאי הביטוח מטעם החברה פועל לקידום האינטרסים שלה, בעוד שבחירה בשמאי רכוש פרטי מעניקה לכם ייצוג אמיתי, הערכה מקצועית ומעמיקה, והבטחה למיצוי הפיצוי המקסימלי המגיע לכם.
            </p>
            <p className="mt-4 text-base font-semibold text-[hsl(var(--primary))]">משרדנו חבר באיגוד השמאים בישראל ומחזיק בתו איכות השירות.</p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <img src={IMG_IGUD} alt="חבר באיגוד השמאים בישראל" className="h-20 w-auto" loading="lazy" />
              <img src={IMG_QUALITY} alt="תו איכות השירות" className="h-16 w-auto" loading="lazy" />
            </div>
            <div className="mt-7">
              <a href="#contact-band" className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--gold))] px-8 py-3 text-base font-bold text-white shadow-md transition hover:brightness-95">
                לשיחת ייעוץ חינם
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-1">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96 lg:h-[520px]">
              <img src={IMG_HERO} alt="רפאל ריבוח - שמאי רכוש" className="h-full w-full object-cover object-center" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="bg-[hsl(var(--muted))] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-6 text-center shadow-md ring-1 ring-black/5">
                <div className="text-3xl font-extrabold tabular-nums text-[hsl(var(--primary))] sm:text-4xl lg:text-[40px]">
                  <Counter target={s.value} />
                </div>
                <div className="mt-2 text-sm font-medium text-[#4a4d55] sm:text-base">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CLIENTS */}
      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[hsl(var(--primary))] sm:text-3xl">לקוחות שבחרו בנו</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
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
            <h2 className="order-1 text-right text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">הנושאים בהם משרדנו עוסק</h2>
            <div className="order-2"><GoldOutlineBtn href="#contact-band">לייעוץ חינם</GoldOutlineBtn></div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <a key={s.title} href={encHref(s.href)} className="group overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={s.img} alt={s.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-[hsl(var(--primary))]/95 px-4 py-3 text-center">
                    <h3 className="text-base font-bold text-white sm:text-lg">{s.title}</h3>
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
            <h2 className="order-1 text-right text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">הליך תביעת ביטוח</h2>
            <div className="order-2"><GoldOutlineBtn href="#contact-band">לייעוץ חינם</GoldOutlineBtn></div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((title, i) => {
              const num = String(i + 1).padStart(2, "0");
              const isLastCol = (i + 1) % 4 === 0;
              return (
                <div key={num} className="relative text-right">
                  <div className="text-[44px] font-extrabold leading-none text-[hsl(var(--gold))]">{num}</div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-[hsl(var(--primary))]">{title}</h3>
                  {!isLastCol && (
                    <div className="pointer-events-none absolute left-[-8px] top-6 hidden h-0 w-6 border-t-2 border-dashed border-[hsl(var(--gold))]/60 lg:block" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. ABOUT */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="order-2 text-right lg:order-1">
            <div className="relative">
              <div className="pointer-events-none absolute -top-4 right-[-16px] h-24 w-24 rounded-full opacity-30" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--gold)) 1.5px, transparent 2px)", backgroundSize: "12px 12px" }} aria-hidden="true" />
              <div className="overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5">
                <img src={IMG_ABOUT} alt="רפאל ריבוח - אודות" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="pointer-events-none absolute -bottom-4 left-[-16px] h-24 w-24 rounded-full opacity-30" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--gold)) 1.5px, transparent 2px)", backgroundSize: "12px 12px" }} aria-hidden="true" />
            </div>
          </div>
          <div className="order-1 text-right lg:order-2">
            <h2 className="text-3xl font-extrabold text-[hsl(var(--gold))] sm:text-4xl">אודות רפאל שמאות רכוש</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-[#333333] sm:text-lg">
              {ABOUT_PARAGRAPHS.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
            </div>
            <div className="mt-7"><GoldOutlineBtn href="/about">קראו עוד</GoldOutlineBtn></div>
          </div>
        </div>
      </section>

      {/* 8. TEAM */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">צוות החברה</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="flex flex-col items-center rounded-2xl border-b-4 border-[#063760] bg-card p-8 text-center shadow-md">
                <img src={m.photo} alt={m.name} loading="lazy" className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-white" />
                <h3 className="mt-5 text-xl font-bold text-[hsl(var(--primary))]">{m.name}</h3>
                <p className="mt-1 text-sm italic text-muted-foreground">{m.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#4a4d55]">{m.bio}</p>
                <a href={encHref(m.href)} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#dc2f5a] hover:underline">
                  עוד <ArrowLeft className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SUCCESSES */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">ההצלחות שלנו</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12">
            <SuccessCarousel items={successes} />
          </div>
          <div className="mt-10 text-center">
            <GoldPill href={encHref("/ההצלחות-שלנו")}>לכל ההצלחות</GoldPill>
          </div>
        </div>
      </section>

      {/* 10. WHY US — blue band */}
      <section className="relative overflow-hidden bg-[#1470CE] py-16 text-white sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--gold)) 1.5px, transparent 2px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">למה לבחור דווקא ברפאל שמאות רכוש</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            {whyUs.map((w) => (
              <div key={w.title} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--gold))] text-[#063760] shadow-lg">
                  <w.Icon className="h-9 w-9" strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. GALLERY */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">גלריית הפרויקטים</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY.map((g) => (
              <a key={g.title} href={encHref("/גלריית-נזקים")} className="group block text-right">
                <h3 className="mb-3 text-lg font-bold text-[hsl(var(--primary))]">{g.title}</h3>
                <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5">
                  <img src={g.img} alt={g.title} loading="lazy" className="h-80 w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 text-center">
            <GoldPill href={encHref("/גלריית-נזקים")}>לצפיה בגלריה</GoldPill>
          </div>
        </div>
      </section>

      {/* 12. VIDEOS */}
      <section className="bg-[hsl(var(--muted))] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">סרטונים</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12">
            <VideoCarousel items={videos} />
          </div>
        </div>
      </section>

      {/* 13. PRESS */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">כתבו עלינו</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
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
                <div className="bg-[hsl(var(--gold))] py-3 text-center text-sm font-bold text-white group-hover:brightness-95">
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
          <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">מאמרים בנושא שמאות רכוש</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const excerpt = a.excerpt ? decodeEntities(a.excerpt) : "";
              return (
                <article key={a.slug} className="flex flex-col rounded-2xl bg-white p-6 text-right shadow-md ring-1 ring-black/5">
                  <h3 className="text-lg font-bold leading-snug text-[hsl(var(--primary))]">
                    <a href={encHref(`/${a.slug}`)} className="hover:underline">{a.title}</a>
                  </h3>
                  {excerpt && (
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-[#4a4d55]">{excerpt}</p>
                  )}
                  <div className="mt-5">
                    <a href={encHref(`/${a.slug}`)} className="inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--gold))] hover:underline">
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

      {/* 15. CTA */}
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
