import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Youtube, Linkedin, Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";

type Category = { id: string; slug: string; name: string };

const SERVICES = [
  { label: "ייעוץ וליווי תביעות ביטוח", href: "/ייעוץ-וליווי-תביעות-ביטוח" },
  { label: "נזקי מים הצפה ורטיבות", href: "/נזקי-מים-הצפה-ורטיבות" },
  { label: "נזקי אש ופיח", href: "/נזקי-אש-ופיח" },
  { label: "נזקי טבע שיטפונות וסערה", href: "/נזקי-טבע-שיטפונות-וסערה" },
  { label: "נזקי שוכרים", href: "/נזקי-שוכרים" },
  { label: "נזקי פריצה", href: "/נזקי-פריצה" },
  { label: "נזקי התנגשות", href: "/נזקי-התנגשות" },
  { label: "נזקי עבודות קבלניות", href: "/נזקי-עבודות-קבלניות" },
  { label: "חו״ד קבילה משפטית", href: "/חוד-קבילה-משפטית" },
  { label: "הערכת שווי רכוש", href: "/הערכת-שווי-רכוש" },
  { label: "הערכת שמאות לריהוט עתיק", href: "/הערכת-שמאות-לריהוט-עתיק" },
  { label: "הערכת רכוש לצורכי הזדכות במס שבח", href: "/הערכת-רכוש-לצורכי-הזדכות-במס-שבח" },
];

const MAIN_MENU = [
  { label: "דף הבית", href: "/" },
  { label: "אודות", href: "/about" },
  { label: "שאלות תשובות", href: "/שאלות-תשובות" },
  { label: "ההצלחות שלנו", href: "/ההצלחות-שלנו" },
  { label: "כתבו עלינו", href: "/כתבו-עלינו" },
  { label: "סרטונים", href: "/סרטונים" },
  { label: "מאמרים", href: "/category/מידע-מקצועי" },
  { label: "הסמכות", href: "/הסמכות" },
  { label: "דרושים", href: "/דרושים" },
  { label: "צור קשר", href: "/צור-קשר" },
];

const LEGAL = [
  { label: "תקנון", href: "/terms" },
  { label: "מדיניות פרטיות", href: "/privacy" },
  { label: "הצהרת נגישות", href: "/accessibility" },
  { label: "מפת אתר", href: "/sitemap-page" },
];

function encodeHref(href: string) {
  return href
    .split("/")
    .map((seg) => (seg ? encodeURIComponent(seg) : seg))
    .join("/");
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("is_spam", false)
    .order("name", { ascending: true });
  if (error) return [];
  return (data as Category[]) ?? [];
}

export function SiteFooter() {
  const { data: categories = [] } = useQuery({
    queryKey: ["footer-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const telHref = `tel:${siteConfig.phone.replace(/[^0-9+]/g, "")}`;
  const waHref = `https://wa.me/${siteConfig.whatsapp}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-[hsl(var(--brand-navy,207_87%_20%))] text-white" dir="rtl" style={{ backgroundColor: siteConfig.colors.navy }}>
      {/* Top: emergency band */}
      <div className="border-b border-white/10" style={{ backgroundColor: siteConfig.colors.navyDeep }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:px-6 lg:flex-row lg:text-start">
          <p className="text-sm font-semibold text-white sm:text-base">
            זמינים 24 שעות במקרים דחופים · לשיחת ייעוץ חינם חייגו עכשיו!
          </p>
          <a
            href={telHref}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-lg font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: siteConfig.colors.gold }}
          >
            <Phone className="h-5 w-5" />
            {siteConfig.phone}
          </a>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="text-center sm:text-start">
            <a href="/" aria-label={`${siteConfig.brandName} - דף הבית`}>
              <img
                src={siteConfig.logoLightUrl}
                alt={siteConfig.brandName}
                className="mx-auto h-16 w-auto sm:mx-0"
              />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              רפאל שמאות רכוש - משרד שמאי רכוש פרטי ובלתי תלוי. אנו מתמחים בהערכת נזקי רכוש וניהול תביעות ביטוח עבור לקוחות פרטיים ועסקיים. הייצוג שלנו הוא אך ורק מול חברות הביטוח, כדי להבטיח שתקבלו את הפיצוי המקסימלי המגיע לכם.
            </p>
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/60">עקבו אחרינו</p>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                {[
                  { Icon: Facebook, href: "https://facebook.com", label: "פייסבוק" },
                  { Icon: Instagram, href: "https://instagram.com", label: "אינסטגרם" },
                  { Icon: Youtube, href: "https://youtube.com", label: "יוטיוב" },
                  { Icon: Linkedin, href: "https://linkedin.com", label: "לינקדאין" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/85 transition hover:border-white hover:text-white"
                    style={{ transition: "all .2s" }}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-start">
            <h3 className="mb-4 text-base font-bold text-white">צור קשר</h3>
            <ul className="space-y-3 text-sm text-white/85">
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <Phone className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <a href={telHref} className="hover:text-white">{siteConfig.phone}</a>
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white">{siteConfig.email}</a>
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <MessageCircle className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  אנחנו זמינים גם ב-whatsapp {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: siteConfig.colors.gold }} />
                <span>אזור פעילות: {siteConfig.coverage}</span>
              </li>
            </ul>

            <h4 className="mt-6 mb-3 flex items-center justify-center gap-2 text-sm font-bold text-white sm:justify-start">
              <Clock className="h-4 w-4" style={{ color: siteConfig.colors.gold }} />
              שעות פעילות
            </h4>
            <ul className="space-y-1 text-sm text-white/80">
              {siteConfig.hours.map((h) => (
                <li key={h.days} className="flex justify-center gap-3 sm:justify-start">
                  <span className="font-semibold text-white">{h.days}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>

            <h4 className="mt-6 mb-2 text-sm font-bold text-white">סניפים</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {siteConfig.branches.map((b) => (
                <li key={b.name}>
                  <span className="font-semibold text-white">{b.name}: </span>
                  {b.addr}
                </li>
              ))}
            </ul>
          </div>

          {/* Main menu */}
          <div className="text-center sm:text-start">
            <h3 className="mb-4 text-base font-bold text-white">תפריט ראשי</h3>
            <ul className="space-y-2 text-sm">
              {MAIN_MENU.map((m) => (
                <li key={m.label}>
                  <a href={encodeHref(m.href)} className="text-white/80 transition hover:text-white">
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="text-center sm:text-start">
            <h3 className="mb-4 text-base font-bold text-white">שירותי החברה</h3>
            <ul className="space-y-2 text-sm">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <a href={encodeHref(s.href)} className="text-white/80 transition hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mt-12 border-t border-white/10 pt-8">
            <h3 className="mb-4 text-center text-base font-bold text-white sm:text-start">קטגוריות</h3>
            <nav aria-label="קטגוריות" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:justify-start">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`/category/${encodeURIComponent(c.slug)}`}
                  className="text-white/75 transition hover:text-white"
                >
                  {c.name}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row">
          <nav aria-label="מידע משפטי" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <a key={l.label} href={l.href} className="transition hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <p className="text-center">
            (C) {year} {siteConfig.brandName} - כל הזכויות שמורות
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
