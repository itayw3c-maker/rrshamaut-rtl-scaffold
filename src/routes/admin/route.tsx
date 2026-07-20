import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    const { isAdmin } = await checkIsAdmin();
    return { isAdmin };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  if (!isAdmin) {
    return (
      <main
        dir="rtl"
        lang="he"
        className="flex min-h-screen items-center justify-center bg-background px-6"
      >
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">אין לך הרשאות גישה</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            החשבון שלך אינו משויך לתפקיד ניהולי. פנה למנהל המערכת.
          </p>
          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            התנתקות
          </button>
        </div>
      </main>
    );
  }

  return (
    <div dir="rtl" lang="he" className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link to="/admin" className="text-lg font-bold text-foreground">
              רפאל שמאות רכוש · ניהול
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/admin"
              activeOptions={{ exact: true }}
              className="text-muted-foreground hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground"
            >
              לוח בקרה
            </Link>
            <Link
              to="/admin/import"
              className="text-muted-foreground hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground"
            >
              ייבוא
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
            >
              התנתקות
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
