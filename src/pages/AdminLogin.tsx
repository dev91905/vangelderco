import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: "hsl(0 0% 2.5%)" }}>
      <Link
        to="/"
        className="fixed top-4 left-4 md:left-8 z-30 flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] rounded-sm transition-all duration-300"
        style={{ ...mono, color: "hsl(0 0% 100% / 0.3)", border: "1px solid hsl(0 0% 100% / 0.06)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 80% 48% / 0.9)"; e.currentTarget.style.borderColor = "hsl(0 80% 48% / 0.3)"; e.currentTarget.style.background = "hsl(0 0% 6%)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(0 0% 100% / 0.3)"; e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.06)"; e.currentTarget.style.background = "transparent"; }}
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Site
      </Link>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-sm font-medium tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.8)" }}>
            Content Manager
          </h1>
          <p className="text-[10px] uppercase tracking-[0.15em]" style={{ ...mono, color: "hsl(0 0% 100% / 0.25)" }}>
            Sign in
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
          {loading ? "..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
