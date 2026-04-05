import { ReactNode } from "react";

interface AtmosphericLayoutProps {
  children: ReactNode;
}

const AtmosphericLayout = ({ children }: AtmosphericLayoutProps) => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* Breathing red glow */}
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
      />



      {children}
    </div>
  );
};

export default AtmosphericLayout;
