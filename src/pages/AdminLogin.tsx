import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, FileText } from "lucide-react";
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
    <div className="min-h-screen px-4 py-5 md:px-8 md:py-8" style={{ background: t.cream }}>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] tracking-[0.05em] transition-all duration-300"
        style={{ fontFamily: t.sans, color: t.ink(0.35), border: t.border(0.08) }}
        onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.7); e.currentTarget.style.background = t.ink(0.03); }}
        onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.35); e.currentTarget.style.background = "transparent"; }}
      >
        <ArrowLeft className="w-3 h-3" /> Back to Site
      </Link>

      <div className="mx-auto mt-6 flex min-h-[calc(100vh-7.5rem)] max-w-[1100px] items-center">
        <div
          className="grid w-full overflow-hidden rounded-[36px] border lg:grid-cols-[1.15fr_0.85fr]"
          style={{
            background: t.white,
            borderColor: t.ink(0.06),
            boxShadow: `0 36px 90px -52px ${t.ink(0.22)}`,
          }}
        >
          <div
            className="relative overflow-hidden px-8 py-10 md:px-12 md:py-14"
            style={{ background: `linear-gradient(145deg, ${t.white} 0%, ${t.ink(0.03)} 100%)` }}
          >
            <div className="max-w-[460px]">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em]"
                style={{ fontFamily: t.sans, color: t.ink(0.45), background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}
              >
                <Lock className="h-3.5 w-3.5" /> PRIVATE ADMIN
              </div>

              <h1 className="mt-8 text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[44px]" style={{ fontFamily: t.sans, color: t.ink(0.86) }}>
                A calmer, cleaner control room for publishing and lead follow-up.
              </h1>
              <p className="mt-5 max-w-[420px] text-[15px] leading-7" style={{ fontFamily: t.sans, color: t.ink(0.42) }}>
                Drafts, diagnostics, and case studies stay in one place so you can move fast without fighting the interface.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  { icon: Sparkles, title: "Private publishing", body: "Manage protected articles and visible drafts without extra clicks." },
                  { icon: FileText, title: "Structured case study editing", body: "Metrics, blocks, and metadata stay readable instead of buried." },
                  { icon: Lock, title: "Client-facing diagnostic exports", body: "Lead reports and follow-up actions stay inside the same workspace." },
                ].map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-[22px] px-4 py-4"
                    style={{ background: t.white, border: `1px solid ${t.ink(0.06)}` }}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: t.ink(0.045) }}>
                      <Icon className="h-4.5 w-4.5" style={{ color: t.ink(0.42) }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ fontFamily: t.sans, color: t.ink(0.72) }}>{title}</p>
                      <p className="mt-1 text-[12px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.38) }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center px-6 py-8 md:px-10 md:py-12" style={{ background: t.white }}>
            <div className="w-full">
              <div className="mb-8">
                <p className="text-[11px] font-semibold tracking-[0.09em]" style={{ fontFamily: t.sans, color: t.ink(0.32) }}>
                  CONTENT MANAGER
                </p>
                <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]" style={{ fontFamily: t.sans, color: t.ink(0.82) }}>
                  Sign in
                </h2>
                <p className="mt-2 text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
                  Use your admin credentials to access drafts, case studies, and diagnostic submissions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full rounded-2xl px-4 py-3.5 text-[13px] outline-none transition-all"
                    style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.ink(0.018) }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full rounded-2xl px-4 py-3.5 text-[13px] outline-none transition-all"
                    style={{ fontFamily: t.sans, color: t.ink(0.8), border: t.border(0.08), background: t.ink(0.018) }}
                  />
                </div>

                {error && (
                  <div className="rounded-2xl px-4 py-3" style={{ background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}>
                    <p className="text-[12px]" style={{ fontFamily: t.sans, color: t.error() }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full px-4 py-3.5 text-[13px] font-medium transition-all disabled:opacity-50"
                  style={{ fontFamily: t.sans, background: t.ink(0.85), color: t.cream }}
                >
                  {loading ? "Signing in..." : "Enter workspace"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
