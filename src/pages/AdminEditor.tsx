import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreatePost, useUpdatePost, useDeletePost, PostFormData } from "@/hooks/usePostMutations";
import EditorMetaBar from "@/components/admin/EditorMetaBar";
import BlockCanvas from "@/components/admin/BlockCanvas";
import StatChipsEditor from "@/components/admin/StatChipsEditor";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);

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
    if (post && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setTitle(post.title);
      setSlug(post.slug || "");
      setType(post.type);
      setCapability(post.capability);
      setHeroImageUrl(post.hero_image_url);
      setIsPublished(post.is_published);
      setPublishedAt(post.published_at);
      setContentBlocks(Array.isArray(post.content_blocks) ? post.content_blocks as any[] : []);
      setStats(Array.isArray(post.stats) ? post.stats as any[] : []);
      setDirty(false);
    }
  }, [post]);

  const formData = useCallback((): PostFormData => ({
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
  }), [title, slug, type, capability, heroImageUrl, contentBlocks, stats, isPublished, publishedAt]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }

    setSaveStatus("saving");
    if (isNew) {
      createPost.mutate(formData(), {
        onSuccess: (data) => {
          setDirty(false);
          setSaveStatus("saved");
          navigate(`/admin/edit/${data.id}`, { replace: true });
        },
        onError: () => setSaveStatus("idle"),
      });
    } else {
      updatePost.mutate({ id: id!, data: formData() }, {
        onSuccess: () => { setDirty(false); setSaveStatus("saved"); },
        onError: () => setSaveStatus("idle"),
      });
    }
  }, [isNew, id, formData, createPost, updatePost, navigate, title, slug]);

  // Auto-save: 3s after last change (only for existing posts)
  useEffect(() => {
    if (!dirty || isNew) return;
    if (!hasLoadedRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave();
    }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, isNew, handleSave]);

  // Reset "saved" status after 2s
  useEffect(() => {
    if (saveStatus === "saved") {
      const t = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p") {
        e.preventDefault();
        const next = !isPublished;
        setIsPublished(next);
        if (next && !publishedAt) setPublishedAt(new Date().toISOString());
        setDirty(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleSave, isPublished, publishedAt]);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  const handleDelete = () => {
    if (!id) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    deletePost.mutate(id, { onSuccess: () => navigate("/admin") });
  };

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 2.5%)" }}>
        <span className="text-xs" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "hsl(0 0% 2.5%)" }}>
      {/* Floating toolbar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5 sticky top-0 z-40 backdrop-blur-xl" style={{ background: "hsl(0 0% 3% / 0.9)", borderBottom: "1px solid hsl(0 0% 8%)" }}>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 transition-colors hover:bg-[hsl(0_0%_10%)] rounded-lg">
            <ArrowLeft className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.4)" }} />
          </Link>
          <span className="text-xs truncate max-w-[200px] hidden md:block" style={{ ...mono, color: "hsl(0 0% 100% / 0.3)" }}>
            {title || "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <span className="text-[10px] mr-2" style={{ ...mono, color: saveStatus === "saving" ? "hsl(0 80% 48% / 0.6)" : saveStatus === "saved" ? "hsl(120 40% 50% / 0.6)" : dirty ? "hsl(0 80% 48% / 0.5)" : "hsl(0 0% 100% / 0.15)" }}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : dirty ? "Unsaved" : ""}
          </span>

          {slug && isPublished && (
            <a
              href={`/post/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 transition-colors hover:bg-[hsl(0_0%_10%)] rounded-lg"
            >
              <ExternalLink className="w-4 h-4" style={{ color: "hsl(0 0% 100% / 0.3)" }} />
            </a>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="p-2 transition-colors hover:bg-[hsl(0_80%_48%_/_0.08)] rounded-lg">
              <Trash2 className="w-4 h-4" style={{ color: "hsl(0 80% 48% / 0.4)" }} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={createPost.isPending || updatePost.isPending}
            className="px-4 py-2 text-xs transition-all rounded-lg"
            style={{
              ...mono,
              background: dirty ? "hsl(0 80% 48%)" : "transparent",
              color: dirty ? "hsl(0 0% 100%)" : "hsl(0 80% 48% / 0.7)",
              border: dirty ? "none" : "1px solid hsl(0 80% 48% / 0.3)",
              opacity: (createPost.isPending || updatePost.isPending) ? 0.5 : 1,
            }}
          >
            {createPost.isPending || updatePost.isPending ? "Saving..." : isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
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
        <div className="px-4 md:px-8 py-4" style={{ borderBottom: "1px solid hsl(0 0% 6%)" }}>
          <StatChipsEditor stats={stats} onChange={markDirty(setStats)} />
        </div>
      )}

      {/* Block Canvas */}
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
        <BlockCanvas blocks={contentBlocks} onChange={markDirty(setContentBlocks)} isCaseStudy={type === "case-study"} />
      </div>

      {/* Keyboard hints */}
      <div className="fixed bottom-4 left-4 hidden md:flex items-center gap-4 text-[9px]" style={{ ...mono, color: "hsl(0 0% 100% / 0.12)" }}>
        <span>⌘S save</span>
        <span>/ commands</span>
        <span>⌘⇧P publish</span>
      </div>
      </div>
    </div>
  );
};

export default AdminEditor;
