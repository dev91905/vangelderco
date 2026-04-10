import { useEffect, useRef, useState, useCallback, CSSProperties } from "react";

export type RevealVariant = "fade-up" | "blur-up" | "scale" | "slide-left" | "slide-right" | "clip-up" | "blur-scale";

const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Tracks when a frame enters the viewport and provides
 * staggered reveal helpers for child elements.
 */
export function useFrameReveal(threshold = 0.45) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const hasBeenActive = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true);
          hasBeenActive.current = true;
        } else {
          setIsActive(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  /**
   * Returns inline styles for a staggered reveal.
   * @param index — ordering index (0-based)
   * @param baseDelay — ms before the first element starts
   * @param variant — animation style
   */
  const stagger = useCallback(
    (index: number, baseDelay = 0, variant: RevealVariant = "fade-up"): CSSProperties => {
      const delay = baseDelay + index * 120;
      const show = isActive || hasBeenActive.current;
      const dur = variant === "blur-scale" ? "0.9s" : "0.7s";

      const base: CSSProperties = {
        opacity: show ? 1 : 0,
        transition: `opacity ${dur} ${EASING} ${delay}ms, transform ${dur} ${EASING} ${delay}ms, filter ${dur} ${EASING} ${delay}ms`,
      };

      switch (variant) {
        case "blur-up":
          return {
            ...base,
            transform: show ? "translateY(0)" : "translateY(24px)",
            filter: show ? "blur(0px)" : "blur(8px)",
          };
        case "blur-scale":
          return {
            ...base,
            transform: show ? "scale(1) translateY(0)" : "scale(0.95) translateY(12px)",
            filter: show ? "blur(0px)" : "blur(6px)",
          };
        case "scale":
          return {
            ...base,
            transform: show ? "scale(1)" : "scale(0.92)",
          };
        case "slide-left":
          return {
            ...base,
            transform: show ? "translateX(0)" : "translateX(40px)",
            filter: show ? "blur(0px)" : "blur(4px)",
          };
        case "slide-right":
          return {
            ...base,
            transform: show ? "translateX(0)" : "translateX(-40px)",
            filter: show ? "blur(0px)" : "blur(4px)",
          };
        case "clip-up":
          return {
            ...base,
            transform: show ? "translateY(0)" : "translateY(30px)",
            clipPath: show ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          };
        case "fade-up":
        default:
          return {
            ...base,
            transform: show ? "translateY(0)" : "translateY(18px)",
          };
      }
    },
    [isActive]
  );

  /**
   * Returns styles for a horizontal line "draw" animation.
   */
  const lineDraw = useCallback(
    (delayMs = 0, width = "40px"): CSSProperties => {
      const show = isActive || hasBeenActive.current;
      return {
        width,
        height: "1px",
        background: `hsl(var(--foreground) / 0.1)`,
        transform: show ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left center",
        transition: `transform 0.8s ${EASING} ${delayMs}ms`,
      };
    },
    [isActive]
  );

  return { ref, isActive, stagger, lineDraw };
}
