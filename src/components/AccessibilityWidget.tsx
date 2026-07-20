import { useEffect, useState, useCallback } from "react";
import { Accessibility, X, RotateCcw, Plus, Minus } from "lucide-react";

type A11yState = {
  fontScale: number; // 1.0 = 100%
  highContrast: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  pauseAnimations: boolean;
};

const DEFAULTS: A11yState = {
  fontScale: 1,
  highContrast: false,
  highlightLinks: false,
  readableFont: false,
  pauseAnimations: false,
};

const STORAGE_KEY = "a11y-prefs-v1";
const MIN_SCALE = 0.9;
const MAX_SCALE = 1.6;
const STEP = 0.1;

function apply(state: A11yState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", String(state.fontScale));
  root.classList.toggle("a11y-high-contrast", state.highContrast);
  root.classList.toggle("a11y-highlight-links", state.highlightLinks);
  root.classList.toggle("a11y-readable-font", state.readableFont);
  root.classList.toggle("a11y-paused", state.pauseAnimations);
}

function loadInitial(): A11yState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { ...DEFAULTS, pauseAnimations: reduced };
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const init = loadInitial();
    setState(init);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    apply(state);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state, hydrated]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const update = useCallback((patch: Partial<A11yState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const reset = () => setState(DEFAULTS);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        style={{ backgroundColor: "#1a3a5c" }}
      >
        <Accessibility className="h-7 w-7" aria-hidden="true" />
      </button>

      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="תפריט נגישות"
          dir="rtl"
          className="fixed bottom-24 right-5 z-50 w-[min(92vw,320px)] rounded-2xl border border-border bg-white p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-base font-bold text-foreground">התאמות נגישות</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירת תפריט נגישות"
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-[hsl(var(--muted))]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">גודל טקסט</p>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => update({ fontScale: Math.max(MIN_SCALE, +(state.fontScale - STEP).toFixed(2)) })}
                  disabled={state.fontScale <= MIN_SCALE}
                  aria-label="הקטנת גודל טקסט"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-[hsl(var(--muted))] disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-16 text-center text-sm font-medium text-foreground" aria-live="polite">
                  {Math.round(state.fontScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => update({ fontScale: Math.min(MAX_SCALE, +(state.fontScale + STEP).toFixed(2)) })}
                  disabled={state.fontScale >= MAX_SCALE}
                  aria-label="הגדלת גודל טקסט"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-[hsl(var(--muted))] disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <Toggle
              label="ניגודיות גבוהה"
              checked={state.highContrast}
              onChange={(v) => update({ highContrast: v })}
            />
            <Toggle
              label="הדגשת קישורים"
              checked={state.highlightLinks}
              onChange={(v) => update({ highlightLinks: v })}
            />
            <Toggle
              label="גופן קריא"
              checked={state.readableFont}
              onChange={(v) => update({ readableFont: v })}
            />
            <Toggle
              label="עצירת אנימציות"
              checked={state.pauseAnimations}
              onChange={(v) => update({ pauseAnimations: v })}
            />

            <button
              type="button"
              onClick={reset}
              className="flex w-full min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-[hsl(var(--muted))]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              איפוס הגדרות
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-[hsl(var(--muted))]">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[hsl(var(--primary))]"
        aria-label={label}
      />
    </label>
  );
}

export default AccessibilityWidget;
