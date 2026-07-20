import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          RR · rrshamaut.co.il
        </p>
        <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
          רפאל שמאות רכוש
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          האתר בהקמה. בקרוב כאן - שמאות ביטוח, הערכת נזקי רכוש וייצוג מבוטחים מול חברות הביטוח.
        </p>
      </section>
    </SiteChrome>
  );
}
