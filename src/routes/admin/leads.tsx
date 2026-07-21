import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listLeadsFn, toggleLeadHandledFn } from "@/lib/admin-ops.functions";

export const Route = createFileRoute("/admin/leads")({
  ssr: false,
  component: LeadsPage,
});

type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  source_url: string | null;
  source_variant: string | null;
  created_at: string;
  webhook_ok: boolean | null;
  handled: boolean;
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function toCsv(rows: Lead[]): string {
  const header = ["תאריך", "שם", "טלפון", "אימייל", "סוג נזק/הודעה", "עמוד מקור", "וריאנט", "טופל"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        formatDate(r.created_at),
        r.name ?? "",
        r.phone ?? "",
        r.email ?? "",
        r.message ?? "",
        r.source_url ?? "",
        r.source_variant ?? "",
        r.handled ? "כן" : "לא",
      ]
        .map(esc)
        .join(","),
    );
  }
  return "\uFEFF" + lines.join("\n");
}

function LeadsPage() {
  const { isAdmin } = Route.useRouteContext() as any;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function reload() {
    setLoading(true);
    try {
      const data = await listLeadsFn();
      setLeads(data as Lead[]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (isAdmin) reload();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter === "open" && l.handled) return false;
      if (filter === "done" && !l.handled) return false;
      if (!qq) return true;
      return (
        (l.name ?? "").toLowerCase().includes(qq) ||
        (l.phone ?? "").toLowerCase().includes(qq) ||
        (l.email ?? "").toLowerCase().includes(qq)
      );
    });
  }, [leads, q, filter]);

  async function toggle(id: string, handled: boolean) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, handled } : l)));
    try {
      await toggleLeadHandledFn({ data: { id, handled } });
    } catch {
      reload();
    }
  }

  function downloadCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAdmin) {
    return <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">אין הרשאה</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">פניות</h1>
        <button
          onClick={downloadCsv}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          ייצוא CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש שם / טלפון / אימייל"
          className="flex-1 min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">הכל</option>
          <option value="open">לא טופלו</option>
          <option value="done">טופלו</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs">
            <tr>
              <th className="p-2 text-right">תאריך</th>
              <th className="p-2 text-right">שם</th>
              <th className="p-2 text-right">טלפון</th>
              <th className="p-2 text-right">אימייל</th>
              <th className="p-2 text-right">הודעה</th>
              <th className="p-2 text-right">מקור</th>
              <th className="p-2 text-right">וריאנט</th>
              <th className="p-2 text-right">Webhook</th>
              <th className="p-2 text-right">טופל</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">טוען...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">אין פניות</td></tr>
            )}
            {filtered.map((l) => {
              const msg = l.message ?? "";
              const isLong = msg.length > 80;
              const show = expanded[l.id] || !isLong ? msg : msg.slice(0, 80) + "…";
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className="p-2 whitespace-nowrap">{formatDate(l.created_at)}</td>
                  <td className="p-2">{l.name}</td>
                  <td className="p-2">
                    {l.phone && (
                      <a href={`tel:${l.phone}`} className="text-primary hover:underline">{l.phone}</a>
                    )}
                  </td>
                  <td className="p-2">{l.email}</td>
                  <td className="p-2 max-w-[260px]">
                    <div className="whitespace-pre-wrap break-words">{show}</div>
                    {isLong && (
                      <button
                        onClick={() => setExpanded((p) => ({ ...p, [l.id]: !p[l.id] }))}
                        className="mt-1 text-xs text-primary hover:underline"
                      >
                        {expanded[l.id] ? "הסתר" : "הצג הכל"}
                      </button>
                    )}
                  </td>
                  <td className="p-2">
                    {l.source_variant && (
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs">{l.source_variant}</span>
                    )}
                  </td>
                  <td className="p-2 max-w-[160px] truncate" title={l.source_url ?? ""}>
                    {l.source_url}
                  </td>
                  <td className="p-2">
                    {l.webhook_ok == null ? "—" : l.webhook_ok ? "✅" : "❌"}
                  </td>
                  <td className="p-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={l.handled}
                        onChange={(e) => toggle(l.id, e.target.checked)}
                      />
                      <span className="text-xs">{l.handled ? "טופל" : "פתוח"}</span>
                    </label>
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
