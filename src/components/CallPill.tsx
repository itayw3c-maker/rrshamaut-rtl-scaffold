import { siteConfig } from "@/lib/site-config";

const AGENT_PHOTO =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/3081/untitled-design-2025-09-17t110847-382.webp";

export function CallPill() {
  const tel = `tel:${siteConfig.phone.replace(/[^0-9+]/g, "")}`;
  return (
    <a
      href={tel}
      dir="rtl"
      aria-label={`חייגו עכשיו ${siteConfig.phone}`}
      className="fixed bottom-24 left-5 z-40 hidden items-center gap-3 rounded-full bg-white py-2 pl-4 pr-2 shadow-xl ring-1 ring-black/5 transition hover:shadow-2xl sm:flex"
    >
      <img
        src={AGENT_PHOTO}
        alt="רפאל ריבוח"
        loading="lazy"
        className="h-11 w-11 rounded-full object-cover ring-2 ring-[hsl(var(--gold))]"
      />
      <span className="flex flex-col text-right leading-tight">
        <span className="text-[11px] text-[#4a4d55]">לשיחת ייעוץ חינם חייגו עכשיו!</span>
        <span className="text-base font-extrabold text-[hsl(var(--primary))]">
          {siteConfig.phone}
        </span>
      </span>
    </a>
  );
}

export default CallPill;
