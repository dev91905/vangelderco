import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreatePost, useUpdatePost, useDeletePost, PostFormData } from "@/hooks/usePostMutations";
import { usePostImpactStats, useSyncImpactStats, ImpactStat } from "@/hooks/useImpactStats";
import EditorMetaBar from "@/components/admin/EditorMetaBar";
import BlockCanvas from "@/components/admin/BlockCanvas";
import StatChipsEditor from "@/components/admin/StatChipsEditor";
import { ArrowLeft, Trash2, ExternalLink, FileText, BarChart3, Command, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/theme";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TYPE_OPTIONS = [
  { value: "blog-post", label: "Blog Post", desc: "Long-form narrative with hero image", detail: "Use for essays, briefs, and protected updates.", icon: FileText },
  { value: "case-study", label: "Case Study", desc: "Structured analysis with key metrics", detail: "Use when stats, proof points, and sequencing lead the story.", icon: BarChart3 },
] as const;

type StatDraft = Omit<ImpactStat, "post_id" | "case_study_id" | "phase_title" | "sort_order"> & { id: string };

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const syncStats = useSyncImpactStats();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<string | null>(isNew ? null : "blog-post");
  const [capability, setCapability] = useState("cultural-strategy");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [stats, setStats] = useState<StatDraft[]>([]);
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
  const statsLoadedRef = useRef(false);

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

  // Load impact stats for this post
  const { data: impactStats } = usePostImpactStats(id);

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
      setPassword((post as any).password || null);
      setIsFeatured((post as any).is_featured || false);
      setSectorLabel((post as any).sector_label || null);
      setFeaturedStat((post as any).featured_stat || null);
      setLinkUrl((post as any).link_url || null);
      setDirty(false);
    }
  }, [post]);

  // Load impact stats into local state
  useEffect(() => {
    if (impactStats && !statsLoadedRef.current) {
      statsLoadedRef.current = true;
      setStats(impactStats.map(s => ({
        id: s.id,
        label: s.label,
        description: s.description,
        visible: s.visible,
      })));
    }
  }, [impactStats]);

  const formData = useCallback((): PostFormData => ({
    title, slug, type: type || "blog-post", capability,
    excerpt: excerpt || null, content: null,
    hero_image_url: heroImageUrl,
    content_blocks: contentBlocks,
    stats: null, // Stats now live in impact_stats table
    password: password || null,
    is_published: isPublished,
    published_at: publishedAt,
    is_featured: isFeatured,
    sector_label: sectorLabel || null,
    featured_stat: featuredStat || null,
    link_url: linkUrl || null,
  }), [title, excerpt, slug, type, capability, heroImageUrl, contentBlocks, password, isPublished, publishedAt, isFeatured, sectorLabel, featuredStat, linkUrl]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    if (!type) { toast.error("Choose a content type first"); return; }
    setSaveStatus("saving");
    if (isNew) {
      createPost.mutate(formData(), {
        onSuccess: (data) => {
          // Sync stats with the new post ID
          if (type === "case-study" && stats.length > 0) {
            syncStats.mutate({ postId: data.id, stats: stats.map((s, i) => ({ ...s, post_id: data.id, case_study_id: null, phase_title: null, sort_order: i })) });
          }
          setDirty(false);
          setSaveStatus("saved");
          navigate(`/admin/edit/${data.id}`, { replace: true });
        },
        onError: () => { setDirty(false); setSaveStatus("idle"); },
      });
    } else {
      updatePost.mutate({ id: id!, data: formData() }, {
        onSuccess: () => {
          // Sync stats
          if (type === "case-study") {
            syncStats.mutate({ postId: id!, stats: stats.map((s, i) => ({ ...s, post_id: id!, case_study_id: null, phase_title: null, sort_order: i })) });
          }
          setDirty(false);
          setSaveStatus("saved");
        },
        onError: () => { setDirty(false); setSaveStatus("idle"); },
      });
    }
  }, [isNew, id, formData, createPost, updatePost, navigate, title, slug, type, stats, syncStats]);

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

  // Type selector for new posts
  if (isNew && !type) {
    return (
      <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
        <div className="px-4 pb-8 pt-4 md:px-8 md:pb-12">
          <div className="mx-auto max-w-[1180px]">
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium transition-all"
              style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.white, border: `1px solid ${t.ink(0.08)}` }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to admin
            </button>

            <div
              className="mt-6 grid overflow-hidden rounded-[36px] border lg:grid-cols-[0.92fr_1.08fr]"
              style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 36px 84px -52px ${t.ink(0.2)}` }}
            >
              <div className="px-8 py-10 md:px-10 md:py-12" style={{ background: `linear-gradient(150deg, ${t.white} 0%, ${t.ink(0.03)} 100%)` }}>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}>
                  <Sparkles className="h-3.5 w-3.5" /> NEW ENTRY
                </div>
                <h1 className="mt-8 text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[42px]" style={{ fontFamily: t.sans, color: t.ink(0.86) }}>
                  Start with the right structure so the edit flow stays clean.
                </h1>
                <p className="mt-5 max-w-[420px] text-[15px] leading-7" style={{ fontFamily: t.sans, color: t.ink(0.4) }}>
                  Pick the format first. The editor will shape itself around the kind of story you’re publishing instead of making you fight extra fields.
                </p>

                <div className="mt-10 space-y-3">
                  {[
                    "Auto-save stays visible instead of hiding in tiny status text.",
                    "Metadata, blocks, and metrics keep a stable spatial rhythm.",
                    "Draft/published state stays obvious while you work.",
                  ].map((item) => (
                    <div key={item} className="rounded-[20px] px-4 py-3" style={{ background: t.white, border: `1px solid ${t.ink(0.06)}` }}>
                      <p className="text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.5) }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-8 md:px-8 md:py-10">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {TYPE_OPTIONS.map(({ value, label, desc, detail, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className="group text-left rounded-[28px] p-6 transition-all duration-200"
                      style={{ background: t.ink(0.015), border: `1px solid ${t.ink(0.06)}` }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = t.ink(0.14);
                        e.currentTarget.style.background = t.white;
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = `0 24px 54px -36px ${t.ink(0.2)}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = t.ink(0.06);
                        e.currentTarget.style.background = t.ink(0.015);
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: t.ink(0.05) }}>
                        <Icon className="h-5 w-5" style={{ color: t.ink(0.38) }} />
                      </div>
                      <div className="mt-8">
                        <p className="text-[18px] font-semibold tracking-[-0.02em]" style={{ fontFamily: t.sans, color: t.ink(0.8) }}>{label}</p>
                        <p className="mt-2 text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.42) }}>{desc}</p>
                        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
                          Best for
                        </p>
                        <p className="mt-2 text-[12px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.52) }}>{detail}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
    <div className="min-h-screen light" data-theme="light" style={{ background: t.cream, colorScheme: "light" }}>
      <div className="sticky top-0 z-40 px-4 pb-2 pt-4 md:px-6" style={{ background: `linear-gradient(180deg, ${t.cream} 0%, ${t.cream} 76%, transparent 100%)` }}>
        <div className="mx-auto max-w-[1360px] rounded-[30px] border" style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 30px 76px -54px ${t.ink(0.24)}` }}>
          <div className="flex flex-col gap-4 px-4 py-4 md:px-6 md:py-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3 md:gap-4">
              <button
                onClick={() => { if (dirty) { setShowLeaveDialog(true); return; } navigate("/admin"); }}
                className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all"
                style={{ background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}
              >
                <ArrowLeft className="h-4 w-4" style={{ color: t.ink(0.46) }} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.ink(0.04), border: `1px solid ${t.ink(0.08)}` }}>
                    <TypeIcon className="h-3.5 w-3.5" /> {typeInfo?.label}
                  </span>
                  <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: isPublished ? t.cream : t.ink(0.42), background: isPublished ? t.ink(0.84) : t.ink(0.03), border: `1px solid ${isPublished ? t.ink(0.84) : t.ink(0.08)}` }}>
                    {isPublished ? "LIVE" : "DRAFT"}
                  </span>
                </div>
                <h1 className="mt-3 truncate text-[22px] font-semibold tracking-[-0.03em] md:text-[28px]" style={{ fontFamily: t.sans, color: t.ink(0.84) }}>
                  {title || "Untitled entry"}
                </h1>
                <p className="mt-2 truncate text-[12px] leading-6 md:text-[13px]" style={{ fontFamily: t.sans, color: t.ink(0.38) }}>
                  {slug ? `/post/${slug}` : "Set the title, slug, and metadata first — the rest of the edit flow stays anchored below."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <div className="flex items-center gap-2 rounded-full px-3.5 py-2" style={{
                background: saveStatus === "saved" ? t.ink(0.82) : saveStatus === "saving" ? t.ink(0.06) : dirty ? t.ink(0.1) : t.ink(0.03),
                border: `1px solid ${saveStatus === "saved" ? t.ink(0.82) : t.ink(0.08)}`,
              }}>
                <div className="h-2 w-2 rounded-full" style={{ background: saveStatus === "saved" ? t.cream : saveStatus === "saving" ? t.ink(0.38) : dirty ? t.ink(0.58) : t.ink(0.22) }} />
                <span className="text-[11px] font-semibold tracking-[0.06em]" style={{ fontFamily: t.sans, color: saveStatus === "saved" ? t.cream : t.ink(0.56) }}>
                  {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : dirty ? "Unsaved" : "All clear"}
                </span>
              </div>

              {slug && isPublished && (
                <a
                  href={`/post/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium transition-all"
                  style={{ fontFamily: t.sans, color: t.ink(0.56), background: t.white, border: `1px solid ${t.ink(0.08)}` }}
                >
                  <ExternalLink className="h-4 w-4" /> View live
                </a>
              )}

              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium transition-all"
                  style={{ fontFamily: t.sans, color: t.ink(0.52), background: t.white, border: `1px solid ${t.ink(0.08)}` }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={createPost.isPending || updatePost.isPending}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold transition-all"
                style={{
                  fontFamily: t.sans,
                  background: dirty ? t.ink(0.84) : t.ink(0.08),
                  color: dirty ? t.cream : t.ink(0.45),
                  border: `1px solid ${dirty ? t.ink(0.84) : t.ink(0.08)}`,
                  opacity: createPost.isPending || updatePost.isPending ? 0.5 : 1,
                }}
              >
                {createPost.isPending || updatePost.isPending ? "Saving..." : isNew ? "Create entry" : "Save now"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t px-4 py-4 md:px-6" style={{ borderColor: t.ink(0.05) }}>
            {[
              { icon: Command, label: "⌘S to save" },
              { icon: Sparkles, label: "Autosave after 3s" },
              { icon: Command, label: "⌘⇧P toggles publish" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.42), background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-12 pt-4 md:px-6 md:pb-16 md:pt-6">
        <div className="mx-auto max-w-[1360px] space-y-6">
          <EditorMetaBar
            title={title} slug={slug} excerpt={excerpt} type={currentType} capability={capability} heroImageUrl={heroImageUrl} isPublished={isPublished} publishedAt={publishedAt}
            password={password} isFeatured={isFeatured} sectorLabel={sectorLabel} featuredStat={featuredStat}
            onTitleChange={markDirty(setTitle)} onSlugChange={markDirty(setSlug)} onExcerptChange={markDirty(setExcerpt)} onTypeChange={markDirty(setType)} onCapabilityChange={markDirty(setCapability)}
            onHeroImageChange={markDirty(setHeroImageUrl)} onPublishedChange={markDirty(setIsPublished)} onPublishedAtChange={markDirty(setPublishedAt)}
            onPasswordChange={markDirty(setPassword)} onFeaturedChange={markDirty(setIsFeatured)} onSectorLabelChange={markDirty(setSectorLabel)} onFeaturedStatChange={markDirty(setFeaturedStat)}
          />

          {currentType === "case-study" && (
            <div className="rounded-[28px] border px-4 py-4 md:px-6 md:py-5" style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 18px 42px -38px ${t.ink(0.18)}` }}>
              <div className="mb-4">
                <p className="text-[11px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.34) }}>CASE STUDY METRICS</p>
                <p className="mt-1 text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.42) }}>Keep the proof points tight and scannable before the main narrative.</p>
              </div>
              <StatChipsEditor stats={stats} onChange={markDirty(setStats)} />
            </div>
          )}

          <div className="rounded-[30px] border px-4 py-5 md:px-6 md:py-6" style={{ background: t.white, borderColor: t.ink(0.06), boxShadow: `0 20px 48px -40px ${t.ink(0.18)}` }}>
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-[11px] font-semibold tracking-[0.08em]" style={{ fontFamily: t.sans, color: t.ink(0.34) }}>CONTENT BLOCKS</p>
              <p className="text-[13px] leading-6" style={{ fontFamily: t.sans, color: t.ink(0.42) }}>Build the page with a stable reading rhythm — add only the blocks the story needs.</p>
            </div>
            <BlockCanvas blocks={contentBlocks} onChange={markDirty(setContentBlocks)} isCaseStudy={currentType === "case-study"} />
          </div>
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
