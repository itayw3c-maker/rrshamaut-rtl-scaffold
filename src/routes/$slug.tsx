import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ArticleView } from "@/components/ArticleView";
import { StaticPageView } from "@/components/StaticPageView";
import { ServicePageContent } from "@/components/ServicePageContent";
import { CertificatesContent } from "@/components/CertificatesContent";
import { BioPageContent } from "@/components/BioPageContent";

const BIO_SLUGS = new Set([
  "השמאי-רפאל-ריבוח-מייסד-ובעלים",
  "השמאי-רפאל-ריבוח-מייסד-ובעלים-2",
  "המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו",
]);
import { resolveSlugFn } from "@/lib/content.functions";
import { SITE_URL, siteConfig, canonicalUrl } from "@/lib/site-config";

const RESERVED = new Set([
  "admin", "login", "thank-you", "api",
  "favicon.ico", "og-image.png", "favicon.png", "favicon-done.svg", "notify.mp3",
  "robots.txt", "sitemap.xml",
]);

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const raw = params.slug;
    if (!raw || RESERVED.has(raw.toLowerCase())) throw notFound();
    const result = await resolveSlugFn({ data: { slug: raw } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "לא נמצא" }, { name: "robots", content: "noindex" }] };
    }
    const canonical = canonicalUrl(`/${params.slug}`);
    const title = loaderData.meta_title || loaderData.title;
    const desc =
      loaderData.meta_description ||
      (loaderData.kind === "post" ? loaderData.excerpt : null) ||
      undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { property: "og:title", content: title },
      { property: "og:type", content: loaderData.kind === "post" ? "article" : "website" },
      { property: "og:url", content: canonical },
    ];
    if (desc) {
      meta.push({ name: "description", content: desc });
      meta.push({ property: "og:description", content: desc });
    }
    if (loaderData.cover_url) {
      meta.push({ property: "og:image", content: loaderData.cover_url });
      meta.push({ name: "twitter:image", content: loaderData.cover_url });
    }

    const scripts: Array<{ type: string; children: string }> = [];
    if (loaderData.kind === "post") {
      const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: loaderData.title,
        datePublished: loaderData.published_at ?? undefined,
        dateModified: loaderData.published_at ?? undefined,
        author: { "@type": "Person", name: loaderData.author_name || siteConfig.brandName },
        image: loaderData.cover_url ? [loaderData.cover_url] : undefined,
        mainEntityOfPage: canonical,
        publisher: {
          "@type": "Organization",
          name: siteConfig.brandName,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
        },
      };
      const crumbs: Array<{ name: string; item: string }> = [{ name: "בית", item: `${SITE_URL}/` }];
      if (loaderData.primary_category) {
        crumbs.push({
          name: loaderData.primary_category.name,
          item: canonicalUrl(`/category/${loaderData.primary_category.slug}`),
        });
      }
      crumbs.push({ name: loaderData.title, item: canonical });
      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.item,
        })),
      };
      scripts.push({ type: "application/ld+json", children: JSON.stringify(article) });
      scripts.push({ type: "application/ld+json", children: JSON.stringify(breadcrumb) });
    }

    return {
      meta,
      links: [{ rel: "canonical", href: canonical }],
      scripts,
    };
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
  const renderPage = () => {
    if (data.slug === "damage-assessments-loss-adjusting")
      return <ServicePageContent page={data as any} />;
    if (data.slug === "תעודות")
      return <CertificatesContent page={data as any} />;
    if (BIO_SLUGS.has(data.slug))
      return <BioPageContent page={data as any} />;
    return <StaticPageView page={data} />;
  };
  return (
    <SiteChrome>
      {data.kind === "page" ? renderPage() : <ArticleView post={data} />}
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
