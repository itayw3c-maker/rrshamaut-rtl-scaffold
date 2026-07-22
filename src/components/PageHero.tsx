import { Link } from "@tanstack/react-router";
import { appHref } from "@/lib/href";

const PUZZLE_ICON =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/306/vector-2.png";

const HERO_BG =
  "https://bsfewufipprschijelmk.supabase.co/storage/v1/object/public/media/wp/281/rectangle-48-7.png";

interface PageHeroProps {
  title: string;
  crumbs?: Array<{ label: string; to?: string }>;
}

export function PageHero({ title, crumbs }: PageHeroProps) {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-b border-border"
    >
      {/* Background photo band */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Light overlay to keep text readable */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(238,244,251,0.88) 0%, rgba(247,250,253,0.86) 60%, rgba(255,255,255,0.92) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
        <img
          src={PUZZLE_ICON}
          alt=""
          aria-hidden
          className="mx-auto mb-3 h-10 w-10"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(70%) sepia(35%) saturate(700%) hue-rotate(5deg) brightness(95%) contrast(92%)",
          }}
        />
        <nav aria-label="פירורי לחם" className="text-xs text-[#7a7a7a] sm:text-sm">
          <Link to="/" className="text-[hsl(var(--primary))] hover:underline">
            דף הבית
          </Link>
          {crumbs?.map((c) => (
            <span key={c.label}>
              <span className="mx-1" aria-hidden="true">»</span>
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
          <span className="mx-1" aria-hidden="true">»</span>
          <span className="text-[#7a7a7a]" aria-current="page">{title}</span>
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
