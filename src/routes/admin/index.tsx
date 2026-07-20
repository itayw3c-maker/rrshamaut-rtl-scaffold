import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const sections = [
  { title: "פוסטים", description: "ניהול מאמרים ותכנים", to: "/admin" as const, disabled: true },
  { title: "עמודים", description: "עמודים סטטיים", to: "/admin" as const, disabled: true },
  { title: "ייבוא", description: "ייבוא תוכן מוורדפרס", to: "/admin/import" as const, disabled: false },
  { title: "פניות (Leads)", description: "טופסי יצירת קשר", to: "/admin" as const, disabled: true },
  { title: "משתמשים", description: "ניהול משתמשים ותפקידים", to: "/admin" as const, disabled: true },
];

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">לוח בקרה</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ברוך הבא. בחר סעיף כדי להתחיל.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <div
            key={s.title}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            {s.disabled ? (
              <span className="mt-3 inline-block text-xs text-muted-foreground">
                בקרוב
              </span>
            ) : (
              <Link
                to={s.to}
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                פתיחה ←
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
