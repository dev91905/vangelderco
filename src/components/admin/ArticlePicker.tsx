import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, Search, Plus } from "lucide-react";
import { theme as t } from "@/lib/theme";

type Article = { id: string; title: string; slug: string | null; is_published: boolean };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ArticlePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (linkUrl: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: articles = [] } = useQuery({
    queryKey: ["all-articles-for-picker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capability_posts")
        .select("id, title, slug, is_published")
        .order("title");
      if (error) throw error;
      return data as Article[];
    },
  });

  // Derive the currently selected article from value (which is `/post/{slug}`)
  const selectedSlug = value?.replace(/^\/post\//, "") || null;
  const selectedArticle = articles.find((a) => a.slug === selectedSlug) || null;

  const filtered = query.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    : articles;

  const exactMatch = articles.some((a) => a.title.toLowerCase() === query.trim().toLowerCase());

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectArticle = (article: Article) => {
    onChange(article.slug ? `/post/${article.slug}` : null);
    setQuery("");
    setOpen(false);
  };

  const createAndLink = async () => {
    if (!query.trim() || creating) return;
    setCreating(true);
    try {
      const slug = slugify(query.trim());
      const { data, error } = await supabase
        .from("capability_posts")
        .insert({
          title: query.trim(),
          slug,
          type: "case-study",
          capability: "cultural-strategy",
          is_published: false,
        })
        .select("id, title, slug, is_published")
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["all-articles-for-picker"] });
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      selectArticle(data as Article);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !exactMatch && query.trim()) {
      e.preventDefault();
      createAndLink();
    }
  };

  // If we have a selection, show a chip
  if (selectedArticle) {
    return (
      <div
        className="flex items-center gap-2 rounded-md px-3 py-2"
        style={{
          fontFamily: t.sans,
          fontSize: "13px",
          background: t.ink(0.04),
          border: `1px solid ${t.ink(0.08)}`,
          color: t.ink(0.7),
        }}
      >
        <span className="truncate flex-1">
          {selectedArticle.title}
          {!selectedArticle.is_published && (
            <span
              className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: t.ink(0.06), color: t.ink(0.35) }}
            >
              Draft
            </span>
          )}
        </span>
        <button
          onClick={() => onChange(null)}
          className="shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Unlink article"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex items-center gap-2 rounded-md px-3"
        style={{
          fontFamily: t.sans,
          fontSize: "13px",
          background: t.ink(0.04),
          border: `1px solid ${t.ink(open ? 0.15 : 0.08)}`,
          transition: "border-color 150ms",
        }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" style={{ color: t.ink(0.25) }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles or type to create…"
          className="w-full bg-transparent py-2 outline-none placeholder:text-[color:var(--ink-25)]"
          style={{ fontSize: "13px", color: t.ink(0.7) }}
        />
      </div>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md shadow-lg overflow-hidden"
          style={{
            background: "hsl(var(--background))",
            border: `1px solid ${t.ink(0.1)}`,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {filtered.length === 0 && !query.trim() && (
            <div className="px-3 py-3 text-center" style={{ fontSize: "12px", color: t.ink(0.3) }}>
              No articles yet
            </div>
          )}

          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => selectArticle(a)}
              className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              style={{ fontSize: "13px", fontFamily: t.sans, color: t.ink(0.65) }}
            >
              <span className="truncate flex-1">{a.title}</span>
              {!a.is_published && (
                <span
                  className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: t.ink(0.06), color: t.ink(0.3) }}
                >
                  Draft
                </span>
              )}
            </button>
          ))}

          {query.trim() && !exactMatch && (
            <button
              onClick={createAndLink}
              disabled={creating}
              className="w-full text-left px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 border-t"
              style={{
                fontSize: "13px",
                fontFamily: t.sans,
                color: t.ink(0.5),
                borderColor: t.ink(0.06),
              }}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>
                Create "<strong style={{ color: t.ink(0.7) }}>{query.trim()}</strong>" as new article
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
