import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { CategoryView } from "@/components/CategoryView";
import { getCategoryFn } from "@/lib/content.functions";
import { SITE_URL, canonicalUrl } from "@/lib/site-config";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const res = await getCategoryFn({ data: { slug: params.slug } });
    if (!res) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "לא נמצא" }, { name: "robots", content: "noindex" }] };
    }
    const canonical = canonicalUrl(`/category/${params.slug}`);
    const title = loaderData.meta_title || `${loaderData.name} - רפאל שמאות רכוש`;
    const desc =
      loaderData.meta_description ||
      (loaderData.description ? loaderData.description.replace(/<[^>]+>/g, "").slice(0, 160) : "") ||
      `כל המאמרים בקטגוריה ${loaderData.name}`;
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "בית", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: loaderData.name, item: canonical },
      ],
    };
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumb) }],
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
        <h1 className="mt-4 text-2xl font-bold">הקטגוריה לא נמצאה</h1>
        <a href="/" className="mt-6 inline-block rounded-md bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white">
          חזרה לעמוד הבית
        </a>
      </div>
    </SiteChrome>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const data = Route.useLoaderData();
  return (
    <SiteChrome>
      <CategoryView category={data} />
    </SiteChrome>
  );
}
