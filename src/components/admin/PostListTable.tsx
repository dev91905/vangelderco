import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { CalendarDays, Eye, EyeOff, Lock } from "lucide-react";
import { useTogglePublish } from "@/hooks/usePostMutations";
import useGlitchSFX from "@/hooks/useGlitchSFX";
import { t } from "@/lib/theme";

interface PostListTableProps {
  filter: { type: string; capability: string };
}

const PostListTable = ({ filter }: PostListTableProps) => {
  const togglePublish = useTogglePublish();
  const { playHoverGlitch, playClickGlitch } = useGlitchSFX();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capability_posts").select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (posts || []).filter((p) => {
    if (filter.type && filter.type !== "all" && p.type !== filter.type) return false;
    if (filter.capability && filter.capability !== "all" && p.capability !== filter.capability) return false;
    return true;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.2) }}>Loading...</span></div>;
  }

  return (
    <div className="space-y-3">
      {filtered.map((post) => (
        <Link
          key={post.id}
          to={`/admin/edit/${post.id}`}
          className="group block rounded-[26px] border px-5 py-5 transition-all duration-200 md:px-6 md:py-6"
          style={{
            background: t.white,
            borderColor: t.ink(0.06),
            boxShadow: `0 20px 48px -36px ${t.ink(0.2)}`,
          }}
          onPointerEnter={(e) => {
            playHoverGlitch();
            e.currentTarget.style.background = t.ink(0.015);
            e.currentTarget.style.borderColor = t.ink(0.12);
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 28px 64px -36px ${t.ink(0.18)}`;
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.background = t.white;
            e.currentTarget.style.borderColor = t.ink(0.06);
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 20px 48px -36px ${t.ink(0.2)}`;
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="truncate text-[16px] font-semibold tracking-[-0.01em] transition-transform duration-200 group-hover:translate-x-0.5" style={{ fontFamily: t.sans, color: t.ink(0.82) }}>
                  {post.title}
                </h3>
                {(post as any).password && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em]"
                    style={{
                      fontFamily: t.sans,
                      color: t.ink(0.48),
                      background: t.ink(0.035),
                      border: `1px solid ${t.ink(0.08)}`,
                    }}
                  >
                    <Lock className="h-3 w-3" /> Protected
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em]"
                  style={{
                    fontFamily: t.sans,
                    color: post.type === "case-study" ? t.ink(0.72) : t.ink(0.58),
                    background: post.type === "case-study" ? t.ink(0.07) : t.ink(0.04),
                    border: `1px solid ${post.type === "case-study" ? t.ink(0.12) : t.ink(0.08)}`,
                  }}
                >
                  {post.type === "case-study" ? "CASE STUDY" : "BLOG POST"}
                </span>
                <span
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px]"
                  style={{
                    fontFamily: t.sans,
                    color: t.ink(0.45),
                    background: t.ink(0.025),
                    border: `1px solid ${t.ink(0.06)}`,
                  }}
                >
                  {post.capability.replace(/-/g, " ")}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
              <div
                className="flex min-w-[180px] items-center gap-2 rounded-2xl px-3.5 py-3"
                style={{ background: t.ink(0.02), border: `1px solid ${t.ink(0.05)}` }}
              >
                <CalendarDays className="h-4 w-4" style={{ color: t.ink(0.28) }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.28) }}>
                    {post.is_published ? "Published" : "Status"}
                  </p>
                  <p className="truncate text-[12px] font-medium" style={{ fontFamily: t.sans, color: t.ink(0.58) }}>
                    {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : "Not yet live"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 sm:min-w-[154px]" style={{ background: post.is_published ? t.ink(0.84) : t.ink(0.025), border: `1px solid ${post.is_published ? t.ink(0.84) : t.ink(0.07)}` }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: post.is_published ? t.cream : t.ink(0.04) }}>
                    {post.is_published ? <Eye className="h-4 w-4" style={{ color: t.ink(0.76) }} /> : <EyeOff className="h-4 w-4" style={{ color: t.ink(0.28) }} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ fontFamily: t.sans, color: post.is_published ? t.cream : t.ink(0.28) }}>
                      Visibility
                    </p>
                    <p className="text-[12px] font-medium" style={{ fontFamily: t.sans, color: post.is_published ? t.cream : t.ink(0.56) }}>
                      {post.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playClickGlitch();
                    togglePublish.mutate({ id: post.id, is_published: !post.is_published });
                  }}
                  className="rounded-full px-3 py-2 text-[11px] font-semibold transition-all"
                  style={{
                    fontFamily: t.sans,
                    color: post.is_published ? t.ink(0.76) : t.ink(0.55),
                    background: post.is_published ? t.cream : t.white,
                    border: `1px solid ${post.is_published ? t.cream : t.ink(0.08)}`,
                  }}
                  title={post.is_published ? "Unpublish" : "Publish"}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {post.is_published ? "Hide" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {filtered.length === 0 && (
        <div className="flex items-center justify-center rounded-[26px] border py-20" style={{ background: t.white, borderColor: t.ink(0.06) }}><span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.2) }}>No posts found</span></div>
      )}
    </div>
  );
};

export default PostListTable;
