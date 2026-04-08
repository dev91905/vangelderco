import { ReactNode, forwardRef, useEffect, useRef, useState } from "react";

type FrameMode = "narrow" | "wide" | "full";
type FrameAlign = "center" | "left" | "split";

interface DeckFrameProps {
  children: ReactNode;
  label?: string;
  mode?: FrameMode;
  align?: FrameAlign;
  onActive?: (active: boolean) => void;
}

const modeStyles: Record<FrameMode, string> = {
  narrow: "max-w-[720px] px-8 md:px-16",
  wide: "max-w-[1400px] px-8 md:px-20 lg:px-28",
  full: "w-full px-8 md:px-16 lg:px-24",
};

const alignStyles: Record<FrameAlign, string> = {
  center: "items-center justify-center",
  left: "items-start justify-center",
  split: "items-center justify-center",
};

const DeckFrame = forwardRef<HTMLDivElement, DeckFrameProps>(
  ({ children, mode = "narrow", align = "center", onActive }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

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
          onActive?.(entry.isIntersecting);
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, [onActive]);

    return (
      <section
        ref={setRefs}
        className={`relative flex ${alignStyles[align]}`}
        style={{
          height: "100dvh",
          width: "100vw",
          minWidth: "100vw",
          flexShrink: 0,
          scrollSnapAlign: "start",
          minHeight: "100dvh",
        }}
      >
        <div className={`relative z-10 w-full ${modeStyles[mode]}`}>
          {children}
        </div>
      </section>
    );
  }
);

DeckFrame.displayName = "DeckFrame";

export default DeckFrame;
