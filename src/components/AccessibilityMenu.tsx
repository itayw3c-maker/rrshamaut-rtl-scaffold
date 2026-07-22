// תפריט נגישות מובְנה ברמת עמידה מרבית — ת"י 5568 (WCAG 2.0 AA) + WCAG 2.1 AA.
// לא overlay חיצוני. מובנה בקוד, נשמר ב-localStorage, נגיש מקלדת מלא, עם focus-trap ו-aria-live.
// הנגישות הבסיסית של האתר מובנית ב-HTML/CSS; הסרגל מוסיף שכבת התאמות אישיות למשתמש.

import { useEffect, useRef, useState, useCallback } from "react";
// Uses plain <a> tags to avoid coupling to typed route paths.

type Contrast = "off" | "high" | "inverted" | "monochrome" | "low-saturation";
type LineHeight = "off" | "medium" | "large";
type LetterSpacing = "off" | "medium" | "large";
type TextAlign = "off" | "right" | "center" | "justify";

type Settings = {
  fontScale: number; // 100..200 (%)
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
  readableFont: boolean;
  contrast: Contrast;
  highlightLinks: boolean;
  highlightHeadings: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  hideImages: boolean;
  textAlign: TextAlign;
  keyboardFocus: boolean;
};

const DEFAULT: Settings = {
  fontScale: 100,
  lineHeight: "off",
  letterSpacing: "off",
  readableFont: false,
  contrast: "off",
  highlightLinks: false,
  highlightHeadings: false,
  stopAnimations: false,
  bigCursor: false,
  readingGuide: false,
  readingMask: false,
  hideImages: false,
  textAlign: "off",
  keyboardFocus: false,
};

const STORAGE_KEY = "a11y-settings-v2";

function applyToDom(s: Settings) {
  const root = document.documentElement;
  root.style.fontSize = s.fontScale === 100 ? "" : `${s.fontScale}%`;

  // contrast modes (mutually exclusive)
  root.classList.remove("a11y-c-high", "a11y-c-inverted", "a11y-c-monochrome", "a11y-c-lowsat");
  if (s.contrast === "high") root.classList.add("a11y-c-high");
  if (s.contrast === "inverted") root.classList.add("a11y-c-inverted");
  if (s.contrast === "monochrome") root.classList.add("a11y-c-monochrome");
  if (s.contrast === "low-saturation") root.classList.add("a11y-c-lowsat");

  // line-height / letter-spacing
  root.classList.remove("a11y-lh-medium", "a11y-lh-large");
  if (s.lineHeight === "medium") root.classList.add("a11y-lh-medium");
  if (s.lineHeight === "large") root.classList.add("a11y-lh-large");

  root.classList.remove("a11y-ls-medium", "a11y-ls-large");
  if (s.letterSpacing === "medium") root.classList.add("a11y-ls-medium");
  if (s.letterSpacing === "large") root.classList.add("a11y-ls-large");

  root.classList.remove("a11y-align-right", "a11y-align-center", "a11y-align-justify");
  if (s.textAlign === "right") root.classList.add("a11y-align-right");
  if (s.textAlign === "center") root.classList.add("a11y-align-center");
  if (s.textAlign === "justify") root.classList.add("a11y-align-justify");

  root.classList.toggle("a11y-readable-font", s.readableFont);
  root.classList.toggle("a11y-highlight-links", s.highlightLinks);
  root.classList.toggle("a11y-highlight-headings", s.highlightHeadings);
  root.classList.toggle("a11y-stop-animations", s.stopAnimations);
  root.classList.toggle("a11y-big-cursor", s.bigCursor);
  root.classList.toggle("a11y-hide-images", s.hideImages);
  root.classList.toggle("a11y-reading-mask", s.readingMask);
  root.classList.toggle("a11y-reading-guide", s.readingGuide);
  root.classList.toggle("a11y-keyboard-focus", s.keyboardFocus);
}

export function AccessibilityMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [announcement, setAnnouncement] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const maskTopRef = useRef<HTMLDivElement | null>(null);
  const maskBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = { ...DEFAULT, ...JSON.parse(saved) };
        setSettings(parsed);
        applyToDom(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const update = useCallback((patch: Partial<Settings>, announceText?: string) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      applyToDom(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    if (announceText) setAnnouncement(announceText);
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT);
    applyToDom(DEFAULT);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setAnnouncement("כל הגדרות הנגישות אופסו");
  }, []);

  // reading guide (horizontal line following cursor)
  useEffect(() => {
    if (!settings.readingGuide) return;
    const el = guideRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => { el.style.top = `${e.clientY}px`; };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [settings.readingGuide]);

  // reading mask (dim above/below cursor)
  useEffect(() => {
    if (!settings.readingMask) return;
    const top = maskTopRef.current;
    const bottom = maskBottomRef.current;
    if (!top || !bottom) return;
    const move = (e: MouseEvent) => {
      const bandHeight = 120;
      top.style.height = `${Math.max(0, e.clientY - bandHeight / 2)}px`;
      bottom.style.top = `${e.clientY + bandHeight / 2}px`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [settings.readingMask]);

  // Esc + focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, [href]")?.focus();
    }, 50);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open]);

  // keyboard shortcut: Alt+Shift+A opens the menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && (e.key === "A" || e.key === "a" || e.code === "KeyA")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!mounted) return null;

  const fontUp = () => {
    const next = Math.min(settings.fontScale + 10, 200);
    update({ fontScale: next }, `גודל טקסט ${next} אחוז`);
  };
  const fontDown = () => {
    const next = Math.max(settings.fontScale - 10, 90);
    update({ fontScale: next }, `גודל טקסט ${next} אחוז`);
  };

  return (
    <>
      {/* live region — הודעות לקורא-מסך על שינויי הגדרות */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

      {/* Reading guide */}
      {settings.readingGuide && (
        <div
          ref={guideRef}
          aria-hidden="true"
          className="fixed left-0 right-0 h-8 bg-yellow-300/40 border-y-2 border-yellow-500 pointer-events-none z-[9997]"
          style={{ top: 0 }}
        />
      )}

      {/* Reading mask */}
      {settings.readingMask && (
        <>
          <div
            ref={maskTopRef}
            aria-hidden="true"
            className="fixed left-0 right-0 top-0 bg-black/70 pointer-events-none z-[9996]"
            style={{ height: 0 }}
          />
          <div
            ref={maskBottomRef}
            aria-hidden="true"
            className="fixed left-0 right-0 bottom-0 bg-black/70 pointer-events-none z-[9996]"
            style={{ top: 0 }}
          />
        </>
      )}

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="פתיחת תפריט נגישות (Alt+Shift+A)"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="a11y-panel"
        title="תפריט נגישות (Alt+Shift+A)"
        className="fixed bottom-4 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-[#1a3a5c] text-white shadow-2xl hover:bg-[#0f2540] focus-visible:outline-4 focus-visible:outline-yellow-400 focus-visible:outline-offset-2"
        style={{ insetInlineStart: "1rem" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-8 h-8">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 8h-5v3l2 7-2 1-2-6h-2l-2 6-2-1 2-7V8H3V6h18v2z" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-panel-title"
          dir="rtl"
          className="fixed bottom-20 z-[9999] w-96 max-w-[calc(100vw-1rem)] max-h-[85vh] overflow-y-auto rounded-xl border-2 border-[#1a3a5c] bg-white text-black shadow-2xl"
          style={{ insetInlineStart: "1rem" }}
        >
          {/* header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#1a3a5c] bg-[#1a3a5c] px-4 py-3 text-white">
            <h2 id="a11y-panel-title" className="text-base font-bold">תפריט נגישות</h2>
            <button
              type="button"
              onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
              aria-label="סגירת תפריט נגישות"
              className="rounded p-1 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6" aria-hidden="true">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* קיצור דרך: איפוס */}
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-lg border-2 border-red-600 bg-white py-2 text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              איפוס כל ההגדרות
            </button>

            {/* טקסט */}
            <Section title="התאמת טקסט">
              <div>
                <Label>גודל טקסט: {settings.fontScale}%</Label>
                <div className="flex gap-2">
                  <IconBtn onClick={fontDown} aria-label="הקטן טקסט" disabled={settings.fontScale <= 90}>−</IconBtn>
                  <IconBtn onClick={fontUp} aria-label="הגדל טקסט" disabled={settings.fontScale >= 200}>+</IconBtn>
                </div>
              </div>

              <SegGroup label="מרווח שורות" value={settings.lineHeight}
                options={[{v:"off",l:"רגיל"},{v:"medium",l:"בינוני"},{v:"large",l:"גדול"}]}
                onChange={(v) => update({ lineHeight: v as LineHeight }, `מרווח שורות: ${v}`)} />

              <SegGroup label="מרווח אותיות" value={settings.letterSpacing}
                options={[{v:"off",l:"רגיל"},{v:"medium",l:"בינוני"},{v:"large",l:"גדול"}]}
                onChange={(v) => update({ letterSpacing: v as LetterSpacing }, `מרווח אותיות: ${v}`)} />

              <SegGroup label="יישור טקסט" value={settings.textAlign}
                options={[{v:"off",l:"ברירת מחדל"},{v:"right",l:"לימין"},{v:"center",l:"למרכז"},{v:"justify",l:"מיושר"}]}
                onChange={(v) => update({ textAlign: v as TextAlign }, `יישור: ${v}`)} />

              <Toggle label="גופן קריא (Arial)" checked={settings.readableFont}
                onChange={(v) => update({ readableFont: v }, v ? "גופן קריא מופעל" : "גופן קריא כבוי")} />
            </Section>

            {/* צבע וניגודיות */}
            <Section title="צבע וניגודיות">
              <SegGroup label="מצב ניגודיות" value={settings.contrast}
                options={[
                  {v:"off",l:"רגיל"},
                  {v:"high",l:"גבוהה"},
                  {v:"inverted",l:"מהופך"},
                  {v:"monochrome",l:"שחור-לבן"},
                  {v:"low-saturation",l:"רוויה נמוכה"},
                ]}
                onChange={(v) => update({ contrast: v as Contrast }, `ניגודיות: ${v}`)} />
            </Section>

            {/* הדגשות */}
            <Section title="הדגשות ותצוגה">
              <Toggle label="הדגשת קישורים" checked={settings.highlightLinks}
                onChange={(v) => update({ highlightLinks: v }, v ? "הדגשת קישורים מופעלת" : "הדגשת קישורים כבויה")} />
              <Toggle label="הדגשת כותרות" checked={settings.highlightHeadings}
                onChange={(v) => update({ highlightHeadings: v }, v ? "הדגשת כותרות מופעלת" : "הדגשת כותרות כבויה")} />
              <Toggle label="הסתרת תמונות" checked={settings.hideImages}
                onChange={(v) => update({ hideImages: v }, v ? "תמונות מוסתרות" : "תמונות מוצגות")} />
              <Toggle label="עצירת אנימציות" checked={settings.stopAnimations}
                onChange={(v) => update({ stopAnimations: v }, v ? "אנימציות נעצרו" : "אנימציות פועלות")} />
            </Section>

            {/* עזרי קריאה */}
            <Section title="עזרי ניווט וקריאה">
              <Toggle label="סמן גדול" checked={settings.bigCursor}
                onChange={(v) => update({ bigCursor: v }, v ? "סמן גדול מופעל" : "סמן רגיל")} />
              <Toggle label="מדריך קריאה (סרגל צהוב)" checked={settings.readingGuide}
                onChange={(v) => update({ readingGuide: v }, v ? "מדריך קריאה מופעל" : "מדריך קריאה כבוי")} />
              <Toggle label="מסכת קריאה (הכהיית סביבה)" checked={settings.readingMask}
                onChange={(v) => update({ readingMask: v }, v ? "מסכת קריאה מופעלת" : "מסכת קריאה כבויה")} />
              <Toggle label="הדגשת פוקוס מקלדת" checked={settings.keyboardFocus}
                onChange={(v) => update({ keyboardFocus: v }, v ? "הדגשת פוקוס מופעלת" : "הדגשת פוקוס כבויה")} />
            </Section>

            {/* קישורים חובה */}
            <Section title="מידע ותמיכה">
              <div className="grid gap-2">
                <a href="/accessibility" className="block rounded-lg border-2 border-[#1a3a5c] bg-white px-3 py-2 text-center text-sm font-semibold text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white focus-visible:outline-2 focus-visible:outline-yellow-400">
                  הצהרת נגישות מלאה
                </a>
                <a href="/מפת-אתר/" className="block rounded-lg border-2 border-[#1a3a5c] bg-white px-3 py-2 text-center text-sm font-semibold text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white focus-visible:outline-2 focus-visible:outline-yellow-400">
                  מפת האתר
                </a>
                <a href="/accessibility#coordinator" className="block rounded-lg border-2 border-[#1a3a5c] bg-white px-3 py-2 text-center text-sm font-semibold text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white focus-visible:outline-2 focus-visible:outline-yellow-400">
                  דיווח על תקלת נגישות
                </a>
              </div>
              <p className="mt-3 text-xs text-black/70 leading-relaxed">
                האתר עומד בת״י 5568 ברמת AA (WCAG 2.0/2.1). קיצור לפתיחת התפריט: Alt+Shift+A.
              </p>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t-2 border-gray-200 pt-3">
      <legend className="px-2 text-sm font-bold text-[#1a3a5c]">{title}</legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold mb-1.5 text-black">{children}</div>;
}

function IconBtn({
  children, onClick, disabled, ...props
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 min-h-11 rounded-lg border-2 border-[#1a3a5c] bg-white py-2 text-xl font-bold text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white focus-visible:outline-2 focus-visible:outline-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  );
}

function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full min-h-11 items-center justify-between rounded-lg border-2 px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-yellow-400 ${
        checked ? "border-[#1a3a5c] bg-[#e8f0f9] text-[#1a3a5c]" : "border-gray-300 bg-white text-black hover:border-[#1a3a5c]"
      }`}
    >
      <span>{label}</span>
      <span aria-hidden="true" className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#1a3a5c]" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-0.5" : "left-5"}`} />
      </span>
    </button>
  );
}

function SegGroup({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div role="group" aria-label={label}>
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => onChange(o.v)}
              aria-pressed={active}
              className={`min-h-11 rounded-lg border-2 px-1 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-yellow-400 ${
                active ? "border-[#1a3a5c] bg-[#1a3a5c] text-white" : "border-gray-300 bg-white text-black hover:border-[#1a3a5c]"
              }`}
            >
              {o.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
