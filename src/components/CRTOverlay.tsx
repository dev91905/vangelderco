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
          animation: "scan-beam 13s linear infinite",
        }}
        aria-hidden="true"
      />

    </>
  );
};

export default CRTOverlay;
