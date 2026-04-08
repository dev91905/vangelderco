import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTogglePublish } from "@/hooks/usePostMutations";
import { useState } from "react";
import useGlitchSFX from "@/hooks/useGlitchSFX";

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

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
        .from("capability_posts")
        .select("*")
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
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.3)" }}>
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-px">
      {filtered.map((post) => (
        <Link
          key={post.id}
          to={`/admin/edit/${post.id}`}
          className="flex items-center gap-4 p-4 transition-all group rounded-xl"
          style={{
            background: "transparent",
            borderBottom: "1px solid hsl(30 10% 12% / 0.04)",
          }}
          onPointerEnter={(e) => {
            playHoverGlitch();
            e.currentTarget.style.background = "hsl(0 0% 100%)";
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-medium truncate flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-0.5" style={{ ...label, color: "hsl(30 10% 12% / 0.85)" }}>
              {post.title}
              {(post as any).password && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(30 10% 12% / 0.2)" }} />}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] tracking-[0.02em] px-2 py-0.5 rounded-full" style={{
                ...label,
                color: post.type === "case-study" ? "hsl(30 10% 12% / 0.6)" : "hsl(30 10% 12% / 0.4)",
                background: post.type === "case-study" ? "hsl(30 10% 12% / 0.06)" : "hsl(30 10% 12% / 0.03)",
              }}>
                {post.type === "case-study" ? "Case Study" : "Blog"}
              </span>
              <span className="text-[11px]" style={{ ...label, color: "hsl(30 10% 12% / 0.3)" }}>
                {post.capability.replace(/-/g, " ")}
              </span>
              {post.published_at && (
                <span className="text-[11px]" style={{ ...label, color: "hsl(30 10% 12% / 0.25)" }}>
                  {format(new Date(post.published_at), "yyyy.MM.dd")}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              playClickGlitch();
              togglePublish.mutate({ id: post.id, is_published: !post.is_published });
            }}
            className="p-2 rounded-lg transition-all hover:bg-[hsl(30_10%_12%_/_0.06)]"
            title={post.is_published ? "Unpublish" : "Publish"}
          >
            {post.is_published ? (
              <Eye className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.5)" }} />
            ) : (
              <EyeOff className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.2)" }} />
            )}
          </button>
        </Link>
      ))}

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.25)" }}>
            No posts found
          </span>
        </div>
      )}
    </div>
  );
};

export default PostListTable;
