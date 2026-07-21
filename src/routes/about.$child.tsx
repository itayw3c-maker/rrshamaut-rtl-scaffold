import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { BioPageContent } from "@/components/BioPageContent";
import { resolveSlugFn } from "@/lib/content.functions";
import { SITE_URL, canonicalUrl } from "@/lib/site-config";

const ALLOWED_BIO_SLUGS = new Set([
  "השמאי-רפאל-ריבוח-מייסד-ובעלים",
  "השמאי-רפאל-ריבוח-מייסד-ובעלים-2",
  "המהנדס-והשמאי-ארז-אריה-מומחה-הנדסי-ו",
]);

export const Route = createFileRoute("/about/$child")({
  loader: async ({ params }) => {
    const raw = params.child;
    if (!raw || !ALLOWED_BIO_SLUGS.has(raw)) throw notFound();
    const result = await resolveSlugFn({ data: { slug: raw } });
    if (!result || result.kind !== "page") throw notFound();
    return result;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "לא נמצא" }, { name: "robots", content: "noindex" }] };
    }
    const canonical = canonicalUrl(`/about/${params.child}`);
    const title = loaderData.meta_title || loaderData.title;
    const desc = loaderData.meta_description || undefined;
    const meta: Array<Record<string, string>> = [
      { title },
      { property: "og:title", content: title },
      { property: "og:type", content: "website" },
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
    return { meta, links: [{ rel: "canonical", href: canonical }] };
  },
  errorComponent: ({ error }) => (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold text-foreground">אירעה שגיאה</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteChrome>
  ),
  notFoundComponent: () => (
    <SiteChrome>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center" dir="rtl">
        <p className="text-6xl font-extrabold text-[hsl(var(--primary))]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">הדף לא נמצא</h1>
      </div>
    </SiteChrome>
  ),
  component: AboutChildPage,
});

function AboutChildPage() {
  const data = Route.useLoaderData();
  return (
    <SiteChrome>
      <BioPageContent page={data as any} />
    </SiteChrome>
  );
}

// Keep SITE_URL import used to avoid tree-shake in some builds
void SITE_URL;
