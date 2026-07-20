import { Link } from "@tanstack/react-router";
import { LeadForm } from "@/components/LeadForm";
import { linkSlug } from "@/lib/slug";
import type { ResolvedPost } from "@/lib/content.functions";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 220));
}

export function ArticleView({ post }: { post: ResolvedPost }) {
  const title = decodeEntities(post.title);
  const cover = post.cover_url;
  const rt = readingTime(post.content);
  const cat = post.primary_category;

  return (
    <article dir="rtl">
      {/* Hero band */}
      <header className="relative overflow-hidden border-b border-border bg-[hsl(var(--muted))]">
        {cover && (
          <div className="absolute inset-0">
            <img src={cover} alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/90" />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-10 text-right sm:px-6 sm:py-14 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-[hsl(var(--primary))]">בית</Link>
            {cat && (
              <>
                <span className="mx-2">/</span>
                <a
                  href={`/category/${linkSlug(cat.slug)}`}
                  className="hover:text-[hsl(var(--primary))]"
                >
                  {cat.name}
                </a>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-foreground">{title}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {post.author_name && <>מאת {post.author_name} · </>}
            {rt} דקות קריאה
            {cat && <> · {cat.name}</>}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div
              className="prose prose-article max-w-none text-right"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
          <aside className="lg:col-span-4">
            <div className="space-y-8 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-[hsl(var(--primary))]">מאמרים נוספים</h2>
                <ul className="mt-4 space-y-3">
                  {post.related.map((r) => (
                    <li key={r.slug}>
                      <a
                        href={`/${linkSlug(r.slug)}`}
                        className="flex items-start gap-3 group"
                      >
                        {r.cover_url ? (
                          <img
                            src={r.cover_url}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded object-cover"
                            loading="lazy"
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

              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-[hsl(var(--primary))]">צריכים ייעוץ?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  השאירו פרטים ונחזור אליכם
                </p>
                <div className="mt-4">
                  <LeadForm variant="sidebar" submitLabel="חיזרו אלי!" />
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
