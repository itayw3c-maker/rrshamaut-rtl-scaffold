import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { inviteUserFn, listUsersFn, setUserRoleFn } from "@/lib/admin-ops.functions";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  component: UsersPage,
});

type UserRow = { id: string; email: string; created_at: string; role: string | null };

function UsersPage() {
  const { isAdmin } = Route.useRouteContext() as any;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor">("editor");
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string } | null>(null);

  async function reload() {
    setLoading(true);
    try { setUsers((await listUsersFn()) as UserRow[]); } finally { setLoading(false); }
  }
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  async function setRole(user_id: string, role: "admin" | "editor") {
    setBusy(user_id); setErr(null);
    try {
      await setUserRoleFn({ data: { user_id, role } });
      await reload();
    } catch (e: any) { setErr(e?.message ?? "שגיאה"); }
    finally { setBusy(null); }
  }

  async function invite() {
    if (!inviteEmail.trim()) return;
    setBusy("__invite"); setErr(null); setInviteResult(null);
    try {
      const r = await inviteUserFn({ data: { email: inviteEmail.trim(), role: inviteRole } });
      setInviteResult(r);
      setInviteEmail("");
      await reload();
    } catch (e: any) { setErr(e?.message ?? "שגיאה"); }
    finally { setBusy(null); }
  }

  if (!isAdmin) return <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">אין הרשאה</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">משתמשים</h1>

      <div className="rounded-md border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">הזמנת משתמש חדש</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="editor">עורך</option>
            <option value="admin">מנהל</option>
          </select>
          <button onClick={invite} disabled={busy === "__invite"} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {busy === "__invite" ? "יוצר..." : "הזמן משתמש"}
          </button>
        </div>
        {inviteResult && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
            נוצר משתמש <b>{inviteResult.email}</b>. סיסמה זמנית (מוצגת פעם אחת בלבד):
            <div className="mt-1 rounded bg-white p-2 font-mono text-sm" dir="ltr">{inviteResult.tempPassword}</div>
          </div>
        )}
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs">
            <tr>
              <th className="p-2 text-right">אימייל</th>
              <th className="p-2 text-right">תפקיד</th>
              <th className="p-2 text-right">נוצר</th>
              <th className="p-2 text-right">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">טוען...</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">אין משתמשים</td></tr>}
            {users.map((u) => {
              const cls =
                u.role === "admin" ? "bg-primary/10 text-primary" :
                u.role === "editor" ? "bg-muted text-foreground" :
                "bg-muted/50 text-muted-foreground";
              const label = u.role === "admin" ? "מנהל" : u.role === "editor" ? "עורך" : "ללא";
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span></td>
                  <td className="p-2 whitespace-nowrap text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("he-IL")}</td>
                  <td className="p-2 space-x-2 space-x-reverse text-left">
                    {u.role !== "admin" && (
                      <button disabled={busy === u.id} onClick={() => setRole(u.id, "admin")} className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50">קדם למנהל</button>
                    )}
                    {u.role !== "editor" && (
                      <button disabled={busy === u.id} onClick={() => setRole(u.id, "editor")} className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50">הפוך לעורך</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
