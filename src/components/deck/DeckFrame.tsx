import { ReactNode, forwardRef, useEffect, useRef, useState } from "react";

interface DeckFrameProps {
  children: ReactNode;
  label?: string;
  onActive?: (active: boolean) => void;
}

const DeckFrame = forwardRef<HTMLDivElement, DeckFrameProps>(
  ({ children, label, onActive }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);

    // Merge forwarded ref with internal ref
    const setRefs = (el: HTMLDivElement | null) => {
      (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          const active = entry.isIntersecting;
          setIsActive(active);
          onActive?.(active);
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, [onActive]);

    return (
      <section
        ref={setRefs}
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
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(0 0% 100% / 0.2)",
              opacity: isActive ? 1 : 0,
              transform: isActive ? "translateX(0)" : "translateX(-8px)",
              transition: "opacity 0.5s ease 200ms, transform 0.5s ease 200ms",
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
