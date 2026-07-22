import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { submitLeadFn } from "@/lib/leads.functions";

export type LeadFormVariant = "hero" | "cta" | "sidebar" | "contact";

interface LeadFormProps {
  variant: LeadFormVariant;
  submitLabel?: string;
  className?: string;
}

const DAMAGE_OPTIONS = [
  "נזק מים",
  "נזק אש",
  "נזק טבע",
  "נזקי רכוש",
  "דחיית תביעה",
  "הערכת שווי רכוש",
  "אחר",
];

function defaultLabel(variant: LeadFormVariant): string {
  if (variant === "hero") return "לייעוץ חינם";
  if (variant === "cta") return "חיזרו אלי!";
  return "שליחה";
}

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  consent?: string;
  submit?: string;
}

const INPUT_CLASS =
  "block w-full min-h-11 rounded-md border border-[#cfced0] bg-white px-3 py-2 text-base text-foreground placeholder:text-[#7a7a7a] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

const ERROR_TEXT = "mt-1 text-xs font-semibold text-[#c92a2a]";
const ERROR_BORDER = "border-[#c92a2a] focus:border-[#c92a2a] focus:ring-[#c92a2a]/30";

export function LeadForm({ variant, submitLabel, className }: LeadFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [damageType, setDamageType] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const singleColumn = variant === "sidebar" || variant === "cta";
  const gridClass = singleColumn
    ? "grid grid-cols-1 gap-4"
    : "grid grid-cols-1 gap-4 sm:grid-cols-2";

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "יש להזין שם";
    if (!phone.trim()) e.phone = "יש להזין טלפון";
    else if (!/^[0-9+\-\s()]{5,}$/.test(phone.trim())) e.phone = "מספר טלפון לא תקין";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "כתובת אימייל לא תקינה";
    }
    if (!(agreeTerms && agreePrivacy)) {
      e.consent = "יש לאשר את תנאי השירות ואת מדיניות הפרטיות";
    }
    return e;
  }

  async function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      await submitLeadFn({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim() || undefined,
          damageType: damageType || undefined,
          sourceUrl: typeof window !== "undefined" ? window.location.pathname : "",
          sourceVariant: variant,
          agreed: true,
        },
      });
      navigate({ to: "/thank-you" });
    } catch (err) {
      console.error(err);
      setErrors({ submit: "אירעה שגיאה בשליחה. אנא נסו שוב או חייגו אלינו." });
      setSubmitting(false);
    }
  }

  const label = submitLabel ?? defaultLabel(variant);

  return (
    <form
      dir="rtl"
      onSubmit={onSubmit}
      noValidate
      className={`w-full ${className ?? ""}`}
    >
      <div className={gridClass}>
        <div>
          <label htmlFor={`lf-${variant}-name`} className="mb-1 block text-sm font-semibold text-foreground">
            שם <span className="text-[#c92a2a]">*</span>
          </label>
          <input
            id={`lf-${variant}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${INPUT_CLASS} ${errors.name ? ERROR_BORDER : ""}`}
            placeholder="שם מלא"
            autoComplete="name"
          />
          {errors.name && <p className={ERROR_TEXT}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor={`lf-${variant}-phone`} className="mb-1 block text-sm font-semibold text-foreground">
            טלפון <span className="text-[#c92a2a]">*</span>
          </label>
          <input
            id={`lf-${variant}-phone`}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${INPUT_CLASS} ${errors.phone ? ERROR_BORDER : ""}`}
            placeholder="050-0000000"
            autoComplete="tel"
          />
          {errors.phone && <p className={ERROR_TEXT}>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor={`lf-${variant}-email`} className="mb-1 block text-sm font-semibold text-foreground">
            אימייל
          </label>
          <input
            id={`lf-${variant}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${INPUT_CLASS} ${errors.email ? ERROR_BORDER : ""}`}
            placeholder="name@example.com"
            autoComplete="email"
            dir="ltr"
          />
          {errors.email && <p className={ERROR_TEXT}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor={`lf-${variant}-damage`} className="mb-1 block text-sm font-semibold text-foreground">
            באיזה נזק מדובר?
          </label>
          <select
            id={`lf-${variant}-damage`}
            value={damageType}
            onChange={(e) => setDamageType(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">בחרו סוג נזק</option>
            {DAMAGE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className={singleColumn ? "" : "sm:col-span-2"}>
          <label htmlFor={`lf-${variant}-message`} className="mb-1 block text-sm font-semibold text-foreground">
            הודעה
          </label>
          <textarea
            id={`lf-${variant}-message`}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${INPUT_CLASS} resize-y`}
            placeholder="ספרו לנו בקצרה על הפנייה"
          />
        </div>
      </div>

      <LeadFormConsent
        variant={variant}
        agreeTerms={agreeTerms}
        agreePrivacy={agreePrivacy}
        onTerms={setAgreeTerms}
        onPrivacy={setAgreePrivacy}
        error={errors.consent}
      />

      {errors.submit && (
        <p className="mt-3 rounded-md bg-[#fdecec] px-3 py-2 text-sm font-semibold text-[#c92a2a]">
          {errors.submit}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto sm:min-w-[220px]"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {submitting ? "שולח..." : label}
      </button>
    </form>
  );
}

interface ConsentProps {
  variant: LeadFormVariant;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  onTerms: (v: boolean) => void;
  onPrivacy: (v: boolean) => void;
  error?: string;
}

export function LeadFormConsent({
  variant,
  agreeTerms,
  agreePrivacy,
  onTerms,
  onPrivacy,
  error,
}: ConsentProps) {
  const idBase = `lf-${variant}-consent`;
  return (
    <div className="mt-4 space-y-2">
      <label htmlFor={`${idBase}-terms`} className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
        <input
          id={`${idBase}-terms`}
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => onTerms(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#056FC4]"
        />
        <span>אני מאשר/ת את תנאי השירות</span>
      </label>
      <label htmlFor={`${idBase}-privacy`} className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
        <input
          id={`${idBase}-privacy`}
          type="checkbox"
          checked={agreePrivacy}
          onChange={(e) => onPrivacy(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#056FC4]"
        />
        <span>
          אני מאשר/ת כי קראתי את{" "}
          <a href={`/${encodeURIComponent("מדיניות-פרטיות")}/`} className="underline hover:opacity-90">מדיניות הפרטיות</a>{" "}
          ואני מסכימ/ה לשמירת הפרטים לצורך יצירת קשר.
        </span>
      </label>
      {error && <p className={ERROR_TEXT}>{error}</p>}
    </div>
  );
}

export default LeadForm;
