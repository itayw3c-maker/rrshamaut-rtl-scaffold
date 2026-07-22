import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin, MessageCircle, ChevronLeft } from "lucide-react";
import { FaInstagram, FaTiktok, FaYoutube, FaFacebookF } from "react-icons/fa";
import { SiThreads } from "react-icons/si";
import { siteConfig } from "@/lib/site-config";
import { getFooterArticlesFn, type FooterArticle } from "@/lib/home.functions";

const FOOTER_LOGO =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/420/group-1.png";
const BADGE_IGUD =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6072/igud.webp";
const BADGE_QUALITY =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/6080/quality.webp";

const SOCIALS: Array<{ Icon: React.ComponentType<{ className?: string }>; href: string; label: string }> = [
  { Icon: FaInstagram, href: "https://www.instagram.com/rrshamaut?igsh=MTVxNDk4dDF2b2U0MA==", label: "אינסטגרם" },
  { Icon: SiThreads, href: "https://www.threads.com/@rrshamaut", label: "Threads" },
  { Icon: FaTiktok, href: "https://www.tiktok.com/@rephaelshamaut", label: "TikTok" },
  { Icon: FaYoutube, href: "https://youtube.com/@rephael.shamaut-rr", label: "YouTube" },
  { Icon: FaFacebookF, href: "https://www.facebook.com/rrshamaut/", label: "פייסבוק" },
];


const MAIN_MENU = [
  { label: "דף הבית", href: "/" },
  { label: "אודות", href: "/about" },
  { label: "שאלות תשובות", href: "/שאלות-תשובות" },
  { label: "ההצלחות שלנו", href: "/ההצלחות-שלנו" },
  { label: "כתבו עלינו", href: "/כתבו-עלינו" },
  { label: "סרטונים", href: "/סרטונים" },
  { label: "מאמרים", href: "/category/מידע-מקצועי" },
  { label: "הסמכות", href: "/תעודות/" },
  { label: "דרושים", href: "/jobs/" },
  { label: "צור קשר", href: "/צור-קשר" },
];

const SERVICES = [
  { label: "ייעוץ וליווי תביעות ביטוח", href: "/ייעוץ-וליווי-תביעות-ביטוח/" },
  { label: "שמאי נזקי התנגשות", href: "/שמאי-נזקי-התנגשות/" },
  { label: "נזקי מים הצפה ורטיבות", href: "/נזקי-מים-הצפה-ורטיבות/" },
  { label: "נזקי אש ופיח", href: "/נזקי-אש-ופיח/" },
  { label: "נזקי טבע שיטפונות וסערה", href: "/נזקי-טבע-שיטפונות-וסערה/" },
  { label: "נזקי שוכרים", href: "/נזקי-שוכרים/" },
  { label: "נזקי פריצה", href: "/שמאי-נזקי-פריצה/" },
  { label: 'חו"ד קבילה משפטית', href: "/חווד-קבילה-משפטית/" },
  { label: "הערכת שווי רכוש", href: "/הערכת-שווי-רכוש/" },
  { label: "הערכת שמאות לריהוט עתיק", href: "/הערכת-שמאות-לריהוט-עתיק/" },
  { label: "הערכת רכוש לצורכי הזדכות במס שבח", href: "/הערכת-רכוש-לצורכי-הזדכות-במס-שבח/" },
  { label: "נזקי עבודות קבלניות", href: "/שמאי-נזקי-עבודות-קבלניות/" },
];

const LEGAL = [
  { label: "מדיניות פרטיות", href: "/מדיניות-פרטיות/" },
  { label: "הצהרת נגישות", href: "/accessibility" },
  { label: "מפת אתר", href: "/מפת-אתר/" },
];

import { appHref as encodeHref } from "@/lib/href";

function MapCard({ q, caption }: { q: string; caption: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/60">מפות</div>
      <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
        <iframe
          src={src}
          title={caption}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-40 w-full border-0"
        />
      </div>
      <p className="mt-2 text-xs text-white/80">{caption}</p>
    </div>
  );
}

export function SiteFooter() {
  const { data: articles = [] } = useQuery<FooterArticle[]>({
    queryKey: ["footer-articles"],
    queryFn: () => getFooterArticlesFn(),
    staleTime: 10 * 60_000,
  });

  const telHref = `tel:${siteConfig.phone.replace(/[^0-9+]/g, "")}`;
  const waHref = `https://wa.me/${siteConfig.whatsapp}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 text-white" dir="rtl" style={{ backgroundColor: "#0B2B4B" }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* TOP: 3 columns */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* RIGHT: Brand + socials */}
          <div className="order-1 text-center lg:text-right">
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <img src={FOOTER_LOGO} alt="רפאל שמאות רכוש" className="h-16 w-auto" />
              <img src={BADGE_QUALITY} alt="תו איכות השירות" className="h-14 w-auto" />
              <img src={BADGE_IGUD} alt="חבר באיגוד השמאים" className="h-14 w-auto" />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-white">רפאל שמאות רכוש</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              משרד <strong className="text-white">שמאי רכוש פרטי ובלתי תלוי</strong>. אנו מתמחים בהערכת נזקי רכוש וניהול תביעות ביטוח עבור לקוחות פרטיים ועסקיים. הייצוג שלנו הוא <strong className="text-white">אך ורק מול חברות הביטוח</strong>, כדי להבטיח שתקבלו את הפיצוי המקסימלי המגיע לכם.
            </p>
            <p className="mt-4 text-sm font-semibold text-white/90">
              עקבו אחרינו לטיפים ומידע בנושא
            </p>

            <a
              href={telHref}
              className="mt-4 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
              style={{ backgroundColor: siteConfig.colors.gold }}
            >
              <Phone className="h-4 w-4" />
              זמינים 24 שעות במקרים דחופים
            </a>

            <div className="mt-4 flex items-center justify-center gap-2 lg:justify-start">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--gold))] text-[hsl(var(--gold))] transition hover:bg-[hsl(var(--gold))] hover:text-[#0B2B4B]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* CENTER: Contact + Hours */}
          <div className="order-2 text-center lg:text-right">
            <h3 className="mb-4 text-lg font-extrabold text-white">צרו קשר</h3>
            <ul className="space-y-3 text-sm text-white/90">
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Phone className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <a href={telHref} className="hover:text-white">{siteConfig.phone}</a>
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Mail className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white">{siteConfig.email}</a>
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <MessageCircle className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  אנחנו זמינים גם ב-whatsapp {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <span>אזור פעילות: כל הארץ</span>
              </li>
            </ul>

            <h4 className="mt-8 mb-3 text-base font-extrabold text-white">שעות פעילות</h4>
            <ul className="mx-auto max-w-xs space-y-1 text-sm text-white/85">
              <li className="flex justify-between border-b border-white/10 pb-1">
                <span className="font-semibold">יום ראשון-חמישי</span>
                <span>07:00 - 21:00</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-1">
                <span className="font-semibold">יום שישי</span>
                <span>07:00 - 16:00</span>
              </li>
              <li className="flex justify-between">
                <span className="font-semibold">יום שבת</span>
                <span>סגור</span>
              </li>
            </ul>
          </div>

          {/* LEFT: Maps */}
          <div className="order-3 space-y-5">
            <MapCard q="הבנאים 5, אשדוד" caption="סניף דרום: הבנאים 5, א.ת אשדוד" />
            <MapCard q="השושנים 1, פוריה נווה עובד" caption="סניף צפון: השושנים 1, פוריה - נווה עובד" />
          </div>
        </div>

        {/* BOTTOM: 3 link columns */}
        <div className="mt-14 grid grid-cols-1 gap-10 border-t border-white/10 pt-10 md:grid-cols-3">
          <FooterLinkCol title="תפריט ראשי" items={MAIN_MENU} />
          <FooterLinkCol title="שירותי החברה" items={SERVICES} />
          <FooterLinkCol
            title="מאמרים חשובים"
            items={articles.map((a) => ({ label: a.title, href: `/${a.slug}` }))}
          />
        </div>

        {/* Legal + copyright */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
          <nav aria-label="מידע משפטי" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <a key={l.label} href={encodeHref(l.href)} className="transition hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <p className="text-center">
            © {year} {siteConfig.brandName} · כל הזכויות שמורות
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkCol({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="text-center md:text-right">
      <h3 className="mb-4 text-base font-extrabold text-white">{title}</h3>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={`${it.label}-${it.href}`}>
            <a
              href={encodeHref(it.href)}
              className="inline-flex items-center gap-1.5 text-white/80 transition hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-[hsl(var(--gold))]" aria-hidden="true" />
              <span className="line-clamp-2">{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SiteFooter;
