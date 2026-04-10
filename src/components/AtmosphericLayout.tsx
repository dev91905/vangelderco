import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { t } from "@/lib/theme";

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
          fontFamily: t.sans,
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: t.ink(0.12),
          transition: "color 300ms",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.5))}
        onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.12))}
      >
        Admin
      </Link>

      {children}
    </div>
  );
};

export default AtmosphericLayout;
