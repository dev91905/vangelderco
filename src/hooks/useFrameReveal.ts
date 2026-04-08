import { useEffect, useRef, useState, useCallback, CSSProperties } from "react";

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
          // Only deactivate if scrolling away significantly
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
   */
  const stagger = useCallback(
    (index: number, baseDelay = 0): CSSProperties => {
      const delay = baseDelay + index * 150;
      const show = isActive || hasBeenActive.current;
      return {
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
      };
    },
    [isActive]
  );

  return { ref, isActive, stagger };
}
