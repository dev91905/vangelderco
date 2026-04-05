import { Link } from "react-router-dom";
import AtmosphericLayout from "@/components/AtmosphericLayout";

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
  return (
    <AtmosphericLayout>
      <div className="flex items-center justify-center h-full w-full">
        {/* HUD: top-right */}
        <span
          className="fixed top-6 right-6 z-30 font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "hsl(0 0% 100% / 0.18)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Van Gelder Co.
        </span>

        {/* Center content */}
        <main className="relative z-20 flex flex-col items-center text-center px-6 max-w-3xl gap-10 md:gap-14">
          {/* Classification label */}
          <span
            className="text-[11px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 80% 48% / 0.9)",
              animation: "fade-up 0.6s ease-out 0.3s both",
            }}
          >
            VGC StratComm Advisors
          </span>

          {/* Hero lines — now links */}
          <h1 className="flex flex-col gap-2 md:gap-3">
            {HERO_LINKS.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="hero-nav-link group relative flex items-center justify-center"
                style={{
                  animation: `clip-reveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.8 + i * 0.4}s both`,
                }}
              >
                {/* Glow behind text on hover */}
                <span
                  className="hero-nav-glow absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 60% 80% at center, hsl(0 80% 48% / 0) 0%, transparent 70%)",
                    transition: "background 0.4s ease",
                  }}
                />

                {/* Scan line overlay */}
                <span className="hero-nav-scan absolute inset-0 pointer-events-none overflow-hidden">
                  <span
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: "3px",
                      background: "hsl(0 80% 48% / 0)",
                      boxShadow: "0 0 12px 4px hsl(0 80% 48% / 0)",
                      transition: "left 0.5s ease, background 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                </span>

                {/* Inline-flex wrapper: caret + text together */}
                <span className="hero-nav-inner inline-flex items-center gap-2 md:gap-3 relative z-10">
                  {/* Caret */}
                  <span
                    className="hero-nav-caret text-[14px] md:text-[18px]"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "hsl(0 80% 48% / 0.8)",
                      opacity: 0,
                      transform: "translateX(-8px)",
                      transition: "opacity 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    &gt;
                  </span>

                  {/* Text + underline */}
                  <span className="relative">
                    <span
                      className="hero-nav-text text-[22px] md:text-[44px] lg:text-[48px] font-medium leading-[1.15] transition-colors duration-300"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: "hsl(0 0% 100% / 0.9)",
                      }}
                    >
                      {link.label}
                    </span>
                    {/* Underline */}
                    <span
                      className="hero-nav-underline absolute bottom-0 left-0 w-full h-px"
                      style={{
                        background: "hsl(0 80% 48% / 0.4)",
                        transform: "scaleX(0)",
                        transition: "transform 0.4s ease",
                      }}
                    />
                  </span>
                </span>
              </Link>
            ))}
          </h1>

          {/* Sector tags */}
          <div
            className="flex flex-wrap justify-center gap-2 md:gap-3"
            style={{ animation: "fade-up 0.7s ease-out 2.4s both" }}
          >
            {SECTORS.map((sector) => (
              <span
                key={sector}
                className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase px-3 py-1.5"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "hsl(0 0% 100% / 0.5)",
                  border: "1px solid hsl(0 0% 100% / 0.08)",
                  borderLeft: "2px solid hsl(0 80% 48% / 0.5)",
                }}
              >
                {sector}
              </span>
            ))}
          </div>

          {/* Access gate */}
          <span
            className="text-[10px] tracking-[0.35em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 0% 100% / 0.25)",
              animation: "fade-up 0.6s ease-out 3.0s both",
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
