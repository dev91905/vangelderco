import { useState, useEffect, useMemo } from "react";
import ImageUploader from "./ImageUploader";

interface EditorMetaBarProps {
  title: string;
  slug: string;
  type: string;
  capability: string;
  heroImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onCapabilityChange: (v: string) => void;
  onHeroImageChange: (v: string | null) => void;
  onPublishedChange: (v: boolean) => void;
  onPublishedAtChange: (v: string | null) => void;
}

const CAPABILITIES = [
  { value: "cultural-strategy", label: "Cultural Strategy" },
  { value: "cross-sector", label: "Cross-Sector Intelligence" },
  { value: "deep-organizing", label: "Deep Organizing" },
];

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const EditorMetaBar = (props: EditorMetaBarProps) => {
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!slugManual && props.title) {
      props.onSlugChange(slugify(props.title));
    }
  }, [props.title, slugManual]);

  return (
    <div className="space-y-4 p-4 md:p-6" style={{ background: "hsl(0 0% 4%)", borderBottom: "1px solid hsl(0 0% 12%)" }}>
      {/* Type + Capability row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1" style={{ border: "1px solid hsl(0 0% 15%)" }}>
          {["blog-post", "case-study"].map((t) => (
            <button
              key={t}
              onClick={() => props.onTypeChange(t)}
              className="px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase transition-colors"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: props.type === t ? "hsl(0 80% 48% / 0.15)" : "transparent",
                color: props.type === t ? "hsl(0 80% 48%)" : "hsl(0 0% 100% / 0.4)",
                borderRight: t === "blog-post" ? "1px solid hsl(0 0% 15%)" : undefined,
              }}
            >
              {t === "blog-post" ? "Blog Post" : "Case Study"}
            </button>
          ))}
        </div>

        <select
          value={props.capability}
          onChange={(e) => props.onCapabilityChange(e.target.value)}
          className="text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 bg-transparent outline-none cursor-pointer"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.5)", border: "1px solid hsl(0 0% 15%)" }}
        >
          {CAPABILITIES.map((c) => (
            <option key={c.value} value={c.value} style={{ background: "hsl(0 0% 6%)" }}>{c.label}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.4)" }}>
              {props.isPublished ? "Published" : "Draft"}
            </span>
            <button
              onClick={() => {
                const next = !props.isPublished;
                props.onPublishedChange(next);
                if (next && !props.publishedAt) props.onPublishedAtChange(new Date().toISOString());
              }}
              className="w-9 h-5 rounded-full relative transition-colors"
              style={{ background: props.isPublished ? "hsl(0 80% 48%)" : "hsl(0 0% 20%)" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                style={{
                  background: "hsl(0 0% 100%)",
                  left: "2px",
                  transform: props.isPublished ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Title */}
      <input
        value={props.title}
        onChange={(e) => props.onTitleChange(e.target.value)}
        placeholder="Post title..."
        className="w-full bg-transparent outline-none text-2xl md:text-3xl font-semibold"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.95)" }}
      />

      {/* Slug */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-[0.1em]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.25)" }}>
          /post/
        </span>
        <input
          value={props.slug}
          onChange={(e) => { setSlugManual(true); props.onSlugChange(e.target.value); }}
          className="flex-1 bg-transparent outline-none text-xs"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.5)" }}
        />
      </div>

      {/* Hero image */}
      <ImageUploader value={props.heroImageUrl} onChange={props.onHeroImageChange} label="Hero Image" />
    </div>
  );
};

export default EditorMetaBar;
