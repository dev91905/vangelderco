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
      <Link to="/" className="fixed top-4 left-4 md:left-8 z-30 flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.05em] rounded-full transition-all duration-300"
        style={{ fontFamily: t.sans, color: t.ink(0.35), border: t.border(0.08) }}
        onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.7); e.currentTarget.style.background = t.ink(0.03); }}
        onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.35); e.currentTarget.style.background = "transparent"; }}>
        <ArrowLeft className="w-3 h-3" /> Back to Site
      </Link>

      <div
        className="w-full max-w-[340px] rounded-2xl overflow-hidden"
        style={{ background: t.white, border: t.border(0.06), boxShadow: `0 16px 40px -12px ${t.ink(0.08)}, 0 0 0 1px ${t.ink(0.03)}` }}
      >
        <div className="px-8 pt-8 pb-5 text-center" style={{ borderBottom: t.border(0.04) }}>
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>Content Manager</h1>
          <p className="text-[12px] mt-1" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
              className="w-full px-4 py-3 text-[13px] bg-transparent outline-none rounded-xl transition-colors focus:ring-1"
              style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.ink(0.015) }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
              className="w-full px-4 py-3 text-[13px] bg-transparent outline-none rounded-xl transition-colors focus:ring-1"
              style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.ink(0.015) }} />
          </div>
          {error && <p className="text-[12px]" style={{ fontFamily: t.sans, color: t.error() }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full px-4 py-3 text-[13px] font-medium transition-all rounded-full disabled:opacity-50" style={{ fontFamily: t.sans, background: t.ink(0.85), color: t.cream }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
