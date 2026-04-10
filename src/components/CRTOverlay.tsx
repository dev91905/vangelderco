import { useDarkMode } from "@/contexts/DarkModeContext";

const CRTOverlay = () => {
  const { isDark } = useDarkMode();
  if (!isDark) return null;

  return (
    <>
      {/* Scan lines — white lines, 3px pitch, covers full viewport with bleed */}
      <div
        className="pointer-events-none fixed z-[1]"
        style={{
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 100%) 2px, hsl(0 0% 100%) 3px)",
          opacity: 0.03,
        }}
        aria-hidden="true"
      />

      {/* Scan beam — 1px white line sweeping vertically */}
      <div
        className="pointer-events-none fixed left-0 z-20 w-full"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.06) 20%, hsl(0 0% 100% / 0.06) 80%, transparent 100%)",
          animation: "scan-beam 7s linear infinite",
        }}
        aria-hidden="true"
      />

      {/* Breathing red glow — centered, subtle */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vh, 600px)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, hsl(0 80% 48% / 0.18) 0%, hsl(0 80% 48% / 0.10) 30%, hsl(0 80% 48% / 0.03) 55%, transparent 80%)",
          animation: "breathe 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default CRTOverlay;
