import { Link } from "react-router-dom";
import AtmosphericLayout from "@/components/AtmosphericLayout";

const NotFound = () => {
  return (
    <AtmosphericLayout>
      <div className="flex items-center justify-center h-full w-full">
        <main className="relative z-20 flex flex-col items-center text-center px-6 gap-6">
          <h1
            className="text-[72px] md:text-[120px] font-medium leading-none"
            style={{
              fontFamily: "'Instrument Serif', serif",
              color: "hsl(30 10% 12% / 0.08)",
              animation: "fade-up 0.5s ease-out 0.3s both",
            }}
          >
            404
          </h1>

          <p
            className="text-[14px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(30 10% 12% / 0.35)",
              animation: "fade-up 0.5s ease-out 0.5s both",
            }}
          >
            Page not found
          </p>

          <Link
            to="/"
            className="text-[13px] transition-colors duration-300 mt-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "hsl(30 10% 12% / 0.35)",
              animation: "fade-up 0.5s ease-out 0.7s both",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(30 10% 12% / 0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(30 10% 12% / 0.35)")}
          >
            ← Return home
          </Link>
        </main>
      </div>
    </AtmosphericLayout>
  );
};

export default NotFound;
