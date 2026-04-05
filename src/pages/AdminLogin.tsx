import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (signUpError) throw signUpError;
        setSignUpSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate("/admin");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 2.5%)" }}>
        <div className="w-full max-w-xs space-y-4 text-center">
          <div className="text-[10px] uppercase tracking-[0.15em]" style={{ ...mono, color: "hsl(0 80% 48%)" }}>
            Check your email
          </div>
          <p className="text-xs" style={{ ...mono, color: "hsl(0 0% 100% / 0.4)" }}>
            A confirmation link has been sent to <span style={{ color: "hsl(0 0% 100% / 0.7)" }}>{email}</span>. Verify your email to sign in.
          </p>
          <button
            onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}
            className="text-[10px] uppercase tracking-[0.1em] transition-colors hover:opacity-70"
            style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 2.5%)" }}>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-sm font-medium tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.8)" }}>
            Content Manager
          </h1>
          <p className="text-[10px] uppercase tracking-[0.15em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>
            {isSignUp ? "Create account" : "Sign in"}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2.5 text-xs bg-transparent outline-none rounded-lg"
            style={{ ...mono, color: "hsl(0 0% 100% / 0.7)", border: "1px solid hsl(0 0% 12%)", background: "hsl(0 0% 3%)" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-3 py-2.5 text-xs bg-transparent outline-none rounded-lg"
            style={{ ...mono, color: "hsl(0 0% 100% / 0.7)", border: "1px solid hsl(0 0% 12%)", background: "hsl(0 0% 3%)" }}
          />
        </div>

        {error && (
          <p className="text-[10px]" style={{ ...mono, color: "hsl(0 80% 48%)" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 text-xs transition-all rounded disabled:opacity-50"
          style={{ ...mono, background: "hsl(0 80% 48%)", color: "hsl(0 0% 100%)" }}
        >
          {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
          className="w-full text-[10px] uppercase tracking-[0.1em] transition-colors hover:opacity-70"
          style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}
        >
          {isSignUp ? "Already have an account? Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
