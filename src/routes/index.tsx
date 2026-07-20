import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main
      dir="rtl"
      lang="he"
      className="flex min-h-screen items-center justify-center bg-background px-6"
    >
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          RR · rrshamaut.co.il
        </p>
        <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
          רפאל שמאות רכוש
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          האתר בהקמה. בקרוב כאן — שמאות ביטוח, הערכת נזקי רכוש וייצוג מבוטחים
          מול חברות הביטוח.
        </p>
      </div>
    </main>
  );
}
