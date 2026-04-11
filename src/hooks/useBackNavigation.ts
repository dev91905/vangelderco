import { useLocation } from "react-router-dom";

/**
 * Returns the referrer path passed via router state, or a fallback.
 * Usage: navigate("/target", { state: { from: location.pathname } })
 */
export function useBackPath(fallback = "/"): string {
  const location = useLocation();
  return (location.state as { from?: string })?.from || fallback;
}
