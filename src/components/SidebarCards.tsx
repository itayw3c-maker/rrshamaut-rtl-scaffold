import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Phone } from "lucide-react";
import { submitLeadFn } from "@/lib/leads.functions";
import { siteConfig } from "@/lib/site-config";

const DAMAGE_OPTIONS = [
  "נזק מים",
  "נזק אש",
  "נזק טבע",
  "נזקי רכוש",
  "דחיית תביעה",
  "הערכת שווי רכוש",
  "אחר",
];

export function SidebarPhoneCard() {
  return (
    <section
      className="rounded-2xl p-6 text-center text-white shadow-md"
      style={{
        background:
          "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--navy)) 100%)",
      }}
    >
      <h3 className="text-lg font-extrabold leading-snug">
        צריכים להתייעץ עם שמאי רכוש ?
      </h3>
      <p className="mt-2 text-sm opacity-90">לשיחת ייעוץ חינם התקשרו עכשיו!</p>
      <a
        href={`tel:${siteConfig.phone}`}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--gold))] px-5 py-2.5 text-base font-bold text-white shadow-sm transition hover:brightness-95"
      >
        <Phone className="h-4 w-4" />
        {siteConfig.phone}
      </a>
    </section>
  );
}

export function SidebarLeadForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [damageType, setDamageType] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string; submit?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "יש להזין שם";
    if (!phone.trim()) errs.phone = "יש להזין טלפון";
    if (!agreed) errs.consent = "יש לאשר את מדיניות הפרטיות";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await submitLeadFn({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          damageType: damageType || undefined,
          sourceUrl: typeof window !== "undefined" ? window.location.pathname : "/",
          sourceVariant: "sidebar",
          agreed: true,
        },
      });
      navigate({ to: "/thank-you" });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "אירעה שגיאה, נסו שוב" });
      setSubmitting(false);
    }
  }

  const INPUT =
    "block w-full min-h-11 rounded-md border border-[#cfced0] bg-white px-3 py-2 text-base text-foreground placeholder:text-[#7a7a7a] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-center text-base font-extrabold text-[hsl(var(--primary))]">
        השאירו פרטים לשיחת ייעוץ ללא עלות!
      </h3>
      <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="שם מלא"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT}
        />
        {errors.name && <p className="text-xs text-[#c92a2a]">{errors.name}</p>}
        <input
          type="tel"
          placeholder="טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={INPUT}
        />
        {errors.phone && <p className="text-xs text-[#c92a2a]">{errors.phone}</p>}
        <select
          value={damageType}
          onChange={(e) => setDamageType(e.target.value)}
          className={INPUT}
        >
          <option value="">באיזה נזק מדובר?</option>
          {DAMAGE_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--gold))]"
          />
          <span>
            אני מאשר/ת כי קראתי את מדיניות הפרטיות ומסכימ/ה לשמירת הפרטים ליצירת קשר.
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs font-semibold text-[#c92a2a]">{errors.consent}</p>
        )}
        {errors.submit && (
          <p className="text-xs font-semibold text-[#c92a2a]">{errors.submit}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-md bg-[hsl(var(--gold))] px-5 py-2.5 text-base font-bold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          חיזרו אלי!
        </button>
      </form>
    </section>
  );
}

export function InlineCtaBand() {
  return (
    <section dir="rtl" className="py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 text-center text-white shadow-lg sm:p-10"
          style={{
            background:
              "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(var(--navy)) 100%)",
          }}
        >
          <h3 className="text-2xl font-extrabold sm:text-3xl">
            צריכים להתייעץ עם שמאי רכוש ?
          </h3>
          <p className="mt-2 text-base opacity-95">
            לשיחת ייעוץ חינם התקשרו עכשיו!
          </p>
          <a
            href={`tel:${siteConfig.phone}`}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--gold))] px-8 py-3 text-lg font-bold text-white shadow-sm hover:brightness-95"
          >
            <Phone className="h-5 w-5" />
            {siteConfig.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
