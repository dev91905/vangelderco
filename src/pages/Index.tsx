const SECTORS = [
  "Energy",
  "Labor",
  "Philanthropy",
  "Culture",
  "Policy",
  "National Security",
];

const HERO_LINES = [
  "Cultural Strategy",
  "Cross-Sector Intelligence",
  "Deep Organizing",
];

const Index = () => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Breathing red glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vh, 600px)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, hsl(0 80% 48% / 0.25) 0%, transparent 70%)",
          animation: "breathe 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.6) 100%)",
        }}
      />

      {/* Scan beam */}
      <div
        className="pointer-events-none fixed left-0 z-20 w-full"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.06) 20%, hsl(0 0% 100% / 0.06) 80%, transparent 100%)",
          animation: "scan-beam 7s linear infinite",
          position: "fixed",
        }}
      />

      {/* HUD: top-right */}
      <span
        className="fixed top-6 right-6 z-30 font-mono text-[10px] tracking-[0.2em] uppercase"
        style={{ color: "hsl(0 0% 100% / 0.18)", fontFamily: "'JetBrains Mono', monospace" }}
      >
        Van Gelder Co.
      </span>

      {/* Corner brackets */}
      <svg className="fixed top-4 left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1">
        <path d="M1 8V1h7" />
      </svg>
      <svg className="fixed top-4 right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1">
        <path d="M23 8V1h-7" />
      </svg>
      <svg className="fixed bottom-4 left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1">
        <path d="M1 16v7h7" />
      </svg>
      <svg className="fixed bottom-4 right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1">
        <path d="M23 16v7h-7" />
      </svg>

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

        {/* Hero lines */}
        <h1 className="flex flex-col gap-2 md:gap-3">
          {HERO_LINES.map((line, i) => (
            <span
              key={i}
              className="text-[22px] md:text-[44px] lg:text-[48px] font-medium leading-[1.15]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "hsl(0 0% 100% / 0.9)",
                animation: `clip-reveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.8 + i * 0.4}s both`,
              }}
            >
              {line}
            </span>
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
  );
};

export default Index;
