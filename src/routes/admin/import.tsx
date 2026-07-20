import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/import")({
  component: AdminImport,
});

function AdminImport() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">ייבוא תוכן</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        כלי הייבוא ייבנו בשלב הבא.
      </p>
    </div>
  );
}
