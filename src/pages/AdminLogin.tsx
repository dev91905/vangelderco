import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

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
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: "hsl(40 30% 96%)" }}>
      <Link
        to="/"
        className="fixed top-4 left-4 md:left-8 z-30 flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full transition-all duration-300"
        style={{ ...label, color: "hsl(30 10% 12% / 0.4)", border: "1px solid hsl(30 10% 12% / 0.1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(30 10% 12% / 0.8)"; e.currentTarget.style.borderColor = "hsl(30 10% 12% / 0.2)"; e.currentTarget.style.background = "hsl(0 0% 100%)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(30 10% 12% / 0.4)"; e.currentTarget.style.borderColor = "hsl(30 10% 12% / 0.1)"; e.currentTarget.style.background = "transparent"; }}
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Site
      </Link>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-medium tracking-tight" style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(30 10% 12% / 0.85)" }}>
            Content Manager
          </h1>
          <p className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
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
            className="w-full px-4 py-3 text-sm bg-transparent outline-none rounded-xl"
            style={{ ...label, color: "hsl(30 10% 12% / 0.8)", border: "1px solid hsl(30 10% 12% / 0.1)", background: "hsl(0 0% 100%)" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-3 text-sm bg-transparent outline-none rounded-xl"
            style={{ ...label, color: "hsl(30 10% 12% / 0.8)", border: "1px solid hsl(30 10% 12% / 0.1)", background: "hsl(0 0% 100%)" }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ ...label, color: "hsl(0 60% 45%)" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm transition-all rounded-full disabled:opacity-50"
          style={{ ...label, background: "hsl(30 10% 12%)", color: "hsl(40 30% 96%)" }}
        >
          {loading ? "..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
