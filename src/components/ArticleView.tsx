import { LeadForm as _lf } from "@/components/LeadForm";
import { PageHero } from "@/components/PageHero";
import { SidebarPhoneCard, SidebarLeadForm } from "@/components/SidebarCards";
import { linkSlug } from "@/lib/slug";
import { appHref } from "@/lib/href";
import type { ResolvedPost } from "@/lib/content.functions";
void _lf; // keep import removable-warning quiet

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function ArticleView({ post }: { post: ResolvedPost }) {
  const title = decodeEntities(post.title);
  const cat = post.primary_category;
  const crumbs = cat
    ? [{ label: cat.name, to: `/category/${linkSlug(cat.slug)}` }]
    : undefined;

  return (
    <article dir="rtl">
      <PageHero title={title} crumbs={crumbs} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {post.cover_url && (
              <img
                src={post.cover_url}
                alt=""
                className="mb-6 w-full rounded-xl border border-border object-cover"
              />
            )}
            <div
              className="prose prose-article max-w-none text-right"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <SidebarPhoneCard />
              <SidebarLeadForm />
              {post.related.length > 0 && (
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-lg font-bold text-[hsl(var(--primary))]">
                    מאמרים נוספים
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {post.related.map((r) => (
                      <li key={r.slug}>
                        <a
                          href={appHref(`/${linkSlug(r.slug)}`)}
                          className="group flex items-start gap-3"
                        >
                          {r.cover_url ? (
                            <img
                              src={r.cover_url}
                              alt=""
                              loading="lazy"
                              className="h-14 w-14 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-14 w-14 shrink-0 rounded bg-[hsl(var(--muted))]" />
                          )}
                          <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--primary))] line-clamp-3">
                            {decodeEntities(r.title)}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
