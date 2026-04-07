import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AtmosphericLayoutProps {
  children: ReactNode;
}

const AtmosphericLayout = ({ children }: AtmosphericLayoutProps) => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* Breathing gold glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0"
        style={{
          width: "min(80vw, 700px)",
          height: "min(80vh, 600px)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, hsl(40 50% 57% / 0.14) 0%, hsl(40 50% 57% / 0.07) 30%, hsl(40 50% 57% / 0.02) 55%, transparent 80%)",
          animation: "breathe 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
      />

      <Link
        to="/admin"
        className="fixed bottom-6 right-6 z-30"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "hsl(0 0% 100% / 0.18)",
          transition: "color 300ms",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(40 50% 57% / 0.9)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 100% / 0.18)")}
      >
        Admin
      </Link>

      {children}
    </div>
  );
};

export default AtmosphericLayout;
