import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/theme";
import {
  Plus, X, GripVertical, ChevronDown, ChevronRight,
  Save, Trash2, Eye, EyeOff, ExternalLink, Link as LinkIcon,
  Check, LayoutList,
} from "lucide-react";
import type { CasePhase } from "@/components/deck/CaseTimelineOverlay";
import { useSyncImpactStats } from "@/hooks/useImpactStats";
import ArticlePicker from "@/components/admin/ArticlePicker";

type CaseStudyRow = {
  id: string;
  name: string;
  issue: string;
  outcome: string;
  sort_order: number;
  phases: CasePhase[] | null;
  is_published: boolean;
  created_at: string;
  link_url: string | null;
};

const STARTER_PHASES: CasePhase[] = [
  { title: "Issue / Context", date: "", description: "What was the core problem or opportunity?" },
  { title: "Research / Discovery", date: "", description: "What did the landscape look like? What data or insight drove the approach?" },
  { title: "Strategy / Brief", date: "", description: "What was the strategic framework? What made this approach different?" },
  { title: "Coalition Building", date: "", description: "Who came to the table? How were stakeholders organized?" },
  { title: "Execution / Pilots", date: "", description: "What was deployed? What channels, tactics, or programs ran?" },
  { title: "Results / Impact", date: "", description: "What changed? What metrics tell the story?", stats: [{ value: "", label: "" }] },
];

const CaseStudyEditor: React.FC = () => {
  const queryClient = useQueryClient();
  const syncStats = useSyncImpactStats();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStudy, setEditingStudy] = useState<CaseStudyRow | null>(null);
  const [dirty, setDirty] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["deck-case-studies-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_case_studies")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as CaseStudyRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (study: CaseStudyRow) => {
      const { id, created_at, ...rest } = study;
      const { error } = await supabase
        .from("deck_case_studies")
        .update(rest)
        .eq("id", id);
      if (error) throw error;

      // Sync phase stats to impact_stats table
      if (study.phases) {
        for (const phase of study.phases) {
          const phaseStats = (phase.stats ?? []).map((s, i) => ({
            label: s.value,
            description: s.label,
            case_study_id: id,
            post_id: null,
            phase_title: phase.title,
            visible: true,
            sort_order: i,
          }));
          await syncStats.mutateAsync({
            caseStudyId: id,
            phaseTitle: phase.title,
            stats: phaseStats,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies-admin"] });
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["impact-stats"] });
      setDirty(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("deck_case_studies")
        .insert({
          name: "New Case Study",
          issue: "",
          outcome: "",
          sort_order: studies.length,
          phases: STARTER_PHASES as any,
          is_published: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies-admin"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("deck_case_studies")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies-admin"] });
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies"] });
      setExpandedId(null);
      setEditingStudy(null);
    },
  });

  useEffect(() => {
    if (expandedId) {
      const s = studies.find((s) => s.id === expandedId);
      if (s) setEditingStudy({ ...s });
    }
  }, [expandedId, studies]);

  const updateField = useCallback(
    (field: keyof CaseStudyRow, value: any) => {
      setEditingStudy((prev) => (prev ? { ...prev, [field]: value } : null));
      setDirty(true);
    },
    []
  );

  const updatePhase = useCallback(
    (idx: number, field: keyof CasePhase, value: any) => {
      setEditingStudy((prev) => {
        if (!prev || !prev.phases) return prev;
        const updated = [...prev.phases];
        updated[idx] = { ...updated[idx], [field]: value };
        return { ...prev, phases: updated };
      });
      setDirty(true);
    },
    []
  );

  const addPhase = useCallback(() => {
    setEditingStudy((prev) => {
      if (!prev) return prev;
      const phases = prev.phases || [];
      return {
        ...prev,
        phases: [...phases, { title: "New Phase", date: "", description: "" }],
      };
    });
    setDirty(true);
  }, []);

  const removePhase = useCallback((idx: number) => {
    setEditingStudy((prev) => {
      if (!prev || !prev.phases) return prev;
      const updated = prev.phases.filter((_, i) => i !== idx);
      return { ...prev, phases: updated.length > 0 ? updated : null };
    });
    setDirty(true);
  }, []);

  const addStat = useCallback((phaseIdx: number) => {
    setEditingStudy((prev) => {
      if (!prev || !prev.phases) return prev;
      const updated = [...prev.phases];
      const phase = { ...updated[phaseIdx] };
      phase.stats = [...(phase.stats || []), { value: "", label: "" }];
      updated[phaseIdx] = phase;
      return { ...prev, phases: updated };
    });
    setDirty(true);
  }, []);

  const updateStat = useCallback(
    (phaseIdx: number, statIdx: number, field: "value" | "label", value: string) => {
      setEditingStudy((prev) => {
        if (!prev || !prev.phases) return prev;
        const updated = [...prev.phases];
        const phase = { ...updated[phaseIdx] };
        const stats = [...(phase.stats || [])];
        stats[statIdx] = { ...stats[statIdx], [field]: value };
        phase.stats = stats;
        updated[phaseIdx] = phase;
        return { ...prev, phases: updated };
      });
      setDirty(true);
    },
    []
  );

  const removeStat = useCallback((phaseIdx: number, statIdx: number) => {
    setEditingStudy((prev) => {
      if (!prev || !prev.phases) return prev;
      const updated = [...prev.phases];
      const phase = { ...updated[phaseIdx] };
      const stats = (phase.stats || []).filter((_, i) => i !== statIdx);
      phase.stats = stats.length > 0 ? stats : undefined;
      updated[phaseIdx] = phase;
      return { ...prev, phases: updated };
    });
    setDirty(true);
  }, []);

  /* ── Drag-and-drop reorder for phases ── */
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    setEditingStudy((prev) => {
      if (!prev || !prev.phases) return prev;
      const arr = [...prev.phases];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, moved);
      return { ...prev, phases: arr };
    });
    setDirty(true);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const loadStarters = useCallback(() => {
    setEditingStudy((prev) => {
      if (!prev) return prev;
      return { ...prev, phases: [...STARTER_PHASES] };
    });
    setDirty(true);
  }, []);

  const inputStyle: React.CSSProperties = {
    fontFamily: t.sans,
    fontSize: "14px",
    color: t.ink(0.8),
    background: t.ink(0.02),
    border: `1px solid ${t.ink(0.08)}`,
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: t.sans,
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: t.ink(0.35),
    marginBottom: "6px",
    display: "block",
  };

  if (isLoading) {
    return (
      <p className="py-8 text-center" style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.3) }}>
        Loading case studies…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {studies.map((study) => {
        const isExpanded = expandedId === study.id;
        const ed = isExpanded ? editingStudy : null;

        return (
          <div key={study.id}>
            {/* ── Row header ── */}
            <button
              onClick={() => {
                setExpandedId(isExpanded ? null : study.id);
                setDirty(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-all rounded-xl"
              style={{ background: isExpanded ? t.ink(0.03) : "transparent" }}
              onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = t.ink(0.02); }}
              onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.ink(0.3) }} />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.ink(0.2) }} />
              )}
              <span
                className="flex-1 truncate"
                style={{
                  fontFamily: t.sans,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: t.ink(0.75),
                }}
              >
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

            {/* ── Expanded editor ── */}
            {isExpanded && ed && (
              <div
                className="pb-6 pt-2 space-y-6"
                style={{
                  background: t.ink(0.015),
                  borderRadius: "0 0 16px 16px",
                  borderLeft: `1px solid ${t.ink(0.04)}`,
                  borderRight: `1px solid ${t.ink(0.04)}`,
                  borderBottom: `1px solid ${t.ink(0.04)}`,
                }}
              >
                {/* ── Header meta: name as large editable title ── */}
                <div className="px-6">
                  <input
                    value={ed.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Case study name"
                    style={{
                      fontFamily: t.sans,
                      fontSize: "clamp(20px, 2vw, 26px)",
                      fontWeight: 700,
                      color: t.ink(0.85),
                      background: "transparent",
                      border: "none",
                      borderBottom: `2px solid ${t.ink(0.06)}`,
                      borderRadius: 0,
                      padding: "8px 0",
                      width: "100%",
                      outline: "none",
                      letterSpacing: "-0.02em",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = t.ink(0.2); }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = t.ink(0.06); }}
                  />
                </div>

                {/* ── Publish toggle + sort + link ── */}
                <div className="px-6 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div
                      className="relative flex-shrink-0"
                      style={{
                        width: "36px",
                        height: "20px",
                        borderRadius: "999px",
                        background: ed.is_published ? t.ink(0.8) : t.ink(0.1),
                        transition: "background 0.2s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => updateField("is_published", !ed.is_published)}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          left: ed.is_published ? "18px" : "2px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "999px",
                          background: t.cream,
                          transition: "left 0.2s ease",
                          boxShadow: `0 1px 3px ${t.ink(0.15)}`,
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(ed.is_published ? 0.7 : 0.35) }}>
                      {ed.is_published ? "Published" : "Draft"}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label style={{ ...labelStyle, marginBottom: 0, fontSize: "9px" }}>Order</label>
                    <input
                      type="number"
                      value={ed.sort_order}
                      onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)}
                      style={{ ...inputStyle, width: "60px", textAlign: "center", padding: "6px 8px", fontSize: "13px" }}
                    />
                  </div>
                </div>

                {/* ── Issue + Outcome ── */}
                <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Issue</label>
                    <input value={ed.issue} onChange={(e) => updateField("issue", e.target.value)} style={inputStyle} placeholder="One-line problem statement" />
                  </div>
                  <div>
                    <label style={labelStyle}>Outcome</label>
                    <input value={ed.outcome} onChange={(e) => updateField("outcome", e.target.value)} style={inputStyle} placeholder="One-line result" />
                  </div>
                </div>

                {/* ── Link to full article ── */}
                <div className="px-6">
                  <label style={labelStyle} className="flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3" /> Link to Full Article (optional)
                  </label>
                  <ArticlePicker
                    value={ed.link_url || null}
                    onChange={(url) => updateField("link_url", url)}
                  />
                  <p className="mt-1.5" style={{ fontFamily: t.sans, fontSize: "11px", color: t.ink(0.25) }}>
                    If set, a "Read the full report" link appears in the timeline overlay header.
                  </p>
                </div>

                {/* ═══ Timeline phases ═══ */}
                <div className="px-6">
                  <div className="flex items-center justify-between mb-4">
                    <label style={{ ...labelStyle, marginBottom: 0, fontSize: "11px" }}>Timeline Phases</label>
                    <div className="flex items-center gap-2">
                      {(!ed.phases || ed.phases.length === 0) && (
                        <button
                          onClick={loadStarters}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all"
                          style={{
                            fontFamily: t.sans,
                            fontWeight: 600,
                            color: t.ink(0.5),
                            border: `1px solid ${t.ink(0.12)}`,
                            background: t.ink(0.03),
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.06); }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = t.ink(0.03); }}
                        >
                          Load Suggested Template
                        </button>
                      )}
                      <button
                        onClick={addPhase}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] transition-colors"
                        style={{
                          fontFamily: t.sans,
                          fontWeight: 600,
                          color: t.ink(0.5),
                          border: `1px solid ${t.ink(0.1)}`,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.05); }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Plus className="w-3 h-3" /> Add Phase
                      </button>
                    </div>
                  </div>

                  {(!ed.phases || ed.phases.length === 0) ? (
                    <div
                      className="text-center py-12 rounded-2xl"
                      style={{ border: `2px dashed ${t.ink(0.06)}`, background: t.ink(0.01) }}
                    >
                      <p style={{ fontFamily: t.sans, fontSize: "14px", color: t.ink(0.3) }}>
                        No phases yet
                      </p>
                      <p className="mt-1" style={{ fontFamily: t.sans, fontSize: "12px", color: t.ink(0.2) }}>
                        Click "Load Suggested Template" to start with 6 standard phases, or add your own.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Vertical rail line */}
                      <div
                        className="absolute"
                        style={{
                          left: "19px",
                          top: "28px",
                          bottom: "28px",
                          width: "2px",
                          background: `linear-gradient(to bottom, ${t.ink(0.06)}, ${t.ink(0.12)}, ${t.ink(0.06)})`,
                          borderRadius: "999px",
                        }}
                      />

                      <div className="flex flex-col gap-3">
                        {ed.phases.map((phase, pi) => {
                          const isResults = pi === (ed.phases?.length ?? 0) - 1;
                          const isDragOver = dragOverIdx === pi;

                          return (
                            <div
                              key={pi}
                              draggable
                              onDragStart={() => handleDragStart(pi)}
                              onDragOver={(e) => handleDragOver(e, pi)}
                              onDrop={() => handleDrop(pi)}
                              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                              className="relative rounded-xl transition-all"
                              style={{
                                marginLeft: "40px",
                                border: `1px solid ${isDragOver ? t.ink(0.2) : t.ink(0.06)}`,
                                background: isDragOver ? t.ink(0.04) : isResults ? t.ink(0.025) : t.ink(0.01),
                                transition: "all 0.15s ease",
                              }}
                            >
                              {/* Node on the rail */}
                              <div
                                className="absolute"
                                style={{
                                  left: "-28px",
                                  top: "18px",
                                  width: "14px",
                                  height: "14px",
                                  borderRadius: "999px",
                                  background: t.cream,
                                  border: `2px solid ${t.ink(isResults ? 0.35 : 0.15)}`,
                                  zIndex: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "999px",
                                    background: t.ink(isResults ? 0.35 : 0.12),
                                  }}
                                />
                              </div>

                              <div className="p-4 space-y-3">
                                {/* Phase header */}
                                <div className="flex items-center gap-2">
                                  <GripVertical
                                    className="w-4 h-4 flex-shrink-0 cursor-grab active:cursor-grabbing"
                                    style={{ color: t.ink(0.15) }}
                                  />
                                  <span
                                    style={{
                                      fontFamily: t.sans,
                                      fontSize: "clamp(40px, 4vw, 56px)",
                                      fontWeight: 800,
                                      color: t.ink(0.04),
                                      lineHeight: 1,
                                      letterSpacing: "-0.04em",
                                      userSelect: "none",
                                      position: "absolute",
                                      right: "16px",
                                      top: "8px",
                                    }}
                                  >
                                    {String(pi + 1).padStart(2, "0")}
                                  </span>
                                  <input
                                    value={phase.title}
                                    onChange={(e) => updatePhase(pi, "title", e.target.value)}
                                    placeholder="Phase title"
                                    style={{
                                      fontFamily: t.sans,
                                      fontSize: "15px",
                                      fontWeight: 700,
                                      color: t.ink(0.8),
                                      background: "transparent",
                                      border: "none",
                                      padding: "4px 8px",
                                      flex: 1,
                                      outline: "none",
                                      letterSpacing: "-0.01em",
                                    }}
                                  />
                                  <button
                                    onClick={() => removePhase(pi)}
                                    className="p-1.5 rounded-lg transition-all flex-shrink-0 opacity-30 hover:opacity-100"
                                    style={{ color: t.ink(0.4) }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; e.currentTarget.style.background = "hsl(0 60% 50% / 0.06)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.4); e.currentTarget.style.background = "transparent"; }}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Date + Description */}
                                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 pl-6">
                                  <div>
                                    <label style={labelStyle}>Date</label>
                                    <input
                                      value={phase.date || ""}
                                      onChange={(e) => updatePhase(pi, "date", e.target.value)}
                                      placeholder="e.g. Jan–Mar 2023"
                                      style={{ ...inputStyle, fontSize: "12px" }}
                                    />
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                      value={phase.description}
                                      onChange={(e) => updatePhase(pi, "description", e.target.value)}
                                      rows={2}
                                      style={{ ...inputStyle, resize: "vertical", lineHeight: "1.65" }}
                                    />
                                  </div>
                                </div>

                                {/* Stats */}
                                <div className="pl-6">
                                  <div className="flex items-center gap-2 mb-2">
                                    <label style={{ ...labelStyle, marginBottom: 0, fontSize: "9px" }}>Stats (optional)</label>
                                    <button
                                      onClick={() => addStat(pi)}
                                      className="text-[10px] px-2 py-0.5 rounded-full transition-colors"
                                      style={{ fontFamily: t.sans, color: t.ink(0.35), border: `1px solid ${t.ink(0.08)}` }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.05); }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      + Stat
                                    </button>
                                  </div>
                                  {phase.stats && phase.stats.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {phase.stats.map((stat, si) => (
                                        <div
                                          key={si}
                                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
                                          style={{ background: t.ink(0.04), border: `1px solid ${t.ink(0.06)}` }}
                                        >
                                          <input
                                            value={stat.value}
                                            onChange={(e) => updateStat(pi, si, "value", e.target.value)}
                                            placeholder="40K"
                                            style={{
                                              fontFamily: t.sans, width: "70px", padding: "2px 6px",
                                              fontSize: "14px", fontWeight: 700, color: t.ink(0.8),
                                              background: "transparent", border: "none", outline: "none",
                                            }}
                                          />
                                          <input
                                            value={stat.label}
                                            onChange={(e) => updateStat(pi, si, "label", e.target.value)}
                                            placeholder="Label"
                                            style={{
                                              fontFamily: t.sans, width: "90px", padding: "2px 6px",
                                              fontSize: "12px", color: t.ink(0.5),
                                              background: "transparent", border: "none", outline: "none",
                                            }}
                                          />
                                          <button
                                            onClick={() => removeStat(pi, si)}
                                            className="p-0.5 opacity-30 hover:opacity-100 transition-opacity"
                                            style={{ color: t.ink(0.4) }}
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add phase node at end of rail */}
                      <div className="relative mt-3" style={{ marginLeft: "40px" }}>
                        <div
                          className="absolute"
                          style={{
                            left: "-28px",
                            top: "10px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "999px",
                            border: `2px dashed ${t.ink(0.1)}`,
                            background: t.cream,
                            zIndex: 2,
                          }}
                        />
                        <button
                          onClick={addPhase}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] transition-all w-full justify-center"
                          style={{
                            fontFamily: t.sans,
                            fontWeight: 600,
                            color: t.ink(0.3),
                            border: `1px dashed ${t.ink(0.1)}`,
                            background: "transparent",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.03); e.currentTarget.style.color = t.ink(0.5); }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.ink(0.3); }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Phase
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Action bar ── */}
                <div className="px-6 flex items-center gap-3 pt-2">
                  <button
                    onClick={() => editingStudy && saveMutation.mutate(editingStudy)}
                    disabled={!dirty || saveMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm transition-all disabled:opacity-30"
                    style={{
                      fontFamily: t.sans,
                      color: t.cream,
                      background: t.ink(1),
                    }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveMutation.isPending ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this case study permanently?")) deleteMutation.mutate(study.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm transition-all"
                    style={{
                      fontFamily: t.sans,
                      color: t.ink(0.35),
                      border: `1px solid ${t.ink(0.08)}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; e.currentTarget.style.borderColor = "hsl(0 60% 50% / 0.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.35); e.currentTarget.style.borderColor = t.ink(0.08); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add new case study */}
      <button
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending}
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] transition-all mt-2"
        style={{
          fontFamily: t.sans,
          fontWeight: 600,
          color: t.ink(0.35),
          border: `1px dashed ${t.ink(0.1)}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.ink(0.03); e.currentTarget.style.color = t.ink(0.6); }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.ink(0.35); }}
      >
        <Plus className="w-4 h-4" /> Add Case Study
      </button>
    </div>
  );
};

export default CaseStudyEditor;
