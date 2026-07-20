import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  importCategoriesAllFn,
  importTagsAllFn,
  importMediaPageFn,
  importPostsPageFn,
  importCustomPostTypeFn,
  importPagesPageFn,
  importImagesForPostFn,
  listPostsNeedingBackfillFn,
  backfillCoverForPostFn,
  getImportStatsFn,
} from "@/lib/wp/wp-import.functions";

export const Route = createFileRoute("/admin/import")({
  component: AdminImport,
});

// ------------------- constants -------------------

type StepKind = "single" | "paged" | "slugs" | "backfill";
type StepDef = {
  id: number;
  name: string;
  kind: StepKind;
  run: (helpers: StepHelpers) => Promise<StepResult>;
};

type StepResult = {
  imported: number;
  errors: string[];
  detail?: string;
};

type StepHelpers = {
  onProgress: (pct: number, label?: string) => void;
  shouldStop: () => boolean;
};

const LS = {
  active: "rr_master_active",
  step: "rr_master_step",
  startedAt: "rr_master_started_at",
  counts: "rr_master_counts",
  stopFlag: "rr_master_stop",
  summary: "rr_master_summary",
  notifPerm: "rr_master_notif_perm",
  stepPage: (n: number) => `rr_step_${n}_page`,
};

const STEP_DEFS: StepDef[] = [
  {
    id: 1,
    name: "קטגוריות",
    kind: "single",
    run: async ({ onProgress }) => {
      const r = await importCategoriesAllFn();
      onProgress(1);
      return { imported: r.imported, errors: [] };
    },
  },
  {
    id: 2,
    name: "תגיות",
    kind: "single",
    run: async ({ onProgress }) => {
      const r = await importTagsAllFn();
      onProgress(1);
      return { imported: r.imported, errors: [] };
    },
  },
  {
    id: 3,
    name: "מדיה",
    kind: "paged",
    run: (h) => runPaged(3, h, (page) => importMediaPageFn({ data: { page, perPage: 10 } })),
  },
  {
    id: 4,
    name: "פוסטים (פורסמו)",
    kind: "paged",
    run: (h) => runPaged(4, h, (page) => importPostsPageFn({ data: { page, perPage: 10, status: "publish" } })),
  },
  {
    id: 5,
    name: "פוסטים (טיוטות)",
    kind: "paged",
    run: (h) => runPaged(5, h, (page) => importPostsPageFn({ data: { page, perPage: 10, status: "draft" } })),
  },
  {
    id: 6,
    name: "פוסטים (מתוזמנים)",
    kind: "paged",
    run: (h) => runPaged(6, h, (page) => importPostsPageFn({ data: { page, perPage: 10, status: "future" } })),
  },
  {
    id: 7,
    name: "הצלחות (success)",
    kind: "paged",
    run: (h) => runPaged(7, h, (page) => importCustomPostTypeFn({ data: { typeSlug: "success", page, perPage: 10, status: "publish" } })),
  },
  {
    id: 8,
    name: "סרטונים קצרים (shorts)",
    kind: "paged",
    run: (h) => runPaged(8, h, (page) => importCustomPostTypeFn({ data: { typeSlug: "shorts", page, perPage: 10, status: "publish" } })),
  },
  {
    id: 9,
    name: "סרטונים (movie)",
    kind: "paged",
    run: (h) => runPaged(9, h, (page) => importCustomPostTypeFn({ data: { typeSlug: "movie", page, perPage: 10, status: "publish" } })),
  },
  {
    id: 10,
    name: "עמודים",
    kind: "paged",
    run: (h) => runPaged(10, h, (page) => importPagesPageFn({ data: { page, perPage: 10, status: "publish" } })),
  },
  {
    id: 11,
    name: "ריהוסט תמונות תוכן",
    kind: "slugs",
    run: async ({ onProgress, shouldStop }) => {
      const errors: string[] = [];
      let done = 0;
      const { data: postSlugs } = await supabase.from("posts").select("slug");
      const { data: pageSlugs } = await supabase.from("pages").select("slug");
      const posts = (postSlugs ?? []).map((r) => r.slug as string).filter(Boolean);
      const pages = (pageSlugs ?? []).map((r) => r.slug as string).filter(Boolean);
      const total = posts.length + pages.length || 1;
      for (const slug of posts) {
        if (shouldStop()) break;
        try {
          await importImagesForPostFn({ data: { slug, table: "posts" } });
        } catch (e) {
          errors.push(`post:${slug}: ${errMsg(e)}`);
        }
        done++;
        onProgress(done / total, `פוסט ${done}/${total}`);
      }
      for (const slug of pages) {
        if (shouldStop()) break;
        try {
          await importImagesForPostFn({ data: { slug, table: "pages" } });
        } catch (e) {
          errors.push(`page:${slug}: ${errMsg(e)}`);
        }
        done++;
        onProgress(done / total, `${done}/${total}`);
      }
      return { imported: done, errors };
    },
  },
  {
    id: 12,
    name: "השלמת תמונות שער",
    kind: "backfill",
    run: async ({ onProgress, shouldStop }) => {
      const errors: string[] = [];
      const list = await listPostsNeedingBackfillFn();
      const slugs = list.slugs ?? [];
      const total = slugs.length || 1;
      let done = 0;
      let setCount = 0;
      for (const slug of slugs) {
        if (shouldStop()) break;
        try {
          const r = await backfillCoverForPostFn({ data: { slug } });
          if (r.action === "set") setCount++;
        } catch (e) {
          errors.push(`${slug}: ${errMsg(e)}`);
        }
        done++;
        onProgress(done / total, `${done}/${total}`);
      }
      return { imported: setCount, errors, detail: `נבדקו ${done}` };
    },
  },
];

async function runPaged(
  stepId: number,
  h: StepHelpers,
  call: (page: number) => Promise<{ page: number; imported: number; totalPages: number }>,
): Promise<StepResult> {
  const errors: string[] = [];
  let imported = 0;
  const startPage = Math.max(1, parseInt(localStorage.getItem(LS.stepPage(stepId)) || "1", 10));
  let page = startPage;
  let totalPages = startPage;
  while (true) {
    if (h.shouldStop()) break;
    try {
      const r = await call(page);
      imported += r.imported ?? 0;
      totalPages = r.totalPages || totalPages;
      h.onProgress(Math.min(1, page / Math.max(totalPages, 1)), `עמוד ${page}/${totalPages}`);
      if (page >= (r.totalPages || 0)) break;
    } catch (e) {
      errors.push(`page ${page}: ${errMsg(e)}`);
    }
    page++;
    localStorage.setItem(LS.stepPage(stepId), String(page));
  }
  localStorage.removeItem(LS.stepPage(stepId));
  return { imported, errors, detail: `עמודים: ${totalPages}` };
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

// ------------------- component -------------------

type Stats = {
  posts: number; pages: number; media: number;
  categories: number; tags: number; postsMissingCover: number;
} | null;

type StepLog = {
  id: number; name: string;
  status: "ok" | "warn" | "error";
  imported: number; errors: string[]; detail?: string;
};

type Summary = {
  startedAt: number; endedAt: number;
  logs: StepLog[];
  stats: Stats;
  fatal?: string;
};

function AdminImport() {
  const [stats, setStats] = useState<Stats>(null);
  const [running, setRunning] = useState<boolean>(() => localStorage.getItem(LS.active) === "1");
  const [currentStep, setCurrentStep] = useState<number>(() => parseInt(localStorage.getItem(LS.step) || "0", 10));
  const [stepPct, setStepPct] = useState(0);
  const [stepLabel, setStepLabel] = useState("");
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [summary, setSummary] = useState<Summary | null>(() => {
    try { const raw = localStorage.getItem(LS.summary); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [cardHidden, setCardHidden] = useState(false);
  const [manualBusy, setManualBusy] = useState<number | null>(null);
  const [manualPct, setManualPct] = useState(0);

  const stopRequestedRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const refreshStats = useCallback(async () => {
    try { setStats(await getImportStatsFn()); } catch { /* ignore */ }
  }, []);

  useEffect(() => { refreshStats(); }, [refreshStats]);

  // beforeunload guard while running
  useEffect(() => {
    if (!running) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [running]);

  // Auto-resume if a run was active
  useEffect(() => {
    if (running && localStorage.getItem(LS.active) === "1") {
      const fromStep = parseInt(localStorage.getItem(LS.step) || "1", 10) || 1;
      void executeMaster(fromStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function acquireWakeLock() {
    try {
      const anyNav = navigator as unknown as { wakeLock?: { request: (t: string) => Promise<WakeLockSentinel> } };
      if (anyNav.wakeLock?.request) {
        wakeLockRef.current = await anyNav.wakeLock.request("screen");
      }
    } catch { /* ignore */ }
  }
  async function releaseWakeLock() {
    try { await wakeLockRef.current?.release(); } catch { /* ignore */ }
    wakeLockRef.current = null;
  }

  async function ensureNotifPermission() {
    try {
      if (!("Notification" in window)) return;
      const stored = localStorage.getItem(LS.notifPerm);
      if (stored === "granted" || stored === "denied") return;
      const p = await Notification.requestPermission();
      localStorage.setItem(LS.notifPerm, p);
    } catch { /* ignore */ }
  }

  function fireCompletionNotifications(summ: Summary) {
    // 1. Browser notification
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        const total = summ.logs.reduce((s, l) => s + l.imported, 0);
        const errs = summ.logs.reduce((s, l) => s + l.errors.length, 0);
        const n = new Notification("✅ הייבוא הסתיים", {
          body: `סה"כ פריטים: ${total} · שגיאות: ${errs}`,
        });
        n.onclick = () => { window.focus(); n.close(); };
      }
    } catch { /* ignore */ }
    // 3. Audio chime
    try {
      const a = new Audio("/notify.mp3");
      a.play().catch(() => { /* graceful */ });
    } catch { /* ignore */ }
    // 4. Title prefix
    if (!document.title.startsWith("✅ הייבוא הסתיים — ")) {
      document.title = "✅ הייבוא הסתיים — " + document.title;
    }
    // 5. Favicon swap
    try {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = "/favicon-done.svg";
    } catch { /* ignore */ }
  }

  async function executeMaster(fromStep = 1) {
    setRunning(true);
    setCardHidden(false);
    setSummary(null);
    localStorage.removeItem(LS.summary);
    localStorage.setItem(LS.active, "1");
    if (!localStorage.getItem(LS.startedAt)) {
      localStorage.setItem(LS.startedAt, String(Date.now()));
    }
    stopRequestedRef.current = false;
    localStorage.removeItem(LS.stopFlag);
    await ensureNotifPermission();
    await acquireWakeLock();

    const startedAt = parseInt(localStorage.getItem(LS.startedAt) || String(Date.now()), 10);
    let priorLogs: StepLog[] = [];
    try {
      const raw = localStorage.getItem(LS.counts);
      if (raw) priorLogs = JSON.parse(raw);
    } catch { /* ignore */ }
    setLogs(priorLogs);

    let fatal: string | undefined;
    try {
      for (const def of STEP_DEFS) {
        if (def.id < fromStep) continue;
        if (localStorage.getItem(LS.stopFlag) === "1") { stopRequestedRef.current = true; break; }
        setCurrentStep(def.id);
        setStepPct(0);
        setStepLabel("");
        localStorage.setItem(LS.step, String(def.id));

        let result: StepResult;
        try {
          result = await def.run({
            onProgress: (pct, label) => { setStepPct(pct); if (label) setStepLabel(label); },
            shouldStop: () => stopRequestedRef.current || localStorage.getItem(LS.stopFlag) === "1",
          });
        } catch (e) {
          result = { imported: 0, errors: [errMsg(e)] };
        }

        const log: StepLog = {
          id: def.id,
          name: def.name,
          status: result.errors.length === 0 ? "ok" : "warn",
          imported: result.imported,
          errors: result.errors,
          detail: result.detail,
        };
        priorLogs = [...priorLogs, log];
        setLogs(priorLogs);
        localStorage.setItem(LS.counts, JSON.stringify(priorLogs));
        await refreshStats();
        if (localStorage.getItem(LS.stopFlag) === "1") break;
      }
    } catch (e) {
      fatal = errMsg(e);
    }

    const finalSummary: Summary = {
      startedAt,
      endedAt: Date.now(),
      logs: priorLogs,
      stats: await safeStats(),
      fatal,
    };
    localStorage.setItem(LS.summary, JSON.stringify(finalSummary));
    setSummary(finalSummary);

    // Reset master state
    localStorage.removeItem(LS.active);
    localStorage.removeItem(LS.step);
    localStorage.removeItem(LS.startedAt);
    localStorage.removeItem(LS.counts);
    localStorage.removeItem(LS.stopFlag);
    setRunning(false);
    setCurrentStep(0);
    await releaseWakeLock();
    fireCompletionNotifications(finalSummary);
  }

  async function safeStats(): Promise<Stats> {
    try { return await getImportStatsFn(); } catch { return null; }
  }

  function requestStop() {
    stopRequestedRef.current = true;
    localStorage.setItem(LS.stopFlag, "1");
  }

  async function runSingleStep(def: StepDef) {
    if (running || manualBusy !== null) return;
    setManualBusy(def.id);
    setManualPct(0);
    try {
      const r = await def.run({
        onProgress: (pct) => setManualPct(pct),
        shouldStop: () => false,
      });
      const log: StepLog = {
        id: def.id, name: def.name,
        status: r.errors.length === 0 ? "ok" : "warn",
        imported: r.imported, errors: r.errors, detail: r.detail,
      };
      setLogs((prev) => [...prev, log]);
    } catch (e) {
      setLogs((prev) => [...prev, {
        id: def.id, name: def.name, status: "error",
        imported: 0, errors: [errMsg(e)],
      }]);
    } finally {
      setManualBusy(null);
      setManualPct(0);
      await refreshStats();
    }
  }

  function dismissSummary() {
    localStorage.removeItem(LS.summary);
    setSummary(null);
    if (document.title.startsWith("✅ הייבוא הסתיים — ")) {
      document.title = document.title.replace("✅ הייבוא הסתיים — ", "");
    }
    try {
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link) link.href = "/favicon.ico";
    } catch { /* ignore */ }
  }

  const currentDef = useMemo(
    () => STEP_DEFS.find((s) => s.id === currentStep),
    [currentStep],
  );

  return (
    <div dir="rtl" lang="he" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ייבוא תוכן מוורדפרס</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ייבוא ראשי בלחיצה אחת. ניתן להריץ שלבים בודדים לצורך בדיקה או תיקון.
        </p>
      </div>

      {/* Live stats */}
      <StatsStrip stats={stats} onRefresh={refreshStats} />

      {/* Master button */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <button
          type="button"
          disabled={running || manualBusy !== null}
          onClick={() => executeMaster(1)}
          className="w-full rounded-md bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          🚀 הרץ את כל הייבוא ברצף
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          התהליך רץ 12 שלבים לפי הסדר. במקרה של רענון הדף — הייבוא ממשיך אוטומטית מהמקום בו עצר.
        </p>
      </div>

      {/* Master progress card */}
      {running && !cardHidden && currentDef && (
        <div className="rounded-lg border-2 border-primary bg-card p-5 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              שלב {currentStep} מתוך {STEP_DEFS.length}: {currentDef.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={requestStop}
                className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                עצור בסוף השלב הנוכחי
              </button>
              <button
                onClick={() => setCardHidden(true)}
                className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                הסתר
              </button>
            </div>
          </div>
          <ProgressBar pct={stepPct} />
          {stepLabel && <p className="mt-2 text-xs text-muted-foreground">{stepLabel}</p>}
          {logs.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {logs.slice(-5).map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-foreground">
                  <span>{l.status === "ok" ? "✅" : l.status === "warn" ? "⚠️" : "❌"}</span>
                  <span className="font-medium">{l.name}</span>
                  <span className="text-muted-foreground">— {l.imported} · שגיאות: {l.errors.length}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {running && cardHidden && (
        <button
          onClick={() => setCardHidden(false)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          הצג את חלון ההתקדמות
        </button>
      )}

      {/* Completion summary */}
      {summary && (
        <SummaryCard summary={summary} statsNow={stats} onDismiss={dismissSummary} />
      )}

      {/* Individual step buttons */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground">הרצה ידנית לפי שלב</h2>
        <p className="mt-1 text-xs text-muted-foreground">להרצה נקודתית של שלב בודד לצורך בדיקה או תיקון.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEP_DEFS.map((def) => {
            const busy = manualBusy === def.id;
            return (
              <div key={def.id} className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {def.id}. {def.name}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={running || (manualBusy !== null && !busy)}
                  onClick={() => runSingleStep(def)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "רץ..." : "הרץ שלב"}
                </button>
                {busy && (
                  <div className="mt-2">
                    <ProgressBar pct={manualPct} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${(clamped * 100).toFixed(1)}%` }}
      />
    </div>
  );
}

function StatsStrip({ stats, onRefresh }: { stats: Stats; onRefresh: () => void }) {
  const items = [
    { label: "פוסטים", v: stats?.posts },
    { label: "עמודים", v: stats?.pages },
    { label: "קטגוריות", v: stats?.categories },
    { label: "תגיות", v: stats?.tags },
    { label: "מדיה", v: stats?.media },
    { label: "חסר שער", v: stats?.postsMissingCover },
  ];
  return (
    <div className="flex items-center gap-3 overflow-x-auto rounded-lg border border-border bg-card p-3">
      {items.map((it) => (
        <div key={it.label} className="min-w-[110px] rounded-md bg-muted/40 px-3 py-2 text-center">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="text-lg font-bold text-foreground">{it.v ?? "—"}</div>
        </div>
      ))}
      <button
        onClick={onRefresh}
        className="ms-auto rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
      >
        רענן
      </button>
    </div>
  );
}

function SummaryCard({
  summary, statsNow, onDismiss,
}: { summary: Summary; statsNow: Stats; onDismiss: () => void }) {
  const durationMs = summary.endedAt - summary.startedAt;
  const mins = Math.floor(durationMs / 60000);
  const secs = Math.floor((durationMs % 60000) / 1000);
  const failedSteps = summary.logs.filter((l) => l.errors.length > 0);
  const dbStats = statsNow ?? summary.stats;

  return (
    <div className="rounded-lg border-2 border-primary bg-card p-6 shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {summary.fatal ? "⚠️ הייבוא הופסק עקב שגיאה" : "✅ הייבוא הסתיים"}
        </h2>
        <button
          onClick={onDismiss}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          סגור
        </button>
      </div>

      {summary.fatal && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {summary.fatal}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">משך כולל</div>
          <div className="text-lg font-bold text-foreground">{mins}ד׳ {secs}ש׳</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">שלבים שהצליחו</div>
          <div className="text-lg font-bold text-foreground">
            {summary.logs.length - failedSteps.length}/{summary.logs.length}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">סה״כ פריטים</div>
          <div className="text-lg font-bold text-foreground">
            {summary.logs.reduce((s, l) => s + l.imported, 0)}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-foreground">השוואת ספירות</h3>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-start">ישות</th>
                <th className="px-3 py-2 text-start">במסד הנתונים</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["פוסטים", dbStats?.posts],
                ["עמודים", dbStats?.pages],
                ["קטגוריות", dbStats?.categories],
                ["תגיות", dbStats?.tags],
                ["מדיה", dbStats?.media],
              ].map(([k, v]) => (
                <tr key={k as string} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{k}</td>
                  <td className="px-3 py-2 text-foreground">{v ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {failedSteps.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">שגיאות לפי שלב</h3>
          <ul className="space-y-2 text-sm">
            {failedSteps.map((s) => (
              <li key={s.id} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="font-medium text-foreground">{s.id}. {s.name}</div>
                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                  {s.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                  {s.errors.length > 10 && <li>ועוד {s.errors.length - 10}...</li>}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
