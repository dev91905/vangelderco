import { ReactNode, forwardRef, useEffect, useRef } from "react";

type FrameMode = "narrow" | "wide" | "full";
type FrameAlign = "center" | "left" | "split";
type MobileVerticalAlign = "top" | "center";

interface DeckFrameProps {
  children: ReactNode;
  label?: string;
  mode?: FrameMode;
  align?: FrameAlign;
  onActive?: (active: boolean) => void;
  /** Mobile-only: whether this frame is the current visible frame */
  isVisible?: boolean;
  /** Whether the viewport is mobile */
  isMobile?: boolean;
  /** Mobile-only vertical alignment */
  mobileVerticalAlign?: MobileVerticalAlign;
}

const modeStyles: Record<FrameMode, string> = {
  narrow: "max-w-[720px] px-5 md:px-16",
  wide: "max-w-[1280px] px-5 md:px-20 lg:px-28",
  full: "w-full px-5 md:px-16 lg:px-24",
};

const alignStyles: Record<FrameAlign, string> = {
  center: "items-center justify-center",
  left: "items-start justify-center",
  split: "items-center justify-center",
};

const DiagnosticFrame = forwardRef<HTMLDivElement, DeckFrameProps>(
  (
    {
      children,
      mode = "narrow",
      align = "center",
      onActive,
      isVisible,
      isMobile,
      mobileVerticalAlign = "top",
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const setRefs = (el: HTMLDivElement | null) => {
      (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    useEffect(() => {
      if (!isMobile || !isVisible || !scrollRef.current) return;
      scrollRef.current.scrollTop = 0;
    }, [isMobile, isVisible]);

    useEffect(() => {
      if (isMobile) return;
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
    }, [onActive, isMobile]);

    useEffect(() => {
      if (!isMobile) return;
      onActive?.(!!isVisible);
    }, [isMobile, isVisible, onActive]);

    if (isMobile) {
      return (
        <section
          ref={setRefs}
          className="diagnostic-mobile-frame"
          style={{
            position: "absolute",
            inset: 0,
            display: isVisible ? "flex" : "none",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            ref={scrollRef}
            className={`diagnostic-mobile-content relative z-10 w-full ${modeStyles[mode]} mx-auto`}
            style={{
              flex: "1 1 0%",
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch" as any,
              overscrollBehaviorY: "contain",
              display: "flex",
              flexDirection: "column",
              paddingTop: "88px",
              paddingBottom: "100px",
              justifyContent: mobileVerticalAlign === "center" ? "center" : "flex-start",
              alignItems: align === "left" ? "flex-start" : "center",
            }}
          >
            <div className="w-full">{children}</div>
          </div>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
            style={{
              height: "120px",
              background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
            }}
          />
        </section>
      );
    }

    return (
      <section
        ref={setRefs}
        className={`relative flex ${alignStyles[align]}`}
        style={{
          minHeight: "100dvh",
          width: "100%",
          flexShrink: 0,
          scrollSnapAlign: "start",
        }}
      >
        <div
          className={`relative z-10 w-full ${modeStyles[mode]}`}
          style={{
            paddingTop: "clamp(64px, 9vh, 128px)",
            paddingBottom: "calc(clamp(108px, 15vh, 176px) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {children}
        </div>
      </section>
    );
  }
);

DiagnosticFrame.displayName = "DiagnosticFrame";

export default DiagnosticFrame;
