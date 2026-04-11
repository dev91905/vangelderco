import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/theme";
import { Plus, X, GripVertical, ChevronDown, ChevronRight, Save, Trash2, Eye, EyeOff } from "lucide-react";
import type { CasePhase } from "@/components/deck/CaseTimelineOverlay";

type CaseStudyRow = {
  id: string;
  name: string;
  issue: string;
  outcome: string;
  sort_order: number;
  phases: CasePhase[] | null;
  is_published: boolean;
  created_at: string;
};

const CaseStudyEditor: React.FC = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStudy, setEditingStudy] = useState<CaseStudyRow | null>(null);
  const [dirty, setDirty] = useState(false);

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies-admin"] });
      queryClient.invalidateQueries({ queryKey: ["deck-case-studies"] });
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
          phases: null,
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

  // Load study into editing state when expanded
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

  const inputStyle: React.CSSProperties = {
    fontFamily: t.sans,
    fontSize: "14px",
    color: t.ink(0.8),
    background: t.ink(0.02),
    border: `1px solid ${t.ink(0.08)}`,
    borderRadius: "8px",
    padding: "10px 12px",
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: t.sans,
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: t.ink(0.35),
    marginBottom: "4px",
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
            {/* Row header */}
            <button
              onClick={() => {
                setExpandedId(isExpanded ? null : study.id);
                setDirty(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left transition-all rounded-lg"
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

            {/* Expanded editor */}
            {isExpanded && ed && (
              <div className="px-4 pb-5 pt-2 space-y-5" style={{ background: t.ink(0.02), borderRadius: "0 0 12px 12px" }}>
                {/* Meta fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input value={ed.name} onChange={(e) => updateField("name", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Outcome</label>
                    <input value={ed.outcome} onChange={(e) => updateField("outcome", e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Issue</label>
                  <input value={ed.issue} onChange={(e) => updateField("issue", e.target.value)} style={inputStyle} />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ed.is_published}
                      onChange={(e) => updateField("is_published", e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.6) }}>Published</span>
                  </label>
                  <div className="flex-1" />
                  <label style={labelStyle} className="!mb-0">Sort Order</label>
                  <input
                    type="number"
                    value={ed.sort_order}
                    onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)}
                    style={{ ...inputStyle, width: "70px", textAlign: "center" }}
                  />
                </div>

                {/* Phases */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Timeline Phases</label>
                    <button
                      onClick={addPhase}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-colors"
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

                  {(!ed.phases || ed.phases.length === 0) ? (
                    <p className="text-center py-6" style={{ fontFamily: t.sans, fontSize: "13px", color: t.ink(0.25) }}>
                      No phases yet. Add one to build the timeline.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {ed.phases.map((phase, pi) => (
                        <div
                          key={pi}
                          className="rounded-xl p-4 space-y-3"
                          style={{ border: `1px solid ${t.ink(0.06)}`, background: t.ink(0.01) }}
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.ink(0.15) }} />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ fontFamily: t.sans, color: t.ink(0.35), background: t.ink(0.05) }}>
                              {pi + 1}
                            </span>
                            <input
                              value={phase.title}
                              onChange={(e) => updatePhase(pi, "title", e.target.value)}
                              placeholder="Phase title"
                              style={{ ...inputStyle, fontWeight: 700, border: "none", background: "transparent", padding: "4px 8px" }}
                            />
                            <button
                              onClick={() => removePhase(pi)}
                              className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                              style={{ color: t.ink(0.2) }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; e.currentTarget.style.background = "hsl(0 60% 50% / 0.08)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = t.ink(0.2); e.currentTarget.style.background = "transparent"; }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3">
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
                                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
                              />
                            </div>
                          </div>

                          {/* Stats for this phase */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <label style={{ ...labelStyle, marginBottom: 0, fontSize: "9px" }}>Stats (optional)</label>
                              <button
                                onClick={() => addStat(pi)}
                                className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
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
                                  <div key={si} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: t.ink(0.04) }}>
                                    <input
                                      value={stat.value}
                                      onChange={(e) => updateStat(pi, si, "value", e.target.value)}
                                      placeholder="40K"
                                      style={{ ...inputStyle, width: "60px", padding: "4px 6px", fontSize: "12px", fontWeight: 700, background: "transparent", border: "none" }}
                                    />
                                    <input
                                      value={stat.label}
                                      onChange={(e) => updateStat(pi, si, "label", e.target.value)}
                                      placeholder="Label"
                                      style={{ ...inputStyle, width: "80px", padding: "4px 6px", fontSize: "11px", background: "transparent", border: "none" }}
                                    />
                                    <button onClick={() => removeStat(pi, si)} className="p-0.5" style={{ color: t.ink(0.2) }}>
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => editingStudy && saveMutation.mutate(editingStudy)}
                    disabled={!dirty || saveMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all disabled:opacity-30"
                    style={{
                      fontFamily: t.sans,
                      color: t.cream,
                      background: t.ink(1),
                    }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveMutation.isPending ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this case study?")) deleteMutation.mutate(study.id);
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

      {/* Add new */}
      <button
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending}
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] transition-all mt-2"
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
