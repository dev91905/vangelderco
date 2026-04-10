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

const label: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("blog-post");
  const [capability, setCapability] = useState("cultural-strategy");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [password, setPassword] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sectorLabel, setSectorLabel] = useState<string | null>(null);
  const [featuredStat, setFeaturedStat] = useState<string | null>(null);
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
      setExcerpt(post.excerpt || "");
      setType(post.type);
      setCapability(post.capability);
      setHeroImageUrl(post.hero_image_url);
      setIsPublished(post.is_published);
      setPublishedAt(post.published_at);
      setContentBlocks(Array.isArray(post.content_blocks) ? post.content_blocks as any[] : []);
      setStats(Array.isArray(post.stats) ? post.stats as any[] : []);
      setPassword((post as any).password || null);
      setIsFeatured((post as any).is_featured || false);
      setSectorLabel((post as any).sector_label || null);
      setFeaturedStat((post as any).featured_stat || null);
      setDirty(false);
    }
  }, [post]);

  const formData = useCallback((): PostFormData => ({
    title, slug, type, capability,
    excerpt: excerpt || null, content: null,
    hero_image_url: heroImageUrl,
    content_blocks: contentBlocks,
    stats: type === "case-study" ? stats : null,
    password: password || null,
    is_published: isPublished,
    published_at: publishedAt,
    is_featured: isFeatured,
    sector_label: sectorLabel || null,
    featured_stat: featuredStat || null,
  }), [title, excerpt, slug, type, capability, heroImageUrl, contentBlocks, stats, password, isPublished, publishedAt, isFeatured, sectorLabel, featuredStat]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    setSaveStatus("saving");
    if (isNew) {
      createPost.mutate(formData(), {
        onSuccess: (data) => { setDirty(false); setSaveStatus("saved"); navigate(`/admin/edit/${data.id}`, { replace: true }); },
        onError: () => setSaveStatus("idle"),
      });
    } else {
      updatePost.mutate({ id: id!, data: formData() }, {
        onSuccess: () => { setDirty(false); setSaveStatus("saved"); },
        onError: () => setSaveStatus("idle"),
      });
    }
  }, [isNew, id, formData, createPost, updatePost, navigate, title, slug]);

  useEffect(() => {
    if (!dirty || isNew) return;
    if (!hasLoadedRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, isNew, handleSave]);

  useEffect(() => {
    if (saveStatus === "saved") { const t = setTimeout(() => setSaveStatus("idle"), 2000); return () => clearTimeout(t); }
  }, [saveStatus]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(40 30% 96%)" }}>
        <span className="text-sm" style={{ ...label, color: "hsl(30 10% 12% / 0.3)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "hsl(40 30% 96%)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2 sticky top-0 z-40 backdrop-blur-xl" style={{ background: "hsl(40 30% 96% / 0.9)", borderBottom: "1px solid hsl(30 10% 12% / 0.06)" }}>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] rounded-xl">
            <ArrowLeft className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.4)" }} />
          </Link>
          <span className="text-sm truncate max-w-[200px] hidden md:block" style={{ ...label, color: "hsl(30 10% 12% / 0.35)" }}>
            {title || "Untitled"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] mr-2" style={{ ...label, color: saveStatus === "saving" ? "hsl(30 10% 12% / 0.5)" : saveStatus === "saved" ? "hsl(150 40% 40% / 0.7)" : dirty ? "hsl(30 10% 12% / 0.4)" : "hsl(30 10% 12% / 0.15)" }}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : dirty ? "Unsaved" : ""}
          </span>
          {slug && isPublished && (
            <a href={`/post/${slug}`} target="_blank" rel="noopener noreferrer" className="p-2 transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] rounded-xl">
              <ExternalLink className="w-4 h-4" style={{ color: "hsl(30 10% 12% / 0.3)" }} />
            </a>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="p-2 transition-colors hover:bg-[hsl(0_60%_50%_/_0.06)] rounded-xl">
              <Trash2 className="w-4 h-4" style={{ color: "hsl(0 60% 45% / 0.4)" }} />
            </button>
          )}
          <button onClick={handleSave} disabled={createPost.isPending || updatePost.isPending}
            className="px-4 py-2 text-sm transition-all rounded-full"
            style={{ ...label, background: dirty ? "hsl(30 10% 12%)" : "transparent", color: dirty ? "hsl(40 30% 96%)" : "hsl(30 10% 12% / 0.5)", border: dirty ? "none" : "1px solid hsl(30 10% 12% / 0.15)", opacity: (createPost.isPending || updatePost.isPending) ? 0.5 : 1 }}>
            {createPost.isPending || updatePost.isPending ? "Saving..." : isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <EditorMetaBar
          title={title} slug={slug} excerpt={excerpt} type={type} capability={capability} heroImageUrl={heroImageUrl} isPublished={isPublished} publishedAt={publishedAt}
          password={password}
          onTitleChange={markDirty(setTitle)} onSlugChange={markDirty(setSlug)} onExcerptChange={markDirty(setExcerpt)} onTypeChange={markDirty(setType)} onCapabilityChange={markDirty(setCapability)}
          onHeroImageChange={markDirty(setHeroImageUrl)} onPublishedChange={markDirty(setIsPublished)} onPublishedAtChange={markDirty(setPublishedAt)}
          onPasswordChange={markDirty(setPassword)}
        />

        {type === "case-study" && (
          <div className="px-4 md:px-8 py-4">
            <StatChipsEditor stats={stats} onChange={markDirty(setStats)} />
          </div>
        )}

        <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
          <BlockCanvas blocks={contentBlocks} onChange={markDirty(setContentBlocks)} isCaseStudy={type === "case-study"} />
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] py-8 mt-12" style={{ ...label, color: "hsl(30 10% 12% / 0.15)" }}>
          <span>⌘S save</span>
          <span>/ commands</span>
          <span>⌘⇧P publish</span>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
