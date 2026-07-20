import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Home } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: `תודה שפניתם | ${siteConfig.brandName}` },
      { name: "description", content: "תודה על פנייתכם. נחזור אליכם בהקדם האפשרי." },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const telHref = `tel:${siteConfig.phone.replace(/[^0-9+]/g, "")}`;
  return (
    <SiteChrome>
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: siteConfig.colors.primary }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-10 w-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5 9-11" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">תודה שפניתם אלינו!</h1>
        <p className="mt-4 text-lg text-muted-foreground">נחזור אליכם בהקדם.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          במקרה דחוף ניתן לחייג ישירות למשרד ונשמח לסייע.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={telHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: siteConfig.colors.gold }}
          >
            <Phone className="h-5 w-5" />
            {siteConfig.phone}
          </a>
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cfced0] bg-white px-6 py-3 text-base font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Home className="h-5 w-5" />
            חזרה לעמוד הבית
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
