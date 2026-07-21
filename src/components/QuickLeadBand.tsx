import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { submitLeadFn } from "@/lib/leads.functions";

const DAMAGE_OPTIONS = [
  "נזק מים",
  "נזק אש",
  "נזק טבע",
  "נזקי רכוש",
  "דחיית תביעה",
  "הערכת שווי רכוש",
  "אחר",
];

const INPUT =
  "block w-full min-h-11 rounded-md border border-white/30 bg-white px-3 py-2 text-base text-foreground placeholder:text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gold))]";

export function QuickLeadBand() {
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
          sourceVariant: "band",
          agreed: true,
        },
      });
      navigate({ to: "/thank-you" });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "אירעה שגיאה, נסו שוב" });
      setSubmitting(false);
    }
  }

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[#1470CE] py-10 sm:py-12"
      style={{
        backgroundImage:
          "radial-gradient(rgba(203,164,54,0.28) 1.2px, transparent 1.4px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-xl font-extrabold text-white sm:text-2xl">
          השאירו פרטים לשיחת ייעוץ אישית איתי ללא התחייבות!
        </h3>

        <form onSubmit={onSubmit} noValidate className="mt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <input
                type="text"
                placeholder="שם מלא"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                className={INPUT}
              />
              {errors.name && <p className="mt-1 text-xs text-white">{errors.name}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
                className={INPUT}
              />
              {errors.phone && <p className="mt-1 text-xs text-white">{errors.phone}</p>}
            </div>
            <div>
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
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[hsl(var(--gold))] px-6 py-2.5 text-base font-bold text-white shadow-sm transition hover:brightness-95 disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              חיזרו אלי!
            </button>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--gold))]"
            />
            <span>
              אני מאשר/ת כי קראתי את מדיניות הפרטיות ואני מסכימ/ה לשמירת הפרטים לצורך יצירת קשר.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1 text-sm font-semibold text-[#FFD6D6]">{errors.consent}</p>
          )}
          {errors.submit && (
            <p className="mt-2 text-sm font-semibold text-[#FFD6D6]">{errors.submit}</p>
          )}
        </form>
      </div>
    </section>
  );
}

export default QuickLeadBand;
