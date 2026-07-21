import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/lib/site-config";
import { submitLeadFn } from "@/lib/leads.functions";

const DAMAGE_OPTIONS = [
  "נזק מים", "נזק אש", "נזק טבע", "נזקי רכוש", "דחיית תביעה", "הערכת שווי רכוש", "אחר",
];

export function ContactView() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [damage, setDamage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string; submit?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "יש להזין שם";
    if (!phone.trim()) errs.phone = "יש להזין טלפון";
    if (!agreed) errs.consent = "יש לאשר מדיניות פרטיות";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await submitLeadFn({
        data: {
          name: name.trim(), phone: phone.trim(),
          email: email.trim() || undefined,
          damageType: damage || undefined,
          sourceUrl: "/צור-קשר", sourceVariant: "contact", agreed: true,
        },
      });
      navigate({ to: "/thank-you" });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "אירעה שגיאה" });
      setSubmitting(false);
    }
  }

  const INPUT = "block w-full min-h-11 rounded-md border border-white/40 bg-white/95 px-3 py-2 text-base text-foreground placeholder:text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-white/50";

  return (
    <div dir="rtl">
      <PageHero title="צור קשר" />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* RIGHT column */}
          <div className="order-1 space-y-6">
            <h2 className="text-2xl font-extrabold text-[hsl(var(--primary))]">
              פרטי יצירת קשר
            </h2>
            <ul className="space-y-3 text-base text-foreground">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[hsl(var(--gold))]" />
                <a href={`tel:${siteConfig.phone}`} className="hover:text-[hsl(var(--primary))]">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[hsl(var(--gold))]" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-[hsl(var(--primary))]">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-[hsl(var(--gold))]" />
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener" className="hover:text-[hsl(var(--primary))]">
                  ווטסאפ: {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[hsl(var(--gold))]" />
                <span>אזור פעילות: {siteConfig.coverage}</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3">
              {[
                { i: FaInstagram, h: "https://www.instagram.com/rrshamaut" },
                { i: FaFacebookF, h: "https://www.facebook.com/rrshamaut/" },
                { i: FaTiktok, h: "https://www.tiktok.com/@rephaelshamaut" },
                { i: FaYoutube, h: "https://youtube.com/@rephael.shamaut-rr" },
                { i: FaWhatsapp, h: `https://wa.me/${siteConfig.whatsapp}` },
              ].map(({ i: Icon, h }) => (
                <a key={h} href={h} target="_blank" rel="noopener"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[hsl(var(--gold))] text-[hsl(var(--gold))] transition hover:bg-[hsl(var(--gold))] hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="rounded-2xl bg-[hsl(var(--navy))] p-6 text-white shadow-md">
              <h3 className="text-lg font-extrabold">שעות פעילות:</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between"><span>יום ראשון-חמישי</span><span>07:00 - 21:00</span></li>
                <li className="flex justify-between"><span>יום שישי</span><span>07:00 - 16:00</span></li>
                <li className="flex justify-between"><span>יום שבת</span><span>סגור</span></li>
              </ul>
            </div>
          </div>

          {/* LEFT column: gold card form */}
          <div className="order-2">
            <div className="rounded-[2rem] bg-[hsl(var(--gold))] p-8 shadow-lg">
              <p className="text-lg font-extrabold text-white">
                מוזמנים להתקשר או להשאיר פרטים ליצירת קשר ונשוב אליכם בהקדם!
              </p>
              <form onSubmit={onSubmit} noValidate className="mt-5 space-y-3">
                <input type="text" placeholder="שם מלא" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
                {errors.name && <p className="text-xs font-semibold text-[#7a1010]">{errors.name}</p>}
                <input type="tel" placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
                {errors.phone && <p className="text-xs font-semibold text-[#7a1010]">{errors.phone}</p>}
                <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
                <select value={damage} onChange={(e) => setDamage(e.target.value)} className={INPUT}>
                  <option value="">באיזה נזק מדובר?</option>
                  {DAMAGE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-[#3a2a00]">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--navy))]" />
                  <span>אני מאשר/ת את מדיניות הפרטיות ותנאי השימוש.</span>
                </label>
                {errors.consent && <p className="text-xs font-semibold text-[#7a1010]">{errors.consent}</p>}
                {errors.submit && <p className="text-xs font-semibold text-[#7a1010]">{errors.submit}</p>}
                <button type="submit" disabled={submitting}
                  className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--navy))] px-6 py-3 text-lg font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-70">
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  חיזרו אלי!
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
