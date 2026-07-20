import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArticleView } from "@/components/ArticleView";
import { StaticPageView } from "@/components/StaticPageView";
import { resolveSlugFn } from "@/lib/content.functions";

const RESERVED = new Set([
  "admin", "login", "thank-you", "sitemap.xml", "sitemap-page",
  "about", "terms", "privacy", "accessibility",
  "category", "movie", "shorts", "success", "blog", "api",
  "favicon.ico", "og-image.png", "favicon.png", "favicon-done.svg", "notify.mp3",
  "robots.txt",
]);

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const raw = params.slug;
    if (!raw || RESERVED.has(raw.toLowerCase())) throw notFound();
    const result = await resolveSlugFn({ data: { slug: raw } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "לא נמצא" }, { name: "robots", content: "noindex" }] };
    }
    const title = loaderData.meta_title || loaderData.title;
    const desc =
      loaderData.meta_description ||
      (loaderData.kind === "post" ? loaderData.excerpt : null) ||
      undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { property: "og:title", content: title },
      { property: "og:type", content: loaderData.kind === "post" ? "article" : "website" },
    ];
    if (desc) {
      meta.push({ name: "description", content: desc });
      meta.push({ property: "og:description", content: desc });
    }
    if (loaderData.cover_url) {
      meta.push({ property: "og:image", content: loaderData.cover_url });
      meta.push({ name: "twitter:image", content: loaderData.cover_url });
    }
    return { meta };
  },
  errorComponent: ({ error }) => (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-foreground">אירעה שגיאה</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteChrome>
  ),
  notFoundComponent: () => <NotFoundBody />,
  component: SlugPage,
});

function SlugPage() {
  const data = Route.useLoaderData();
  return (
    <SiteChrome>
      {data.kind === "page" ? <StaticPageView page={data} /> : <ArticleView post={data} />}
    </SiteChrome>
  );
}

function NotFoundBody() {
  return (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center" dir="rtl">
        <p className="text-6xl font-extrabold text-[hsl(var(--primary))]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">הדף לא נמצא</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          ייתכן שהדף הוסר או שהקישור שגוי.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="/"
            className="rounded-md bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            חזרה לעמוד הבית
          </a>
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
