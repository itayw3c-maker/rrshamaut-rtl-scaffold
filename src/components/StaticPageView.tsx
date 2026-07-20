import type { ResolvedPage } from "@/lib/content.functions";
import { ArchiveGrid } from "@/components/ArchiveGrid";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function StaticPageView({ page }: { page: ResolvedPage }) {
  return (
    <article dir="rtl">
      <header className="border-b border-border bg-[hsl(var(--muted))]">
        <div className="mx-auto max-w-3xl px-4 py-10 text-right sm:px-6 sm:py-14 lg:px-8">
          <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {decodeEntities(page.title)}
          </h1>
        </div>
      </header>
      {page.content && (
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div
            className="prose prose-article max-w-none text-right"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      )}
      {page.archive && (
        <ArchiveGrid items={page.archive.items} type={page.archive.type} />
      )}
    </article>
  );
}
