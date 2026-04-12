import { useState } from "react";
import { useGoBack } from "@/hooks/useBackNavigation";
import { supabase } from "@/integrations/supabase/client";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";

interface PasswordGateProps {
  title: string;
  heroImageUrl: string | null;
  onUnlock: () => void;
}

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: t.cream }}>
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center leading-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>
          {title}
        </h1>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: t.border(0.1), background: t.ink(0.03) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.ink(0.4)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Protected Content</span>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className={`w-full transition-transform ${shake ? "animate-shake" : ""}`} onAnimationEnd={() => setShake(false)}>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password" autoFocus
              className="w-full px-4 py-3 text-sm bg-transparent outline-none text-center rounded-xl"
              style={{ fontFamily: t.sans, color: t.ink(0.8), border: `1px solid ${error ? t.error(0.3) : t.ink(0.1)}`, background: t.white }} />
          </div>
          {error && <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.error(0.7) }}>Incorrect password</span>}
          <button type="submit" className="px-6 py-2.5 text-sm transition-all rounded-full"
            style={{ fontFamily: t.sans, background: password ? t.ink(1) : "transparent", color: password ? t.cream : t.ink(0.4), border: password ? `1px solid ${t.ink(1)}` : t.border(0.15) }}>
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export interface PasswordGateWrapperProps {
  slug: string; title: string; heroImageUrl: string | null; capability: string; requiresPassword: boolean; onUnlock?: () => void; children: React.ReactNode;
}

export const PasswordGateWrapper = ({ slug, title, heroImageUrl, capability, requiresPassword, onUnlock: onUnlockProp, children }: PasswordGateWrapperProps) => {
  const goBack = useGoBack(capabilityRoute[capability] || "/");
  const sessionKey = `gate:${slug}`;
  const [unlocked, setUnlocked] = useState(() => !requiresPassword ? true : sessionStorage.getItem(sessionKey) === "1");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { playClickGlitch, playUnlockSuccess } = useGlitchSFX();

  if (unlocked || !requiresPassword) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    if (!password.trim()) { playClickGlitch(); setError(true); setShake(true); return; }
    setVerifying(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-post-password", { body: { slug, password } });
      if (fnError) throw fnError;
      if (data?.valid) { playUnlockSuccess(); sessionStorage.setItem(sessionKey, "1"); setUnlocked(true); onUnlockProp?.(); }
      else { playClickGlitch(); setError(true); setShake(true); setPassword(""); }
    } catch { playClickGlitch(); setError(true); setShake(true); setPassword(""); }
    finally { setVerifying(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto" style={{ background: t.cream }}>
      <button onClick={goBack} className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[60] text-[13px] transition-colors duration-300 bg-transparent border-none cursor-pointer"
        style={{ fontFamily: t.sans, color: t.ink(0.35) }}
        onMouseEnter={(e) => (e.currentTarget.style.color = t.ink(0.8))} onMouseLeave={(e) => (e.currentTarget.style.color = t.ink(0.35))}>
        ← Back
      </button>
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-5 sm:px-6 py-8 max-w-sm sm:max-w-md w-full max-h-screen">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-center leading-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>{title}</h1>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: t.border(0.1), background: t.ink(0.03) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.ink(0.4)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Protected Content</span>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div className={`w-full transition-transform ${shake ? "animate-shake" : ""}`} onAnimationEnd={() => setShake(false)}>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password" autoFocus
              className="w-full px-4 py-3 text-sm bg-transparent outline-none text-center rounded-xl"
              style={{ fontFamily: t.sans, color: t.ink(0.8), border: `1px solid ${error ? t.error(0.3) : t.ink(0.1)}`, background: t.white }} />
          </div>
          {error && <span className="text-[12px]" style={{ fontFamily: t.sans, color: t.error(0.7) }}>Incorrect password</span>}
          <button type="submit" disabled={verifying} className="px-6 py-3 text-sm transition-all rounded-full"
            style={{ fontFamily: t.sans, background: password ? t.ink(1) : "transparent", color: password ? t.cream : t.ink(0.4), border: password ? `1px solid ${t.ink(1)}` : t.border(0.15), opacity: verifying ? 0.5 : 1 }}>
            {verifying ? "Verifying..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
