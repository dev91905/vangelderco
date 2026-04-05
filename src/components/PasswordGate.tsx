import { useState } from "react";

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
    // Parent handles validation via onUnlock check
    // We pass the password up through a custom event pattern
    const event = new CustomEvent("password-attempt", { detail: password });
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "hsl(0 0% 2.5%)" }}>
      {/* Blurred hero background */}
      {heroImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "blur(40px) brightness(0.15)", transform: "scale(1.2)" }}
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        {/* Title */}
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tight text-center leading-tight"
          style={{ ...grotesk, color: "hsl(0 0% 100% / 0.85)" }}
        >
          {title}
        </h1>

        {/* Lock indicator */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ border: "1px solid hsl(0 80% 48% / 0.3)", background: "hsl(0 80% 48% / 0.06)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(0 80% 48% / 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ ...mono, color: "hsl(0 0% 100% / 0.2)" }}>
            Protected Content
          </span>
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <div
            className={`w-full transition-transform ${shake ? "animate-shake" : ""}`}
            onAnimationEnd={() => setShake(false)}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 text-sm bg-transparent outline-none text-center"
              style={{
                ...mono,
                color: "hsl(0 0% 100% / 0.8)",
                border: `1px solid ${error ? "hsl(0 80% 48% / 0.5)" : "hsl(0 0% 15%)"}`,
                background: "hsl(0 0% 4%)",
              }}
            />
          </div>
          {error && (
            <span className="text-[10px]" style={{ ...mono, color: "hsl(0 80% 48% / 0.7)" }}>
              Incorrect password
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 text-xs tracking-[0.1em] uppercase transition-all"
            style={{
              ...mono,
              background: password ? "hsl(0 80% 48%)" : "transparent",
              color: password ? "hsl(0 0% 100%)" : "hsl(0 80% 48% / 0.5)",
              border: password ? "1px solid hsl(0 80% 48%)" : "1px solid hsl(0 80% 48% / 0.3)",
            }}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

// Export a simpler version that handles the check internally
export interface PasswordGateWrapperProps {
  postPassword: string | null;
  globalPassword: string | null;
  slug: string;
  title: string;
  heroImageUrl: string | null;
  capability: string;
  children: React.ReactNode;
}

export const PasswordGateWrapper = ({
  postPassword,
  globalPassword,
  slug,
  title,
  heroImageUrl,
  children,
}: PasswordGateWrapperProps) => {
  const effectivePassword = postPassword || globalPassword;
  const sessionKey = postPassword ? `gate:${slug}` : "gate:global";
  
  const [unlocked, setUnlocked] = useState(() => {
    if (!effectivePassword) return true;
    return sessionStorage.getItem(sessionKey) === "1";
  });
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [password, setPassword] = useState("");

  if (unlocked || !effectivePassword) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === effectivePassword) {
      sessionStorage.setItem(sessionKey, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setPassword("");
    }
  };

  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

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
        <button
          onClick={() => window.history.back()}
          className="text-[10px] tracking-[0.15em] uppercase transition-colors hover:opacity-60"
          style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}
          type="button"
        >
          ← Go back
        </button>
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

export default PasswordGate;
