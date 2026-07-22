import { Link } from "@tanstack/react-router";
import { appHref } from "@/lib/href";

const PUZZLE_ICON =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/306/vector-2.png";

interface PageHeroProps {
  title: string;
  crumbs?: Array<{ label: string; to?: string }>;
}

export function PageHero({ title, crumbs }: PageHeroProps) {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-b border-border"
      style={{
        background:
          "linear-gradient(180deg,#EEF4FB 0%, #F7FAFD 60%, #FFFFFF 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${PUZZLE_ICON})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 20%",
            backgroundSize: "180px auto",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
        <img
          src={PUZZLE_ICON}
          alt=""
          aria-hidden
          className="mx-auto mb-3 h-8 w-8 opacity-80"
        />
        <nav className="text-xs text-[#7a7a7a] sm:text-sm">
          <Link to="/" className="text-[hsl(var(--primary))] hover:underline">
            דף הבית
          </Link>
          {crumbs?.map((c) => (
            <span key={c.label}>
              <span className="mx-1">»</span>
              {c.to ? (
                <a
                  href={appHref(c.to)}
                  className="text-[hsl(var(--primary))] hover:underline"
                >
                  {c.label}
                </a>
              ) : (
                <span className="text-[#7a7a7a]">{c.label}</span>
              )}
            </span>
          ))}
          <span className="mx-1">»</span>
          <span className="text-[#7a7a7a]">{title}</span>
        </nav>
        <h1
          className="mt-3 text-3xl font-extrabold leading-tight text-[hsl(var(--primary))] sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "Assistant, system-ui, sans-serif", fontWeight: 800 }}
        >
          {title}
        </h1>
      </div>

      {/* Rounded white curve at bottom-left */}
      <div
        aria-hidden
        className="absolute -bottom-1 left-0 hidden h-10 w-56 bg-white sm:block"
        style={{ borderTopRightRadius: "9999px" }}
      />
    </section>
  );
}

export default PageHero;
