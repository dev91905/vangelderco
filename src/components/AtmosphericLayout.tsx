import { ReactNode } from "react";

interface AtmosphericLayoutProps {
  children: ReactNode;
}

const AtmosphericLayout = ({ children }: AtmosphericLayoutProps) => {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.6) 100%)",
        }}
      />

      {/* Scan beam */}
      <div
        className="pointer-events-none fixed left-0 z-20 w-full"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.06) 20%, hsl(0 0% 100% / 0.06) 80%, transparent 100%)",
          animation: "scan-beam 7s linear infinite",
          position: "fixed",
        }}
      />

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

      {children}
    </div>
  );
};

export default AtmosphericLayout;
