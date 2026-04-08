import { Link } from "react-router-dom";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";

const SECTORS = [
  "Energy",
  "Labor",
  "Philanthropy",
  "Culture",
  "Policy",
  "National Security",
];

const HERO_LINKS = [
  { label: "Cultural Strategy", to: "/cultural-strategy" },
  { label: "Cross-Sector Intelligence", to: "/cross-sector" },
  { label: "Deep Organizing", to: "/deep-organizing" },
];

const Index = () => {
  const { playHoverGlitch, playClickGlitch } = useGlitchSFX();
  return (
    <AtmosphericLayout>
      <div className="flex items-center justify-center h-full w-full">
        {/* HUD: top-right */}
        <span
          className="fixed top-6 right-6 z-30 text-[10px] tracking-[0.15em] uppercase"
          style={{ color: t.ink(0.3), fontFamily: t.sans }}
        >
          Van Gelder Co.
        </span>

        {/* Center content */}
        <main className="relative z-20 flex flex-col items-center text-center px-6 max-w-3xl gap-10 md:gap-14">
          {/* Classification label */}
          <span
            className="text-[11px] tracking-[0.25em] uppercase"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.4),
              animation: "fade-up 0.6s ease-out 0.3s both",
            }}
          >
            VGC StratComm Advisors
          </span>

          {/* Hero lines — nav links */}
          <h1 className="flex flex-col gap-2 md:gap-3">
            {HERO_LINKS.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="hero-nav-link group relative flex items-center justify-center py-1.5 md:py-2 px-4 md:px-6 rounded-lg"
                onPointerEnter={() => playHoverGlitch()}
                onFocus={() => playHoverGlitch()}
                onClick={() => playClickGlitch()}
                style={{
                  animation: `clip-reveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.4 + i * 0.35}s both`,
                }}
              >
                <span
                  className="hero-nav-wash absolute inset-0 pointer-events-none rounded-lg"
                  style={{ background: "transparent", transition: "background 0.15s ease" }}
                />
                <span
                  className="hero-nav-text relative z-10 text-[22px] md:text-[44px] lg:text-[48px] font-bold leading-[1.15] transition-colors duration-150"
                  style={{ fontFamily: t.sans, color: t.ink(0.8) }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </h1>

          {/* Sector tags */}
          <div
            className="flex flex-wrap justify-center gap-2 md:gap-3"
            style={{ animation: "fade-up 0.7s ease-out 1.6s both" }}
          >
            {SECTORS.map((sector) => (
              <span
                key={sector}
                className="text-[10px] md:text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: t.sans,
                  color: t.ink(0.35),
                  background: t.ink(0.04),
                  border: t.border(0.08),
                }}
              >
                {sector}
              </span>
            ))}
          </div>

          {/* Access gate */}
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: t.sans,
              color: t.ink(0.25),
              animation: "fade-up 0.6s ease-out 2.0s both",
            }}
          >
            By Referral Only
          </span>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default Index;
