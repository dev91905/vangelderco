import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/theme";

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
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: t.cream }}>
      <Link to="/" className="fixed top-4 left-4 md:left-8 z-30 flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full transition-all duration-300"
        style={{ fontFamily: t.sans, color: t.ink(0.4), border: t.border(0.1) }}
        onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.8); e.currentTarget.style.background = t.white; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}>
        <ArrowLeft className="w-3 h-3" /> Back to Site
      </Link>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-medium tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>Content Manager</h1>
          <p className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>Sign in</p>
        </div>
        <div className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
            className="w-full px-4 py-3 text-sm bg-transparent outline-none rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.1), background: t.white }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
            className="w-full px-4 py-3 text-sm bg-transparent outline-none rounded-xl" style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.1), background: t.white }} />
        </div>
        {error && <p className="text-sm" style={{ fontFamily: t.sans, color: t.error() }}>{error}</p>}
        <button type="submit" disabled={loading} className="w-full px-4 py-3 text-sm transition-all rounded-full disabled:opacity-50" style={{ fontFamily: t.sans, background: t.ink(1), color: t.cream }}>
          {loading ? "..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
