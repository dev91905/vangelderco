import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";

const DarkModeToggle = () => {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 left-6 z-30 p-2 rounded-full transition-colors duration-300"
      style={{
        background: isDark ? "hsla(0,0%,100%,0.06)" : "hsla(30,10%,12%,0.05)",
        color: isDark ? "hsla(0,0%,100%,0.5)" : "hsla(30,10%,12%,0.35)",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark
          ? "hsla(0,0%,100%,0.12)"
          : "hsla(30,10%,12%,0.1)";
        e.currentTarget.style.color = isDark
          ? "hsla(0,0%,100%,0.8)"
          : "hsla(30,10%,12%,0.7)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark
          ? "hsla(0,0%,100%,0.06)"
          : "hsla(30,10%,12%,0.05)";
        e.currentTarget.style.color = isDark
          ? "hsla(0,0%,100%,0.5)"
          : "hsla(30,10%,12%,0.35)";
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default DarkModeToggle;
