import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreatePost, useUpdatePost, useDeletePost, PostFormData } from "@/hooks/usePostMutations";
import EditorMetaBar from "@/components/admin/EditorMetaBar";
import BlockCanvas from "@/components/admin/BlockCanvas";
import StatChipsEditor from "@/components/admin/StatChipsEditor";
import { Save, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("blog-post");
  const [capability, setCapability] = useState("cultural-strategy");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [dirty, setDirty] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("capability_posts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug || "");
      setType(post.type);
      setCapability(post.capability);
      setHeroImageUrl(post.hero_image_url);
      setIsPublished(post.is_published);
      setPublishedAt(post.published_at);
      setContentBlocks(Array.isArray(post.content_blocks) ? post.content_blocks as any[] : []);
      setStats(Array.isArray(post.stats) ? post.stats as any[] : []);
    }
  }, [post]);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  const formData = (): PostFormData => ({
    title,
    slug,
    type,
    capability,
    excerpt: null,
    content: null,
    hero_image_url: heroImageUrl,
    content_blocks: contentBlocks,
    stats: type === "case-study" ? stats : null,
    is_published: isPublished,
    published_at: publishedAt,
  });

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }

    if (isNew) {
      createPost.mutate(formData(), {
        onSuccess: (data) => {
          setDirty(false);
          navigate(`/admin/edit/${data.id}`, { replace: true });
        },
      });
    } else {
      updatePost.mutate({ id: id!, data: formData() }, {
        onSuccess: () => setDirty(false),
      });
    }
  };

  const handleDelete = () => {
    if (!id) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    deletePost.mutate(id, { onSuccess: () => navigate("/admin") });
  };

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 2.5%)" }}>
        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(0 0% 2.5%)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-40" style={{ background: "hsl(0 0% 3%)", borderBottom: "1px solid hsl(0 0% 10%)" }}>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-1.5 transition-colors hover:bg-[hsl(0_0%_10%)] rounded">
            <ArrowLeft className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.4)" }} />
          </Link>
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}>
            {isNew ? "New Post" : "Editing"}
          </span>
          {dirty && (
            <span className="text-[9px] px-1.5 py-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.7)", background: "hsl(0 80% 48% / 0.1)" }}>
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {slug && isPublished && (
            <a
              href={`/post/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 transition-colors hover:bg-[hsl(0_0%_10%)] rounded"
              title="Preview"
            >
              <ExternalLink className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
            </a>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="p-2 transition-colors hover:bg-[hsl(0_80%_48%_/_0.1)] rounded" title="Delete">
              <Trash2 className="w-4 h-4" style={{ color: "hsl(0 80% 48% / 0.5)" }} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={createPost.isPending || updatePost.isPending}
            className="flex items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-[hsl(0_80%_48%_/_0.2)]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "hsl(0 80% 48%)",
              border: "1px solid hsl(0 80% 48% / 0.4)",
              opacity: (createPost.isPending || updatePost.isPending) ? 0.5 : 1,
            }}
          >
            <Save className="w-3 h-3" />
            {createPost.isPending || updatePost.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <EditorMetaBar
        title={title}
        slug={slug}
        type={type}
        capability={capability}
        heroImageUrl={heroImageUrl}
        isPublished={isPublished}
        publishedAt={publishedAt}
        onTitleChange={markDirty(setTitle)}
        onSlugChange={markDirty(setSlug)}
        onTypeChange={markDirty(setType)}
        onCapabilityChange={markDirty(setCapability)}
        onHeroImageChange={markDirty(setHeroImageUrl)}
        onPublishedChange={markDirty(setIsPublished)}
        onPublishedAtChange={markDirty(setPublishedAt)}
      />

      {/* Stat Chips (case study only) */}
      {type === "case-study" && (
        <div className="px-4 md:px-8 py-4" style={{ borderBottom: "1px solid hsl(0 0% 8%)" }}>
          <StatChipsEditor stats={stats} onChange={markDirty(setStats)} />
        </div>
      )}

      {/* Block Canvas */}
      <div className="px-4 md:px-8 py-6 max-w-4xl">
        <BlockCanvas blocks={contentBlocks} onChange={markDirty(setContentBlocks)} isCaseStudy={type === "case-study"} />
      </div>
    </div>
  );
};

export default AdminEditor;
