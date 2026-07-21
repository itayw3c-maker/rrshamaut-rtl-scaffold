import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type NavChild = { label: string; href: string };
type NavItem = { label: string; href?: string; children?: NavChild[]; mobileOnly?: boolean };

const SERVICES: NavChild[] = [
  { label: "ייעוץ וליווי תביעות ביטוח", href: "/ייעוץ-וליווי-תביעות-ביטוח" },
  { label: "שמאי נזקי מים הצפה ורטיבות", href: "/נזקי-מים-הצפה-ורטיבות" },
  { label: "שמאי נזקי אש ופיח", href: "/נזקי-אש-ופיח" },
  { label: "שמאי נזקי טבע שיטפונות וסערה", href: "/נזקי-טבע-שיטפונות-וסערה" },
  { label: "נזקי שוכרים", href: "/נזקי-שוכרים" },
  { label: "נזקי פריצה", href: "/שמאי-נזקי-פריצה" },
  { label: "נזקי התנגשות", href: "/שמאי-נזקי-התנגשות" },
  { label: "נזקי עבודות קבלניות", href: "/שמאי-נזקי-עבודות-קבלניות" },
  { label: "חו\"ד קבילה משפטית", href: "/חווד-קבילה-משפטית" },
  { label: "הערכת שווי רכוש", href: "/הערכת-שווי-רכוש" },
  { label: "הערכת שמאות לריהוט עתיק", href: "/הערכת-שמאות-לריהוט-עתיק" },
  { label: "הערכת רכוש לצורכי הזדכות במס שבח", href: "/הערכת-רכוש-לצורכי-הזדכות-במס-שבח" },
];

const ABOUT_CHILDREN: NavChild[] = [
  { label: "רפאל ריבוח", href: "/about/השמאי-רפאל-ריבוח-מייסד-ובעלים-2" },
  { label: "אינג', ארז אריה", href: "/about/המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו" },
  { label: "עו\"ד קובי ליבוביץ'", href: "/about/השמאי-רפאל-ריבוח-מייסד-ובעלים" },
];

const MEDIA_CHILDREN: NavChild[] = [
  { label: "כתבו עלינו", href: "/כתבו-עלינו" },
  { label: "סרטונים", href: "/סרטונים" },
  { label: "גלריית נזקים", href: "/גלריית-נזקי-מים-אש-ומלחמה" },
];

const NAV: NavItem[] = [
  { label: "דף הבית", href: "/" },
  { label: "אודות", href: "/about", children: ABOUT_CHILDREN },
  { label: "השירותים שלנו", children: SERVICES },
  { label: "שאלות תשובות", href: "/שאלות-תשובות" },
  { label: "ההצלחות שלנו", href: "/ההצלחות-שלנו" },
  { label: "מדיה", children: MEDIA_CHILDREN },
  { label: "הסמכות", href: "/תעודות", mobileOnly: true },
  { label: "מאמרים", href: "/category/מידע-מקצועי" },
  { label: "צור קשר", href: "/צור-קשר" },
];

function encodeHref(href: string) {
  // Encode Hebrew segments while preserving slashes.
  return href
    .split("/")
    .map((seg) => (seg ? encodeURIComponent(seg) : seg))
    .join("/");
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const telHref = `tel:${siteConfig.phone.replace(/[^0-9+]/g, "")}`;

  const isActive = (href?: string) => {
    if (!href) return false;
    try {
      const decoded = decodeURIComponent(pathname);
      if (href === "/") return decoded === "/" || decoded === "";
      return decoded === href || decoded === href + "/";
    } catch {
      return pathname === href;
    }
  };

  const navLinkBase =
    "inline-flex items-center gap-1 rounded-md px-2 py-[13px] 2xl:px-5 text-[clamp(15px,1.1vw,22px)] font-normal transition-colors hover:text-[#056FC4]";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" dir="rtl">
      <div className="flex h-20 w-full items-center justify-between gap-4 px-6 lg:h-24 lg:px-8 xl:h-[117px] xl:px-10">
        {/* Logo (RTL start = right) */}
        <Link to="/" aria-label={`${siteConfig.brandName} - דף הבית`} className="flex shrink-0 items-center">
          <img
            src={siteConfig.logoDarkUrl}
            alt={siteConfig.brandName}
            className="h-12 w-auto sm:h-14 lg:h-16 2xl:h-auto 2xl:w-[456px]"
            width={456}
            height={97}
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="ניווט ראשי" className="hidden flex-1 items-center justify-center lg:flex">
          <ul className="flex items-center gap-1 xl:gap-2">
            {NAV.filter((item) => !item.mobileOnly).map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openMenu === item.label;
              const active = isActive(item.href);
              const colorCls = active ? "text-[#056FC4]" : "text-[rgb(31,32,35)]";
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenMenu(item.label)}
                  onMouseLeave={() => hasChildren && setOpenMenu(null)}
                >
                  {item.href ? (
                    <a
                      href={encodeHref(item.href)}
                      className={`${navLinkBase} ${colorCls}`}
                    >
                      {item.label}
                      {hasChildren && <ChevronDown className="h-4 w-4 opacity-70" />}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenMenu(isOpen ? null : item.label)}
                      className={`${navLinkBase} ${colorCls}`}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </button>
                  )}

                  {hasChildren && isOpen && (
                    <div className="absolute end-0 top-full z-50 min-w-[280px] rounded-lg border border-black/5 bg-white p-2 shadow-xl">
                      <ul className="flex flex-col">
                        {item.children!.map((c) => (
                          <li key={c.label}>
                            <a
                              href={encodeHref(c.href)}
                              className="block rounded-md px-3 py-2 text-sm text-[rgb(31,32,35)] transition-colors hover:bg-muted hover:text-[#056FC4]"
                            >
                              {c.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>


        {/* CTA (RTL end = left) */}
        <div className="hidden lg:flex">
          <a
            href={telHref}
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--gold))] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:brightness-95"
          >
            <Phone className="h-4 w-4" />
            {siteConfig.phone}
          </a>
        </div>


        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label="פתח תפריט"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-4">
              <img src={siteConfig.logoDarkUrl} alt={siteConfig.brandName} className="h-10 w-auto" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md"
                aria-label="סגור תפריט"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="ניווט נייד" className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="flex flex-col">
                {NAV.map((item) => {
                  const hasChildren = !!item.children?.length;
                  const isExp = !!expanded[item.label];
                  return (
                    <li key={item.label} className="border-b border-black/5 last:border-b-0">
                      <div className="flex items-center">
                        {item.href ? (
                          <a
                            href={encodeHref(item.href)}
                            className="flex-1 rounded-md px-3 py-3 text-base font-semibold text-foreground min-h-11"
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="flex-1 px-3 py-3 text-base font-semibold text-foreground">
                            {item.label}
                          </span>
                        )}
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((s) => ({ ...s, [item.label]: !s[item.label] }))
                            }
                            className="inline-flex h-11 w-11 items-center justify-center"
                            aria-expanded={isExp}
                            aria-label={`הרחב ${item.label}`}
                          >
                            <ChevronDown
                              className={`h-5 w-5 transition-transform ${isExp ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>
                      {hasChildren && isExp && (
                        <ul className="border-t border-black/5 bg-muted/40 pb-2">
                          {item.children!.map((c) => (
                            <li key={c.label}>
                              <a
                                href={encodeHref(c.href)}
                                onClick={() => setMobileOpen(false)}
                                className="block px-6 py-3 text-sm text-foreground min-h-11"
                              >
                                {c.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="p-3">
                <a
                  href={telHref}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--gold))] px-5 py-3 text-sm font-bold text-white"
                >
                  <Phone className="h-4 w-4" />
                  {siteConfig.phone}
                </a>
              </div>

            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default SiteHeader;
