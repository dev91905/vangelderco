import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Returns the referrer path passed via router state, or a fallback.
 * Usage: navigate("/target", { state: { from: location.pathname } })
 */
export function useBackPath(fallback = "/"): string {
  const location = useLocation();
  return (location.state as { from?: string })?.from || fallback;
}

/**
 * Returns a click handler that navigates back using browser history
 * (preserving scroll position) when the user came from within the app,
 * or falls back to a forward navigation to the given path.
 */
export function useGoBack(fallback = "/"): () => void {
  const location = useLocation();
  const navigate = useNavigate();
  const hasReferrer = !!(location.state as { from?: string })?.from;

  return useCallback(() => {
    if (hasReferrer) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [hasReferrer, navigate, fallback]);
}
