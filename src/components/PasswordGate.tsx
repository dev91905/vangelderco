import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";

interface PasswordGateProps {
  title: string;
  heroImageUrl: string | null;
  onUnlock: () => void;
}

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

const PasswordGate = ({ title, heroImageUrl, onUnlock }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event = new CustomEvent("password-attempt", { detail: password });
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "hsl(0 0% 2.5%)" }}>
      
      {heroImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImageUrl} alt="" className="w-full h-full object-cover" style={{ filter: "blur(40px) brightness(0.15)", transform: "scale(1.2)" }} />
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center leading-tight" style={{ ...grotesk, color: "hsl(0 0% 100% / 0.85)" }}>
          {title}
        </h1>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "1px solid hsl(0 80% 48% / 0.3)", background: "hsl(0 80% 48% / 0.06)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(0 80% 48% / 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ ...mono, color: "hsl(0 0% 100% / 0.2)" }}>Protected Content</span>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className={`w-full transition-transform ${shake ? "animate-shake" : ""}`} onAnimationEnd={() => setShake(false)}>
            <input
              type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password" autoFocus
              className="w-full px-4 py-3 text-sm bg-transparent outline-none text-center"
              style={{ ...mono, color: "hsl(0 0% 100% / 0.8)", border: `1px solid ${error ? "hsl(0 80% 48% / 0.5)" : "hsl(0 0% 15%)"}`, background: "hsl(0 0% 4%)" }}
            />
          </div>
          {error && <span className="text-[10px]" style={{ ...mono, color: "hsl(0 80% 48% / 0.7)" }}>Incorrect password</span>}
          <button type="submit" className="px-6 py-2.5 text-xs tracking-[0.1em] uppercase transition-all"
            style={{ ...mono, background: password ? "hsl(0 80% 48%)" : "transparent", color: password ? "hsl(0 0% 100%)" : "hsl(0 80% 48% / 0.5)", border: password ? "1px solid hsl(0 80% 48%)" : "1px solid hsl(0 80% 48% / 0.3)" }}>
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export interface PasswordGateWrapperProps {
  slug: string;
  title: string;
  heroImageUrl: string | null;
  capability: string;
  requiresPassword: boolean;
  onUnlock?: () => void;
  children: React.ReactNode;
}

export const PasswordGateWrapper = ({
  slug,
  title,
  heroImageUrl,
  capability,
  requiresPassword,
  onUnlock: onUnlockProp,
  children,
}: PasswordGateWrapperProps) => {
  const capabilityRoute: Record<string, string> = {
    "cultural-strategy": "/cultural-strategy",
    "cross-sector": "/cross-sector",
    "deep-organizing": "/deep-organizing",
  };

  const sessionKey = `gate:${slug}`;
  
  const [unlocked, setUnlocked] = useState(() => {
    if (!requiresPassword) return true;
    return sessionStorage.getItem(sessionKey) === "1";
  });
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  if (unlocked || !requiresPassword) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    setVerifying(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-post-password", {
        body: { slug, password },
      });

      if (fnError) throw fnError;

      if (data?.valid) {
        sessionStorage.setItem(sessionKey, "1");
        setUnlocked(true);
        onUnlockProp?.();
      } else {
        setError(true);
        setShake(true);
        setPassword("");
      }
    } catch {
      setError(true);
      setShake(true);
      setPassword("");
    } finally {
      setVerifying(false);
    }
  };

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto" style={{ background: "hsl(0 0% 2.5%)" }}>
      {heroImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImageUrl} alt="" className="w-full h-full object-cover" style={{ filter: "blur(40px) brightness(0.15)", transform: "scale(1.2)" }} />
        </div>
      )}

      {/* Breathing red glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0" style={{ width: "min(80vw, 700px)", height: "min(80vh, 600px)", borderRadius: "50%", background: "radial-gradient(ellipse at center, hsl(0 80% 48% / 0.18) 0%, hsl(0 80% 48% / 0.10) 30%, hsl(0 80% 48% / 0.03) 55%, transparent 80%)", animation: "breathe 8s ease-in-out infinite", transform: "translate(-50%, -50%)" }} />
      {/* Scan beam */}
      <div className="pointer-events-none fixed left-0 z-20 w-full" style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.06) 20%, hsl(0 0% 100% / 0.06) 80%, transparent 100%)", animation: "scan-beam 7s linear infinite", position: "fixed" }} />

      {/* Corner brackets */}
      <svg className="fixed top-3 left-3 sm:top-4 sm:left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M1 8V1h7" /></svg>
      <svg className="fixed top-3 right-3 sm:top-4 sm:right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M23 8V1h-7" /></svg>
      <svg className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M1 16v7h7" /></svg>
      <svg className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 opacity-[0.12]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="1"><path d="M23 16v7h-7" /></svg>

      {/* HUD */}
      <span className="hidden sm:block fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] text-[10px] tracking-[0.2em] uppercase" style={{ ...mono, color: "hsl(0 0% 100% / 0.18)" }}>Van Gelder Co.</span>

      {/* Back */}
      <Link
        to={capabilityRoute[capability] || "/"}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[60] text-[10px] tracking-[0.2em] uppercase transition-colors duration-300"
        style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 100% / 0.3)")}
      >
        &lt; Return
      </Link>

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-5 sm:px-6 py-8 max-w-sm sm:max-w-md w-full max-h-screen">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-center leading-tight" style={{ ...grotesk, color: "hsl(0 0% 100% / 0.85)" }}>{title}</h1>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center" style={{ border: "1px solid hsl(0 80% 48% / 0.3)", background: "hsl(0 80% 48% / 0.06)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(0 80% 48% / 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ ...mono, color: "hsl(0 0% 100% / 0.2)" }}>Protected Content</span>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className={`w-full transition-transform ${shake ? "animate-shake" : ""}`} onAnimationEnd={() => setShake(false)}>
            <input
              type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password" autoFocus
              className="w-full px-4 py-3 text-sm bg-transparent outline-none text-center"
              style={{ ...mono, color: "hsl(0 0% 100% / 0.8)", border: `1px solid ${error ? "hsl(0 80% 48% / 0.5)" : "hsl(0 0% 15%)"}`, background: "hsl(0 0% 4%)" }}
            />
          </div>
          {error && <span className="text-[10px]" style={{ ...mono, color: "hsl(0 80% 48% / 0.7)" }}>Incorrect password</span>}
          <button type="submit" disabled={verifying} className="px-6 py-3 text-xs tracking-[0.1em] uppercase transition-all"
            style={{ ...mono, background: password ? "hsl(0 80% 48%)" : "transparent", color: password ? "hsl(0 0% 100%)" : "hsl(0 80% 48% / 0.5)", border: password ? "1px solid hsl(0 80% 48%)" : "1px solid hsl(0 80% 48% / 0.3)", opacity: verifying ? 0.5 : 1 }}>
            {verifying ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
