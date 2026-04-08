import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AtmosphericLayoutProps {
  children: ReactNode;
}

const AtmosphericLayout = ({ children }: AtmosphericLayoutProps) => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <Link
        to="/admin"
        className="fixed bottom-6 right-6 z-30"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "hsl(30 10% 12% / 0.12)",
          transition: "color 300ms",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(30 10% 12% / 0.5)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(30 10% 12% / 0.12)")}
      >
        Admin
      </Link>

      {children}
    </div>
  );
};

export default AtmosphericLayout;
