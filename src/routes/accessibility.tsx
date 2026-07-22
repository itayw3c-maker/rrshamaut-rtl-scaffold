import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "הצהרת נגישות | רפאל שמאות רכוש" },
      {
        name: "description",
        content:
          "הצהרת הנגישות של אתר רפאל שמאות רכוש — עומד בת\"י 5568 (WCAG 2.1 AA). פרטי רכז הנגישות ואמצעי הפנייה בכל בעיית נגישות.",
      },
      { property: "og:title", content: "הצהרת נגישות | רפאל שמאות רכוש" },
      {
        property: "og:description",
        content:
          "אתר רפאל שמאות רכוש הונגש לפי תקנות שוויון זכויות לאנשים עם מוגבלות ות\"י 5568.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <SiteChrome>
      <div dir="rtl">
        <PageHero title="הצהרת נגישות" />

        <article className="prose-article mx-auto max-w-3xl px-4 py-12 text-right sm:px-6 lg:px-8">
          <p>
            ברפאל שמאות רכוש אנו רואים חשיבות רבה במתן שירות שוויוני לכלל
            הלקוחות ופועלים להנגשת אתר האינטרנט שלנו לאנשים עם מוגבלות, כדי
            שכל אדם יוכל לגלוש בו בקלות, בעצמאות ובכבוד.
          </p>

          <h2>רמת הנגישות באתר</h2>
          <p>
            אתר זה הונגש בהתאם ל<strong>תקנות שוויון זכויות לאנשים עם מוגבלות
            (התאמות נגישות לשירות), התשע"ג-2013</strong>, ועומד בדרישות התקן
            הישראלי <strong>ת"י 5568</strong> ברמת <strong>AA</strong>,
            המבוסס על הנחיות <strong>WCAG 2.0 ו-WCAG 2.1</strong>.
          </p>

          <h2>אמצעי ההנגשה שבוצעו באתר</h2>
          <ul>
            <li>מבנה סמנטי מלא (HTML5) התומך בקוראי מסך.</li>
            <li>ניווט מלא באמצעות מקלדת בלבד, כולל אינדיקציית פוקוס נראית.</li>
            <li>קישור "דלג לתוכן הראשי" בראש כל עמוד.</li>
            <li>ניגודיות צבעים תקנית וטקסטים הניתנים להגדלה עד 200% ללא איבוד תוכן.</li>
            <li>טקסט חלופי (alt) לתמונות תוכן.</li>
            <li>
              תפריט נגישות מובנה בקוד, המאפשר 14 התאמות אישיות — הגדלת טקסט,
              שינוי ניגודיות, גופן קריא, סימון קישורים וכותרות, עצירת אנימציות,
              מדריך קריאה, סמן גדול, מסכת קריאה ועוד.
            </li>
            <li>קיצור מקלדת לפתיחת תפריט הנגישות: <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>.</li>
            <li>שמירת העדפות הנגישות של המשתמש בין דפים ובביקורים חוזרים.</li>
            <li>תאימות לדפדפנים הנפוצים (Chrome, Firefox, Safari, Edge) ולמכשירים ניידים.</li>
          </ul>

          <h2>הסתייגויות</h2>
          <p>
            למרות מאמצינו להנגיש את כל דפי האתר, ייתכן שיתגלו חלקים או תכנים
            שטרם הונגשו במלואם, בעיקר: תכנים מוטמעים מצד שלישי (סרטוני יוטיוב,
            מפות גוגל וכד'), קבצי PDF ישנים או תמונות שהוטמעו בעבר. אנו פועלים
            באופן שוטף לשיפור והרחבת הנגישות בכל הדפים.
          </p>

          <h2 id="coordinator">פרטי רכז הנגישות</h2>
          <p>
            נתקלתם בקושי בגלישה, בבעיית נגישות או שיש לכם הצעה לשיפור? נשמח
            לשמוע ולטפל בפנייתכם בהקדם.
          </p>
          <ul>
            <li><strong>שם:</strong> רפאל ריבוח</li>
            <li>
              <strong>טלפון:</strong>{" "}
              <a href="tel:0502629210" dir="ltr">050-262-9210</a>
            </li>
            <li>
              <strong>דוא"ל:</strong>{" "}
              <a href="mailto:Info@rrshamaut.co.il" dir="ltr">Info@rrshamaut.co.il</a>
            </li>
          </ul>
          <p>נעשה כל מאמץ לחזור אליכם בהקדם האפשרי ולסייע במתן מענה מלא.</p>

          <h2>עדכון אחרון</h2>
          <p>
            הצהרת נגישות זו עודכנה בתאריך{" "}
            {new Date().toLocaleDateString("he-IL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        </article>
      </div>
    </SiteChrome>
  );
}
