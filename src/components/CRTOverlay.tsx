import { useDarkMode } from "@/contexts/DarkModeContext";

const CRTOverlay = () => {
  const { isDark } = useDarkMode();
  if (!isDark) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none" aria-hidden="true">
      {/* Scan lines */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
        }}
      />

      {/* Scan beam */}
      <div
        className="absolute left-0 right-0 crt-scan-beam"
        style={{
          height: "120px",
          background:
            "linear-gradient(180deg, transparent 0%, hsla(0,80%,48%,0.04) 40%, hsla(0,80%,48%,0.07) 50%, hsla(0,80%,48%,0.04) 60%, transparent 100%)",
          animation: "crt-scan-beam 8s linear infinite",
        }}
      />

      {/* Breathing red glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, hsla(0,80%,48%,0.06) 0%, transparent 70%)",
          animation: "crt-breathe 8s ease-in-out infinite",
        }}
      />
    </div>
  );
};

export default CRTOverlay;
