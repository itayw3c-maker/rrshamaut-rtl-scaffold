import type { ResolvedPage } from "@/lib/content.functions";
import { PageHero } from "@/components/PageHero";
import { SidebarPhoneCard, SidebarLeadForm } from "@/components/SidebarCards";
import { FaqView } from "@/components/special/FaqView";
import { ContactView } from "@/components/special/ContactView";
import { GalleryView } from "@/components/special/GalleryView";
import { PressArchiveView } from "@/components/special/PressArchiveView";
import {
  VideoArchiveGrid,
  SuccessArchiveGrid,
} from "@/components/special/VideoArchiveGrid";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

const HERO_TITLE_OVERRIDES: Record<string, string> = {
  "about": "הדרך שלנו",
  "הסדרי-נגישות": "הסדרי נגישות חברת רפאל שמאות רכוש",
};

function stripLeadingHeading(html: string, text: string): string {
  const escaped = text
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/ +/g, "(?:\\s|&nbsp;|\\u00a0)+");
  const re = new RegExp(`^\\s*<(h[1-3])\\b[^>]*>[\\s\\u00a0]*${escaped}[\\s\\u00a0]*</\\1>\\s*`, "i");
  return html.replace(re, "");
}


const SERVICE_SLUGS = new Set([
  "ייעוץ-וליווי-תביעות-ביטוח",
  "נזקי-מים-הצפה-ורטיבות",
  "נזקי-אש-ופיח",
  "נזקי-טבע-שיטפונות-וסערה",
  "נזקי-שוכרים",
  "חווד-קבילה-משפטית",
  "חוד-קבילה-משפטית",
  "שמאי-נזקי-פריצה",
  "הערכת-שווי-רכוש",
  "שמאי-נזקי-עבודות-קבלניות",
  "הערכת-רכוש-לצורכי-הזדכות-במס-שבח",
  "שמאי-נזקי-התנגשות",
  "הערכת-שמאות-לריהוט-עתיק",
]);

const NON_SERVICE_SPECIAL = new Set([
  "שאלות-תשובות",
  "צור-קשר",
  "גלריית-נזקי-מים-אש-ומלחמה",
  "סרטונים",
  "ההצלחות-שלנו",
  "כתבו-עלינו",
  "רפאל-שמאות-רכוש",
  "about",
  "מפת-אתר",
  "מדיניות-פרטיות",
  "הסדרי-נגישות",
  "תעודות",
  "jobs",
  "damage-assessments-loss-adjusting",
  "thank-you",
  "השמאי-רפאל-ריבוח-מייסד-ובעלים",
  "השמאי-רפאל-ריבוח-מייסד-ובעלים-2",
  "המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו",
]);

export function StaticPageView({ page }: { page: ResolvedPage }) {
  const title = decodeEntities(page.title);
  const slug = page.slug;

  // Special custom templates
  if (slug === "שאלות-תשובות") return <FaqView html={page.content} />;
  if (slug === "צור-קשר") return <ContactView />;
  if (slug === "גלריית-נזקי-מים-אש-ומלחמה") return <GalleryView html={page.content} />;
  if (slug === "כתבו-עלינו") return <PressArchiveView cards={page.press ?? []} />;

  // Archive pages: videos / successes (page copy + grid)
  if (slug === "סרטונים" && page.archive?.type === "video") {
    return (
      <div dir="rtl">
        <PageHero title={title} />
        {page.content && (
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div
              className="prose prose-article max-w-none text-right"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        )}
        <VideoArchiveGrid items={page.archive.items} />
      </div>
    );
  }
  if (slug === "ההצלחות-שלנו" && page.archive?.type === "success") {
    // Skip page.content to avoid duplicating the H2 + card grid that ships in the imported HTML.
    return (
      <div dir="rtl">
        <PageHero title={title} />
        <SuccessArchiveGrid items={page.archive.items} />
      </div>
    );
  }

  // Service / long page => 2-col with sidebar
  const isService = SERVICE_SLUGS.has(slug);
  const isLong = page.content.length > 3000 && !NON_SERVICE_SPECIAL.has(slug);
  const withSidebar = isService || isLong;

  const heroTitle = HERO_TITLE_OVERRIDES[slug] ?? title;
  const content = HERO_TITLE_OVERRIDES[slug]
    ? stripLeadingHeading(page.content, HERO_TITLE_OVERRIDES[slug])
    : page.content;

  return (
    <article dir="rtl">
      <PageHero title={heroTitle} />
      {content && (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {withSidebar ? (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div
                  className="prose prose-article max-w-none text-right"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
              <aside className="lg:col-span-4">
                <div className="space-y-6 lg:sticky lg:top-24">
                  <SidebarPhoneCard />
                  <SidebarLeadForm />
                </div>
              </aside>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div
                className="prose prose-article max-w-none text-right"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

