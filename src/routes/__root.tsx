import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteChrome } from "../components/SiteChrome";
import { SITE_URL, siteConfig } from "../lib/site-config";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.brandName,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  image: `${SITE_URL}/og-image.png`,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  areaServed: "IL",
  address: siteConfig.branches.map((b) => ({
    "@type": "PostalAddress",
    name: b.name,
    streetAddress: b.addr,
    addressCountry: "IL",
  })),
};

function NotFoundComponent() {
  return (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center" dir="rtl">
        <p className="text-7xl font-extrabold text-[hsl(var(--primary))]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">הדף לא נמצא</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          הדף שחיפשת אינו קיים או הוסר.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-md bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            חזרה לעמוד הבית
          </Link>
          <a
            href="/צור-קשר"
            className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-[hsl(var(--muted))]"
          >
            צור קשר
          </a>
        </div>
      </div>
    </SiteChrome>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          אירעה שגיאה בטעינת הדף
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          משהו השתבש. ניתן לרענן את הדף או לחזור לעמוד הבית.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            נסה שוב
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            לעמוד הבית
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#056FC4" },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { title: "רפאל שמאות רכוש | RR" },
      {
        name: "description",
        content:
          "רפאל שמאות רכוש - שמאות ביטוח, הערכת נזקי רכוש וייצוג מבוטחים מול חברות הביטוח.",
      },
      { name: "author", content: "רפאל שמאות רכוש" },
      { property: "og:title", content: "רפאל שמאות רכוש | RR" },
      {
        property: "og:description",
        content:
          "רפאל שמאות רכוש - שמאות ביטוח, הערכת נזקי רכוש וייצוג מבוטחים מול חברות הביטוח.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:site_name", content: siteConfig.brandName },
      { property: "og:locale", content: "he_IL" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap&subset=hebrew,latin",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORG_JSON_LD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
