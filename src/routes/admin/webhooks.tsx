import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getWebhookConfigFn, saveWebhookConfigFn, testWebhookFn } from "@/lib/admin-ops.functions";

export const Route = createFileRoute("/admin/webhooks")({
  ssr: false,
  component: WebhooksPage,
});

const SAMPLE_PAYLOAD = {
  name: "בדיקה",
  email: "test@test.com",
  phone: "0500000000",
  message: "הודעת בדיקה",
  source_url: "/admin/webhooks",
  timestamp: "2026-07-21T00:00:00.000Z",
};

function WebhooksPage() {
  const { isAdmin } = Route.useRouteContext() as any;
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; ok: boolean; body: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const cfg = await getWebhookConfigFn();
        setUrl(cfg?.webhook_url ?? "");
        setEnabled(Boolean(cfg?.enabled));
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await saveWebhookConfigFn({ data: { webhook_url: url || null, enabled } });
      setMsg("נשמר בהצלחה");
    } catch (e: any) {
      setMsg(e?.message ?? "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await testWebhookFn();
      setTestResult(r);
    } catch (e: any) {
      setTestResult({ status: 0, ok: false, body: e?.message ?? "error" });
    } finally {
      setTesting(false);
    }
  }

  if (!isAdmin) return <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">אין הרשאה</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>

      <div className="rounded-md border border-border bg-card p-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">כתובת Webhook</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          />
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} disabled={loading} />
          <span className="text-sm">מופעל</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={save}
            disabled={saving || loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמירה"}
          </button>
          <button
            onClick={runTest}
            disabled={testing || loading || !url}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-50"
          >
            {testing ? "שולח..." : "שלח בדיקה"}
          </button>
          {msg && <span className="self-center text-sm text-muted-foreground">{msg}</span>}
        </div>
      </div>

      {testResult && (
        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-2 text-sm font-medium">
            תוצאה: <span className={testResult.ok ? "text-green-600" : "text-red-600"}>HTTP {testResult.status}</span>
          </div>
          <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs" dir="ltr">{testResult.body}</pre>
        </div>
      )}

      <div className="rounded-md border border-border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">מבנה ה-Payload</h2>
        <p className="mb-3 text-sm text-muted-foreground">כל פנייה מהאתר תשלח לכתובת שלמעלה במבנה JSON הבא:</p>
        <pre className="overflow-auto rounded bg-muted p-3 text-xs" dir="ltr">
{JSON.stringify(SAMPLE_PAYLOAD, null, 2)}
        </pre>
      </div>
    </div>
  );
}
