import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/theme";
import {
  Plus, X, GripVertical, Save, Trash2, Eye, EyeOff,
  ChevronLeft, ExternalLink, ArrowUp, ArrowDown,
} from "lucide-react";
import type { CasePhase } from "@/components/deck/CaseTimelineOverlay";

/* ── Types ── */
type CaseStudyRow = {
  id: string;
  name: string;
  issue: string;
  outcome: string;
  sort_order: number;
  phases: CasePhase[] | null;
  is_published: boolean;
  link_url: string | null;
  created_at: string;
};

const STARTER_PHASES: CasePhase[] = [
  { title: "Issue / Context", date: "", description: "What was the situation? What needed to change?" },
  { title: "Research / Discovery", date: "", description: "What did we learn? What data or insight shaped the approach?" },
  { title: "Strategy / Brief", date: "", description: "What was the strategic framework? What was the theory of change?" },
  { title: "Coalition Building", date: "", description: "Who did we bring to the table? What alliances formed?" },
  { title: "Execution / Pilots", date: "", description: "What did we actually do? What programs launched?" },
  { title: "Results / Impact", date: "", description: "What happened? What changed?", stats: [{ value: "", label: "" }] },
];

/* ── Styles ── */
const s = {
  label: {
    fontFamily: t.sans,
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    color: t.ink(0.35),
    marginBottom: "4px",
    display: "block",
  },
  input: {
    fontFamily: t.sans,
    fontSize: "14px",
    color: t.ink(0.8),
    background: t.ink(0.02),
    border: `1px solid ${t.ink(0.08)}`,
    borderRadius: "8px",
    padding: "10px 12px",
    width: "100%",
    outline: "none",
  } as React.CSSProperties,
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */

const CaseStudyEditor: React.FC = () => {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ed, setEd] = useState<CaseStudyRow | null>(null);
  const [dirty, setDirty] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  /* ── Data ── */
  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["deck-case-studies-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_case_studies")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CaseStudyRow[];
    },
  });

  /* ── Mutations ── */
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["deck-case-studies-admin"] });
    qc.invalidateQueries({ queryKey: ["deck-case-studies"] });
  };

  const saveMut = useMutation({
    mutationFn: async (row: CaseStudyRow) => {
      const { id, created_at, ...rest } = row;
      const { error } = await supabase.from("deck_case_studies").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setDirty(false); },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("deck_case_studies").insert({
        name: "New Case Study",
        issue: "",
        outcome: "",
        sort_order: studies.length,
        phases: STARTER_PHASES as any,
        is_published: false,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deck_case_studies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setActiveId(null); setEd(null); },
  });

  /* ── Sync editing state ── */
  useEffect(() => {
    if (activeId) {
      const found = studies.find((s) => s.id === activeId);
      if (found) setEd({ ...found });
    }
  }, [activeId, studies]);

  /* ── Field helpers ── */
  const set = useCallback((field: keyof CaseStudyRow, value: any) => {
    setEd((p) => (p ? { ...p, [field]: value } : null));
    setDirty(true);
  }, []);

  const setPhase = useCallback((i: number, field: keyof CasePhase, value: any) => {
    setEd((p) => {
      if (!p?.phases) return p;
      const u = [...p.phases];
      u[i] = { ...u[i], [field]: value };
      return { ...p, phases: u };
    });
    setDirty(true);
  }, []);

  const addPhase = useCallback(() => {
    setEd((p) => {
      if (!p) return p;
      return { ...p, phases: [...(p.phases || []), { title: "New Phase", date: "", description: "" }] };
    });
    setDirty(true);
  }, []);

  const removePhase = useCallback((i: number) => {
    setEd((p) => {
      if (!p?.phases) return p;
      const u = p.phases.filter((_, j) => j !== i);
      return { ...p, phases: u.length ? u : null };
    });
    setDirty(true);
  }, []);

  const movePhase = useCallback((from: number, to: number) => {
    setEd((p) => {
      if (!p?.phases) return p;
      const u = [...p.phases];
      const [item] = u.splice(from, 1);
      u.splice(to, 0, item);
      return { ...p, phases: u };
    });
    setDirty(true);
  }, []);

  const addStat = useCallback((pi: number) => {
    setEd((p) => {
      if (!p?.phases) return p;
      const u = [...p.phases];
      u[pi] = { ...u[pi], stats: [...(u[pi].stats || []), { value: "", label: "" }] };
      return { ...p, phases: u };
    });
    setDirty(true);
  }, []);

  const updateStat = useCallback((pi: number, si: number, field: "value" | "label", val: string) => {
    setEd((p) => {
      if (!p?.phases) return p;
      const u = [...p.phases];
      const stats = [...(u[pi].stats || [])];
      stats[si] = { ...stats[si], [field]: val };
      u[pi] = { ...u[pi], stats };
      return { ...p, phases: u };
    });
    setDirty(true);
  }, []);

  const removeStat = useCallback((pi: number, si: number) => {
    setEd((p) => {
      if (!p?.phases) return p;
      const u = [...p.phases];
      const stats = (u[pi].stats || []).filter((_, j) => j !== si);
      u[pi] = { ...u[pi], stats: stats.length ? stats : undefined };
      return { ...p, phases: u };
    });
    setDirty(true);
  }, []);

  /* ── Drag-and-drop for phases ── */
  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== i) {
      movePhase(dragIdx, i);
      setDragIdx(i);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  /* ── Loading ── */
  if (isLoading) {
    return <p className="py-8 text-center" style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.3) }}>Loading…</p>;
  }

  /* ═══════ LIST VIEW ═══════ */
  if (!activeId || !ed) {
    return (
      <div className="flex flex-col gap-1">
        {studies.map((study) => (
          <button
            key={study.id}
            onClick={() => { setActiveId(study.id); setDirty(false); }}
            className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-all rounded-xl group"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.03); }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span className="flex-1 truncate" style={{ fontFamily: t.sans, fontSize: "14px", fontWeight: 600, color: t.ink(0.75) }}>
              {study.name}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                fontFamily: t.sans,
                fontWeight: 600,
                color: study.phases ? t.ink(0.5) : t.ink(0.25),
                background: study.phases ? t.ink(0.06) : "transparent",
                border: `1px solid ${study.phases ? t.ink(0.08) : t.ink(0.06)}`,
              }}
            >
              {study.phases ? `${(study.phases as any[]).length} phases` : "No phases"}
            </span>
            {study.is_published ? (
              <Eye className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.ink(0.3) }} />
            ) : (
              <EyeOff className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.ink(0.15) }} />
            )}
          </button>
        ))}

        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] transition-all mt-2"
          style={{ fontFamily: t.sans, fontWeight: 600, color: t.ink(0.35), border: `1px dashed ${t.ink(0.1)}` }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.03); e.currentTarget.style.color = t.ink(0.6); }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.ink(0.35); }}
        >
          <Plus className="w-4 h-4" /> Add Case Study
        </button>
      </div>
    );
  }

  /* ═══════ DETAIL / EDITOR VIEW ═══════ */
  const phases = ed.phases ?? [];

  return (
    <div className="flex flex-col" style={{ minHeight: "400px" }}>
      {/* ── Top bar: back + save ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { setActiveId(null); setEd(null); setDirty(false); }}
          className="flex items-center gap-1 text-[12px] transition-colors px-2 py-1 rounded-lg"
          style={{ fontFamily: t.sans, color: t.ink(0.4) }}
          onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.7); }}
          onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); }}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> All Case Studies
        </button>
        <div className="flex-1" />
        {dirty && (
          <span className="text-[10px] tracking-[0.06em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
            Unsaved changes
          </span>
        )}
        <button
          onClick={() => saveMut.mutate(ed)}
          disabled={!dirty || saveMut.isPending}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] transition-all disabled:opacity-30"
          style={{ fontFamily: t.sans, fontWeight: 600, color: t.cream, background: t.ink(1) }}
        >
          <Save className="w-3.5 h-3.5" /> {saveMut.isPending ? "Saving…" : "Save"}
        </button>
      </div>

      {/* ── Header band ── */}
      <div className="rounded-2xl p-6 mb-6" style={{ border: `1px solid ${t.ink(0.06)}`, background: t.ink(0.015) }}>
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-1">
            <input
              value={ed.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Case study name"
              className="bg-transparent outline-none border-none w-full"
              style={{ fontFamily: t.sans, fontSize: "22px", fontWeight: 700, color: t.ink(0.85), letterSpacing: "-0.02em" }}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 mt-1.5">
            <span className="text-[10px] tracking-[0.06em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.35), fontWeight: 600 }}>
              {ed.is_published ? "Published" : "Draft"}
            </span>
            <button
              onClick={() => set("is_published", !ed.is_published)}
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ background: ed.is_published ? t.ink(0.7) : t.ink(0.12) }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                style={{
                  background: t.cream,
                  left: "2px",
                  transform: ed.is_published ? "translateX(16px)" : "translateX(0)",
                }}
              />
            </button>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label style={s.label}>Issue</label>
            <textarea
              value={ed.issue}
              onChange={(e) => set("issue", e.target.value)}
              rows={2}
              style={{ ...s.input, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>
          <div>
            <label style={s.label}>Outcome</label>
            <textarea
              value={ed.outcome}
              onChange={(e) => set("outcome", e.target.value)}
              rows={2}
              style={{ ...s.input, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_80px] gap-4">
          <div>
            <label style={s.label}>Link to Full Article (optional)</label>
            <div className="flex items-center gap-2">
              <input
                value={ed.link_url || ""}
                onChange={(e) => set("link_url", e.target.value || null)}
                placeholder="e.g. /post/clean-energy-workforce or https://..."
                style={s.input}
              />
              {ed.link_url && (
                <a
                  href={ed.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2.5 rounded-lg transition-colors"
                  style={{ color: t.ink(0.3), border: `1px solid ${t.ink(0.08)}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.05); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
          <div>
            <label style={s.label}>Sort Order</label>
            <input
              type="number"
              value={ed.sort_order}
              onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
              style={{ ...s.input, textAlign: "center" }}
            />
          </div>
        </div>
      </div>

      {/* ── Vertical timeline rail ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.3), fontWeight: 600 }}>
          Timeline Phases
        </span>
        <span className="text-[11px]" style={{ fontFamily: t.sans, color: t.ink(0.2) }}>
          {phases.length} phase{phases.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative">
        {/* Vertical rail line */}
        {phases.length > 0 && (
          <div
            className="absolute"
            style={{
              left: "19px",
              top: "24px",
              bottom: "24px",
              width: "2px",
              background: `linear-gradient(to bottom, ${t.ink(0.06)}, ${t.ink(0.14)}, ${t.ink(0.06)})`,
              borderRadius: "1px",
            }}
          />
        )}

        <div className="flex flex-col gap-3">
          {phases.map((phase, i) => {
            const isLast = i === phases.length - 1;
            return (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className="relative flex gap-4 group transition-opacity"
                style={{ opacity: dragIdx === i ? 0.4 : 1 }}
              >
                {/* ── Node + number ── */}
                <div className="flex flex-col items-center flex-shrink-0 pt-5" style={{ width: "40px" }}>
                  <div
                    className="flex items-center justify-center rounded-full z-10"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: t.cream,
                      border: `2px solid ${t.ink(0.2)}`,
                    }}
                  >
                    <span style={{ fontFamily: t.sans, fontSize: "9px", fontWeight: 800, color: t.ink(0.4) }}>
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* ── Phase card ── */}
                <div
                  className="flex-1 rounded-xl p-5 transition-all"
                  style={{
                    border: `1px solid ${t.ink(0.06)}`,
                    background: t.ink(0.015),
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.ink(0.12); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.ink(0.06); }}
                >
                  {/* Top row: drag handle, title, actions */}
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical
                      className="w-3.5 h-3.5 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: t.ink(0.2) }}
                    />
                    <input
                      value={phase.title}
                      onChange={(e) => setPhase(i, "title", e.target.value)}
                      placeholder="Phase title"
                      className="flex-1 bg-transparent outline-none border-none"
                      style={{ fontFamily: t.sans, fontSize: "16px", fontWeight: 700, color: t.ink(0.8) }}
                    />
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i > 0 && (
                        <button onClick={() => movePhase(i, i - 1)} className="p-1 rounded transition-colors" style={{ color: t.ink(0.25) }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.5); }} onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.25); }}>
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {i < phases.length - 1 && (
                        <button onClick={() => movePhase(i, i + 1)} className="p-1 rounded transition-colors" style={{ color: t.ink(0.25) }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.5); }} onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.25); }}>
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => removePhase(i)}
                        className="p-1 rounded transition-colors"
                        style={{ color: t.ink(0.2) }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.2); }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-3">
                    <input
                      value={phase.date || ""}
                      onChange={(e) => setPhase(i, "date", e.target.value)}
                      placeholder="e.g. Jan–Mar 2023"
                      className="bg-transparent outline-none border-none w-full"
                      style={{ fontFamily: t.sans, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: t.ink(0.35), fontWeight: 600 }}
                    />
                  </div>

                  {/* Description */}
                  <textarea
                    value={phase.description}
                    onChange={(e) => setPhase(i, "description", e.target.value)}
                    rows={3}
                    placeholder="Describe this phase…"
                    style={{ ...s.input, resize: "vertical", lineHeight: "1.7", fontSize: "13px", background: "transparent", border: "none", padding: "0" }}
                  />

                  {/* Stats */}
                  {(phase.stats && phase.stats.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${t.ink(0.06)}` }}>
                      {phase.stats.map((stat, si) => (
                        <div key={si} className="flex items-center gap-1.5 px-3 py-2 rounded-lg group/stat" style={{ background: t.ink(0.03), border: `1px solid ${t.ink(0.06)}` }}>
                          <input
                            value={stat.value}
                            onChange={(e) => updateStat(i, si, "value", e.target.value)}
                            placeholder="40K"
                            className="bg-transparent outline-none border-none"
                            style={{ fontFamily: t.sans, width: "60px", fontSize: "14px", fontWeight: 700, color: t.ink(0.8) }}
                          />
                          <input
                            value={stat.label}
                            onChange={(e) => updateStat(i, si, "label", e.target.value)}
                            placeholder="Label"
                            className="bg-transparent outline-none border-none"
                            style={{ fontFamily: t.sans, width: "80px", fontSize: "11px", color: t.ink(0.4), letterSpacing: "0.04em" }}
                          />
                          <button
                            onClick={() => removeStat(i, si)}
                            className="p-0.5 opacity-0 group-hover/stat:opacity-100 transition-opacity"
                            style={{ color: t.ink(0.25) }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add stat button */}
                  {isLast && (
                    <button
                      onClick={() => addStat(i)}
                      className="flex items-center gap-1 mt-3 text-[11px] transition-colors px-2 py-1 rounded"
                      style={{ fontFamily: t.sans, fontWeight: 600, color: t.ink(0.25) }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.5); }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.25); }}
                    >
                      <Plus className="w-3 h-3" /> Add Metric
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add phase node */}
        <div className="relative flex gap-4 mt-3">
          <div className="flex flex-col items-center flex-shrink-0" style={{ width: "40px" }}>
            <button
              onClick={addPhase}
              className="flex items-center justify-center rounded-full z-10 transition-all"
              style={{
                width: "20px",
                height: "20px",
                border: `1px dashed ${t.ink(0.15)}`,
                background: "transparent",
                color: t.ink(0.25),
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.ink(0.3); e.currentTarget.style.color = t.ink(0.5); }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.ink(0.15); e.currentTarget.style.color = t.ink(0.25); }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={addPhase}
            className="text-[12px] transition-colors py-1"
            style={{ fontFamily: t.sans, color: t.ink(0.25) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.ink(0.5); }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.25); }}
          >
            Add Phase
          </button>
        </div>
      </div>

      {/* ── Footer: delete ── */}
      <div className="flex items-center justify-end mt-8 pt-5" style={{ borderTop: `1px solid ${t.ink(0.06)}` }}>
        <button
          onClick={() => { if (confirm("Delete this case study?")) deleteMut.mutate(ed.id); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] transition-all"
          style={{ fontFamily: t.sans, color: t.ink(0.3), border: `1px solid ${t.ink(0.06)}` }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; e.currentTarget.style.borderColor = "hsl(0 60% 50% / 0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.3); e.currentTarget.style.borderColor = t.ink(0.06); }}
        >
          <Trash2 className="w-3 h-3" /> Delete Case Study
        </button>
      </div>
    </div>
  );
};

export default CaseStudyEditor;
