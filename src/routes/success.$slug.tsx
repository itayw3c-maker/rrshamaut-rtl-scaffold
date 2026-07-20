import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { CptItemView } from "@/components/CptItemView";
import { getCptItemFn } from "@/lib/content.functions";
import { SITE_URL, siteConfig, canonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/success/$slug")({
  loader: async ({ params }) => {
    const res = await getCptItemFn({ data: { type: "success", slug: params.slug } });
    if (!res) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "לא נמצא" }, { name: "robots", content: "noindex" }] };
    const canonical = canonicalUrl(`/success/${params.slug}`);
    const title = loaderData.meta_title || loaderData.title;
    const desc = loaderData.meta_description || loaderData.excerpt || undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { property: "og:title", content: title },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical },
    ];
    if (desc) {
      meta.push({ name: "description", content: desc });
      meta.push({ property: "og:description", content: desc });
    }
    if (loaderData.cover_url) meta.push({ property: "og:image", content: loaderData.cover_url });
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: loaderData.title,
      datePublished: loaderData.published_at ?? undefined,
      dateModified: loaderData.published_at ?? undefined,
      image: loaderData.cover_url ? [loaderData.cover_url] : undefined,
      mainEntityOfPage: canonical,
      publisher: {
        "@type": "Organization",
        name: siteConfig.brandName,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
      },
    };
    return {
      meta,
      links: [{ rel: "canonical", href: canonical }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(article) }],
    };
  },
  errorComponent: ({ error }) => (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold">אירעה שגיאה</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteChrome>
  ),
  notFoundComponent: () => (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center" dir="rtl">
        <p className="text-6xl font-extrabold text-[hsl(var(--primary))]">404</p>
        <h1 className="mt-4 text-2xl font-bold">ההצלחה לא נמצאה</h1>
        <a href="/ההצלחות-שלנו" className="mt-6 inline-block rounded-md bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white">
          לכל ההצלחות
        </a>
      </div>
    </SiteChrome>
  ),
  component: () => {
    const item = Route.useLoaderData();
    return (
      <SiteChrome>
        <CptItemView item={item} />
      </SiteChrome>
    );
  },
});
