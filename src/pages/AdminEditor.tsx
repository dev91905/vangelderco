import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreatePost, useUpdatePost, useDeletePost, PostFormData } from "@/hooks/usePostMutations";
import EditorMetaBar from "@/components/admin/EditorMetaBar";
import BlockCanvas from "@/components/admin/BlockCanvas";
import StatChipsEditor from "@/components/admin/StatChipsEditor";
import { ArrowLeft, Trash2, ExternalLink, FileText, BarChart3, Zap } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/theme";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TYPE_OPTIONS = [
  { value: "blog-post", label: "Blog Post", desc: "Long-form narrative with hero image", icon: FileText },
  { value: "case-study", label: "Case Study", desc: "Structured analysis with key metrics", icon: BarChart3 },
  { value: "field-note", label: "Field Note", desc: "Quick signal with impact stat", icon: Zap },
] as const;

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
  const [type, setType] = useState<string | null>(isNew ? null : "blog-post");
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
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
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
      setLinkUrl((post as any).link_url || null);
      setDirty(false);
    }
  }, [post]);

  const formData = useCallback((): PostFormData => ({
    title, slug, type: type || "blog-post", capability,
    excerpt: excerpt || null, content: null,
    hero_image_url: type === "field-note" ? null : heroImageUrl,
    content_blocks: type === "field-note" ? [] : contentBlocks,
    stats: type === "case-study" ? stats : null,
    password: type === "field-note" ? null : (password || null),
    is_published: isPublished,
    published_at: publishedAt,
    is_featured: isFeatured,
    sector_label: sectorLabel || null,
    featured_stat: featuredStat || null,
    link_url: linkUrl || null,
  }), [title, excerpt, slug, type, capability, heroImageUrl, contentBlocks, stats, password, isPublished, publishedAt, isFeatured, sectorLabel, featuredStat, linkUrl]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    if (!type) { toast.error("Choose a content type first"); return; }
    setSaveStatus("saving");
    if (isNew) {
      createPost.mutate(formData(), {
        onSuccess: (data) => { setDirty(false); setSaveStatus("saved"); navigate(`/admin/edit/${data.id}`, { replace: true }); },
        onError: () => { setDirty(false); setSaveStatus("idle"); },
      });
    } else {
      updatePost.mutate({ id: id!, data: formData() }, {
        onSuccess: () => { setDirty(false); setSaveStatus("saved"); },
        onError: () => { setDirty(false); setSaveStatus("idle"); },
      });
    }
  }, [isNew, id, formData, createPost, updatePost, navigate, title, slug, type]);

  useEffect(() => {
    if (!dirty || isNew) return;
    if (!hasLoadedRef.current) return;
    if (saveStatus === "saving") return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, isNew, handleSave, saveStatus]);

  useEffect(() => {
    if (saveStatus === "saved") { const tm = setTimeout(() => setSaveStatus("idle"), 2000); return () => clearTimeout(tm); }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Loading...</span>
      </div>
    );
  }

  // Type selector for new posts — shown before anything else
  if (isNew && !type) {
    return (
      <div className="h-screen flex flex-col light" data-theme="light" style={{ background: "hsl(var(--background))", colorScheme: "light" }}>
        {/* Minimal toolbar */}
        <div className="flex items-center px-4 md:px-6 py-2 sticky top-0 z-40" style={{ borderBottom: `1px solid ${t.ink(0.06)}` }}>
          <button onClick={() => navigate("/admin")} className="p-2 transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] rounded-xl">
            <ArrowLeft className="w-4 h-4" style={{ color: t.ink(0.4) }} />
          </button>
        </div>

        {/* Type chooser */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[640px]">
            <div className="text-center mb-12">
              <h1 className="text-[28px] font-semibold mb-3" style={{ fontFamily: t.sans, color: t.ink(0.85) }}>
                New Content
              </h1>
              <p className="text-[15px]" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
                What are you creating?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TYPE_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className="group text-left p-6 rounded-2xl transition-all duration-200"
                  style={{
                    border: `1px solid ${t.ink(0.08)}`,
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = t.ink(0.2);
                    e.currentTarget.style.background = t.ink(0.02);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = t.ink(0.08);
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon className="w-5 h-5 mb-4" style={{ color: t.ink(0.3) }} />
                  <div className="text-[15px] font-medium mb-1.5" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>
                    {label}
                  </div>
                  <div className="text-[13px] leading-relaxed" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
                    {desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentType = type || "blog-post";
  const typeInfo = TYPE_OPTIONS.find(o => o.value === currentType);
  const TypeIcon = typeInfo?.icon || FileText;

  return (
    <div className="h-screen flex flex-col light" data-theme="light" style={{ background: "hsl(var(--background))", colorScheme: "light" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2 sticky top-0 z-40 backdrop-blur-xl" style={{ background: "hsl(var(--background) / 0.9)", borderBottom: `1px solid ${t.ink(0.06)}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (dirty) { setShowLeaveDialog(true); return; }
              navigate("/admin");
            }}
            className="p-2 transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: t.ink(0.4) }} />
          </button>
          {/* Type indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: t.ink(0.03) }}>
            <TypeIcon className="w-3 h-3" style={{ color: t.ink(0.3) }} />
            <span className="text-[11px] font-medium" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>
              {typeInfo?.label}
            </span>
          </div>
          <span className="text-sm truncate max-w-[200px] hidden md:block" style={{ fontFamily: t.sans, color: t.ink(0.35) }}>
            {title || "Untitled"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] mr-2" style={{ fontFamily: t.sans, color: saveStatus === "saving" ? t.ink(0.5) : saveStatus === "saved" ? "hsl(150 40% 40% / 0.7)" : dirty ? t.ink(0.4) : t.ink(0.15) }}>
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : dirty ? "Unsaved" : ""}
          </span>
          {slug && isPublished && (
            <a href={`/post/${slug}`} target="_blank" rel="noopener noreferrer" className="p-2 transition-colors hover:bg-[hsl(30_10%_12%_/_0.04)] rounded-xl">
              <ExternalLink className="w-4 h-4" style={{ color: t.ink(0.3) }} />
            </a>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="p-2 transition-colors hover:bg-[hsl(0_60%_50%_/_0.06)] rounded-xl">
              <Trash2 className="w-4 h-4" style={{ color: "hsl(0 60% 45% / 0.4)" }} />
            </button>
          )}
          <button onClick={handleSave} disabled={createPost.isPending || updatePost.isPending}
            className="px-4 py-2 text-sm transition-all rounded-full"
            style={{ fontFamily: t.sans, background: dirty ? "hsl(var(--foreground))" : "transparent", color: dirty ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.5)", border: dirty ? "none" : `1px solid ${t.ink(0.15)}`, opacity: (createPost.isPending || updatePost.isPending) ? 0.5 : 1 }}>
            {createPost.isPending || updatePost.isPending ? "Saving..." : isNew ? "Create" : "Save"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <EditorMetaBar
          title={title} slug={slug} excerpt={excerpt} type={currentType} capability={capability} heroImageUrl={heroImageUrl} isPublished={isPublished} publishedAt={publishedAt}
          password={password} isFeatured={isFeatured} sectorLabel={sectorLabel} featuredStat={featuredStat}
          onTitleChange={markDirty(setTitle)} onSlugChange={markDirty(setSlug)} onExcerptChange={markDirty(setExcerpt)} onTypeChange={markDirty(setType)} onCapabilityChange={markDirty(setCapability)}
          onHeroImageChange={markDirty(setHeroImageUrl)} onPublishedChange={markDirty(setIsPublished)} onPublishedAtChange={markDirty(setPublishedAt)}
          onPasswordChange={markDirty(setPassword)} onFeaturedChange={markDirty(setIsFeatured)} onSectorLabelChange={markDirty(setSectorLabel)} onFeaturedStatChange={markDirty(setFeaturedStat)}
        />

        {currentType === "case-study" && (
          <div className="px-4 md:px-8 py-4 max-w-[680px] mx-auto">
            <StatChipsEditor stats={stats} onChange={markDirty(setStats)} />
          </div>
        )}

        {currentType === "field-note" && (
          <div className="px-6 md:px-8 pt-10 pb-16 max-w-[560px] mx-auto">
            <div className="space-y-10">
              {/* Slug line */}
              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.12em] mb-3 block" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Slug Line</label>
                <input value={sectorLabel || ""} onChange={(e) => markDirty(setSectorLabel)(e.target.value || null)}
                  placeholder="INTELLIGENCE · CULTURE · ORGANIZING"
                  className="w-full bg-transparent outline-none pb-3"
                  style={{ fontFamily: t.sans, color: t.ink(0.75), fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: `1px solid ${t.ink(0.08)}` }} />
              </div>
              {/* Brief */}
              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.12em] mb-3 block" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Brief</label>
                <textarea value={excerpt} onChange={(e) => markDirty(setExcerpt)(e.target.value)}
                  placeholder="What happened. What was accomplished."
                  rows={3}
                  className="w-full bg-transparent outline-none resize-none pb-3"
                  style={{ fontFamily: t.sans, color: t.ink(0.7), fontSize: "15px", lineHeight: "1.75", borderBottom: `1px solid ${t.ink(0.08)}` }} />
              </div>
              {/* Impact stat */}
              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.12em] mb-3 block" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>Impact Stat</label>
                <input value={featuredStat || ""} onChange={(e) => markDirty(setFeaturedStat)(e.target.value || null)}
                  placeholder="$12M mobilized across 3 foundations"
                  className="w-full bg-transparent outline-none pb-3"
                  style={{ fontFamily: t.sans, color: t.ink(0.7), fontSize: "15px", borderBottom: `1px solid ${t.ink(0.08)}` }} />
              </div>
              {/* Link */}
              <div className="group">
                <label className="text-[10px] uppercase tracking-[0.12em] mb-3 block" style={{ fontFamily: t.sans, color: t.ink(0.25) }}>
                  Link <span style={{ color: t.ink(0.15), textTransform: "none", letterSpacing: "0", fontSize: "10px" }}>optional</span>
                </label>
                <input value={linkUrl || ""} onChange={(e) => markDirty(setLinkUrl)(e.target.value || null)}
                  placeholder="/post/clean-energy or https://nytimes.com/..."
                  className="w-full bg-transparent outline-none pb-3"
                  style={{ fontFamily: t.sans, color: t.ink(0.5), fontSize: "14px", borderBottom: `1px solid ${t.ink(0.08)}` }} />
              </div>
            </div>
          </div>
        )}

        {currentType !== "field-note" && (
          <div className="px-4 md:px-8 py-6 max-w-[680px] mx-auto">
            <BlockCanvas blocks={contentBlocks} onChange={markDirty(setContentBlocks)} isCaseStudy={currentType === "case-study"} />
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-[11px] py-8 mt-12" style={{ fontFamily: t.sans, color: t.ink(0.15) }}>
          <span>⌘S save</span>
          <span>/ commands</span>
          <span>⌘⇧P publish</span>
        </div>
      </div>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="light" style={{ background: "hsl(var(--background))", border: `1px solid ${t.ink(0.08)}`, fontFamily: t.sans }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: t.ink(0.85) }}>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription style={{ color: t.ink(0.5) }}>
              You have unsaved changes. Would you like to save as a draft before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate("/admin")} style={{ fontFamily: t.sans, color: t.ink(0.5), border: `1px solid ${t.ink(0.12)}` }}>
              Discard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLeaveDialog(false);
                if (isNew) {
                  createPost.mutate(formData(), {
                    onSuccess: () => { toast.success("Saved as draft"); navigate("/admin"); },
                  });
                } else {
                  updatePost.mutate({ id: id!, data: formData() }, {
                    onSuccess: () => { toast.success("Changes saved"); navigate("/admin"); },
                  });
                }
              }}
              style={{ fontFamily: t.sans, background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}
            >
              Save & leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEditor;
