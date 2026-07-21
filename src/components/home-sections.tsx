/**
 * Shared homepage section components. Extracted so they can be reused by
 * per-service pages (e.g. ServicePageContent). Keep the markup here in sync
 * with the inline versions in src/routes/index.tsx.
 *
 * Sections exported: TeamSection, WhyUsSection, SuccessesSection, HelpBand,
 * ReviewsSection. Internal helpers: SuccessCarousel, useCarousel, GoldPill,
 * encHref, GoogleG.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  HeartHandshake, Award, Network, TrendingUp, Users,
  ChevronRight, ChevronLeft, ArrowLeft,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { submitLeadFn } from "@/lib/leads.functions";
import { getHomeSuccessesFn, type HomeSuccess } from "@/lib/home.functions";

const SB = "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media";

export function encHref(h: string) {
  const [path, ...rest] = h.split("#");
  return encodeURI(path) + (rest.length ? "#" + rest.join("#") : "");
}

export function GoldPill({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
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

export function useCarousel<T>(items: T[], breakpoints: { mobile: number; tablet: number; desktop: number }) {
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

export function TeamSection() {
  return (
    <section className="bg-[hsl(var(--muted))] py-16 sm:py-20" dir="rtl">
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
  );
}

const whyUs = [
  { Icon: HeartHandshake, title: "שקט נפשי אמיתי", desc: "עובדים על בסיס הצלחה - לא קיבלתם פיצוי, לא שילמתם." },
  { Icon: Award, title: "מקצועיות מהשטח", desc: "ניסיון רב ומוכח בשמאות רכוש ובטיפול בנזקי רכוש מורכבים." },
  { Icon: Network, title: "הבנה מערכתית מלאה", desc: "היכרות מעמיקה עם עולם הביטוח והמשפט בתביעות רכוש, כולל אופן הפעולה של חברות הביטוח." },
  { Icon: TrendingUp, title: "מקסום התוצאה עבורכם", desc: "ידע ויכולות מקצועיות מתקדמות שמטרתן להגדיל משמעותית את היקף הפיצוי המגיע לכם." },
  { Icon: Users, title: "נאמנות לצד שלכם בלבד", desc: "אנו לא עובדים עבור חברות ביטוח - רק עבור מבוטחים." },
];

export function WhyUsSection() {
  return (
    <section dir="rtl" className="relative overflow-hidden bg-[#1470CE] py-16 text-white sm:py-20">
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
  );
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

export function SuccessesSection() {
  const { data: successes = [] } = useQuery<HomeSuccess[]>({
    queryKey: ["home-successes"],
    queryFn: () => getHomeSuccessesFn(),
    staleTime: 5 * 60_000,
  });
  return (
    <section dir="rtl" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">תוצאות שהשגנו ללקוחותינו</h2>
        <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
        <div className="mt-12">
          <SuccessCarousel items={successes} />
        </div>
        <div className="mt-10 text-center">
          <GoldPill href={encHref("/ההצלחות-שלנו")}>לכל ההצלחות</GoldPill>
        </div>
      </div>
    </section>
  );
}

const HELP_DAMAGE = [
  "נזק מים",
  "נזק אש",
  "נזק טבע",
  "נזקי רכוש",
  "דחיית תביעה",
  "הערכת שווי רכוש",
  "אחר",
];

export function HelpBand() {
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
    "block w-full min-h-11 rounded-md border border-white/20 bg-[#D6E9FA] px-3 py-2 text-base text-[#0B2B4B] placeholder:text-[#4a5b6d] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]";

  return (
    <section dir="rtl" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[2rem] bg-[#1470CE] px-6 py-12 sm:px-12 sm:py-16"
          style={{
            backgroundImage:
              "radial-gradient(rgba(203,164,54,0.28) 1.2px, transparent 1.4px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-right text-white">
              <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                צרו איתנו קשר
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
                <input type="text" placeholder="שם מלא" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errs.name} className={inputCls} />
                {errs.name && <p className="mt-1 text-xs text-white">{errs.name}</p>}
              </div>
              <div>
                <input type="tel" placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errs.phone} className={inputCls} />
                {errs.phone && <p className="mt-1 text-xs text-white">{errs.phone}</p>}
              </div>
              <div>
                <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} className={inputCls} />
                {errs.email && <p className="mt-1 text-xs text-white">{errs.email}</p>}
              </div>
              <div>
                <select value={damage} onChange={(e) => setDamage(e.target.value)} className={inputCls}>
                  <option value="">באיזה נזק מדובר?</option>
                  {HELP_DAMAGE.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              <label className="mt-1 flex cursor-pointer items-start gap-2 text-sm text-white">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--gold))]" />
                <span>אני מאשר/ת כי קראתי את מדיניות הפרטיות ואני מסכימ/ה לשמירת הפרטים לצורך יצירת קשר.</span>
              </label>
              {errs.consent && <p className="text-sm font-semibold text-[#FFD6D6]">{errs.consent}</p>}
              {errs.submit && <p className="text-sm font-semibold text-[#FFD6D6]">{errs.submit}</p>}
              <div className="mt-2">
                <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[hsl(var(--gold))] px-8 py-3 text-base font-bold text-white shadow-md transition hover:brightness-95 disabled:opacity-70">
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

const REVIEW_SCREENSHOTS: string[] = [
  `${SB}/wp/2385/2025-04-09-172208.png`,
  `${SB}/wp/2386/2025-04-09-172214.png`,
  `${SB}/wp/2387/2025-04-09-172237.png`,
  `${SB}/wp/2388/2025-04-09-172246.png`,
  `${SB}/wp/2389/2025-04-09-172252.png`,
  `${SB}/wp/2390/2025-04-09-172307.png`,
  `${SB}/wp/2391/2025-04-09-172316.png`,
  `${SB}/wp/2392/2025-04-09-172323.png`,
  `${SB}/wp/2393/2025-04-09-172340.png`,
  `${SB}/wp/2394/2025-04-09-172352.png`,
];
const MIDRAG_IMG = `${SB}/wp/2382/whatsapp-2025-03-11-18-16-20-cf0b428d.jpg`;

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

export function ReviewsSection() {
  const { idx, setIdx, perView, maxIdx } = useCarousel(REVIEW_SCREENSHOTS, { mobile: 1, tablet: 2, desktop: 3 });
  return (
    <section dir="rtl" className="bg-[hsl(var(--muted))] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-[hsl(var(--primary))] sm:text-4xl">מה אומרים עלינו?</h2>
        <div className="mx-auto mt-3 h-1 w-16 rounded bg-[hsl(var(--gold))]" />
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="text-2xl font-extrabold text-[#0B2B4B]">מְעוּלֶה</div>
          <div className="flex items-center gap-1" aria-label="5 מתוך 5 כוכבים">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className="h-6 w-6 fill-[hsl(var(--gold))]" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-[#4a4d55]">מבוסס על <strong>513 ביקורות</strong></div>
          <div className="mt-1 flex items-center gap-2">
            <GoogleG className="h-6 w-6" />
            <span className="text-lg font-bold text-[#4a4d55]">Google</span>
          </div>
        </div>
        <div className="relative mt-10">
          <button type="button" onClick={() => setIdx((i) => (i <= 0 ? maxIdx : i - 1))} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-white sm:-right-3" aria-label="הקודם">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setIdx((i) => (i >= maxIdx ? 0 : i + 1))} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-[hsl(var(--primary))] shadow ring-1 ring-black/5 hover:bg-white sm:-left-3" aria-label="הבא">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="overflow-hidden px-8">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(${(idx * 100) / perView}%)` }}>
              {REVIEW_SCREENSHOTS.map((src, i) => (
                <div key={src} className="shrink-0 px-3" style={{ width: `${100 / perView}%` }}>
                  <div className="flex h-72 items-center justify-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5">
                    <img src={src} alt={`ביקורת לקוח ${i + 1}`} loading="lazy" className="h-64 w-auto max-w-full object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-3">
          <img src={MIDRAG_IMG} alt="הדירוג שלי במידרג" loading="lazy" className="h-16 w-auto" />
          <p className="text-sm font-semibold text-[#4a4d55]">הדירוג שלי במידרג</p>
        </div>
      </div>
    </section>
  );
}
