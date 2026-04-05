import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import PostListTable from "@/components/admin/PostListTable";

const Admin = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [capFilter, setCapFilter] = useState("all");

  const typeChips = [
    { value: "all", label: "All" },
    { value: "blog-post", label: "Blog Posts" },
    { value: "case-study", label: "Case Studies" },
  ];

  const capChips = [
    { value: "all", label: "All" },
    { value: "cultural-strategy", label: "Cultural Strategy" },
    { value: "cross-sector", label: "Cross-Sector" },
    { value: "deep-organizing", label: "Deep Organizing" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(0 0% 2.5%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[10px] tracking-[0.2em] uppercase transition-colors hover:opacity-70" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.3)" }}>
            ← Site
          </Link>
          <h1 className="text-sm font-medium tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(0 0% 100% / 0.8)" }}>
            Content Manager
          </h1>
        </div>
        <Link
          to="/admin/new"
          className="flex items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-[hsl(0_80%_48%_/_0.15)]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "hsl(0 80% 48%)",
            border: "1px solid hsl(0 80% 48% / 0.4)",
          }}
        >
          <Plus className="w-3 h-3" /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-4 md:px-8 py-3" style={{ borderBottom: "1px solid hsl(0 0% 8%)" }}>
        {typeChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setTypeFilter(c.value)}
            className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase transition-colors"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: typeFilter === c.value ? "hsl(0 80% 48%)" : "hsl(0 0% 100% / 0.35)",
              background: typeFilter === c.value ? "hsl(0 80% 48% / 0.1)" : "transparent",
              border: `1px solid ${typeFilter === c.value ? "hsl(0 80% 48% / 0.3)" : "hsl(0 0% 15%)"}`,
            }}
          >
            {c.label}
          </button>
        ))}
        <div className="w-px h-4 mx-1" style={{ background: "hsl(0 0% 15%)" }} />
        {capChips.map((c) => (
          <button
            key={c.value}
            onClick={() => setCapFilter(c.value)}
            className="px-3 py-1 text-[10px] tracking-[0.1em] uppercase transition-colors"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: capFilter === c.value ? "hsl(0 0% 100% / 0.7)" : "hsl(0 0% 100% / 0.25)",
              background: capFilter === c.value ? "hsl(0 0% 10%)" : "transparent",
              border: `1px solid ${capFilter === c.value ? "hsl(0 0% 20%)" : "transparent"}`,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="px-4 md:px-8 py-2">
        <PostListTable filter={{ type: typeFilter, capability: capFilter }} />
      </div>
    </div>
  );
};

export default Admin;
