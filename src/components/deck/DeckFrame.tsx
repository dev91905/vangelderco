import { ReactNode, forwardRef } from "react";

interface DeckFrameProps {
  children: ReactNode;
  label?: string;
}

const DeckFrame = forwardRef<HTMLDivElement, DeckFrameProps>(
  ({ children, label }, ref) => {
    return (
      <section
        ref={ref}
        className="relative flex items-center justify-center"
        style={{
          height: "100dvh",
          width: "100%",
          scrollSnapAlign: "start",
          minHeight: "100dvh",
        }}
      >
        {/* Frame label */}
        {label && (
          <span
            className="absolute top-8 left-8 z-10"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.2)",
            }}
          >
            {label}
          </span>
        )}

        <div className="relative z-10 w-full max-w-[900px] px-8 md:px-12">
          {children}
        </div>
      </section>
    );
  }
);

DeckFrame.displayName = "DeckFrame";

export default DeckFrame;
