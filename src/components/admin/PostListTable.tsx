import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTogglePublish } from "@/hooks/usePostMutations";
import { useState } from "react";

interface PostListTableProps {
  filter: { type: string; capability: string };
}

const PostListTable = ({ filter }: PostListTableProps) => {
  const togglePublish = useTogglePublish();

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
        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}>
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
          className="flex items-center gap-4 p-4 transition-colors hover:bg-[hsl(0_0%_6%)] group"
          style={{ background: "hsl(0 0% 4%)", borderBottom: "1px solid hsl(0 0% 8%)" }}
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.9)" }}>
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] tracking-[0.15em] uppercase px-1.5 py-0.5" style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: post.type === "case-study" ? "hsl(0 80% 48% / 0.8)" : "hsl(0 0% 100% / 0.4)",
                border: `1px solid ${post.type === "case-study" ? "hsl(0 80% 48% / 0.3)" : "hsl(0 0% 20%)"}`,
              }}>
                {post.type === "case-study" ? "Case Study" : "Blog"}
              </span>
              <span className="text-[9px] tracking-[0.1em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.25)" }}>
                {post.capability.replace(/-/g, " ")}
              </span>
              {post.published_at && (
                <span className="text-[9px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.2)" }}>
                  {format(new Date(post.published_at), "yyyy.MM.dd")}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePublish.mutate({ id: post.id, is_published: !post.is_published });
            }}
            className="p-2 rounded transition-colors hover:bg-[hsl(0_0%_10%)]"
            title={post.is_published ? "Unpublish" : "Publish"}
          >
            {post.is_published ? (
              <Eye className="w-4 h-4" style={{ color: "hsl(0 80% 48% / 0.6)" }} />
            ) : (
              <EyeOff className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.2)" }} />
            )}
          </button>
        </Link>
      ))}

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.25)" }}>
            No posts found
          </span>
        </div>
      )}
    </div>
  );
};

export default PostListTable;
