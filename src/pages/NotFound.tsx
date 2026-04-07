import { Link } from "react-router-dom";
import AtmosphericLayout from "@/components/AtmosphericLayout";

const NotFound = () => {
  return (
    <AtmosphericLayout>
      <div className="flex items-center justify-center h-full w-full">
        <span
          className="hidden sm:block fixed top-6 right-6 z-30 text-[10px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.18)" }}
        >
          Van Gelder Co.
        </span>

        <main className="relative z-20 flex flex-col items-center text-center px-6 gap-6">
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 80% 48% / 0.7)",
              animation: "fade-up 0.5s ease-out 0.2s both",
            }}
          >
            Signal Lost
          </span>

          <h1
            className="text-[48px] md:text-[72px] font-medium leading-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "hsl(0 0% 100% / 0.12)",
              animation: "fade-up 0.5s ease-out 0.3s both",
            }}
          >
            404
          </h1>

          <p
            className="text-[11px] tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 0% 100% / 0.3)",
              animation: "fade-up 0.5s ease-out 0.5s both",
            }}
          >
            Route not found
          </p>

          <Link
            to="/"
            className="text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 mt-4"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 0% 100% / 0.3)",
              animation: "fade-up 0.5s ease-out 0.7s both",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 100% / 0.3)")}
          >
            &lt; Return
          </Link>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default NotFound;
