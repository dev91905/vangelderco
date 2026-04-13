import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImpactStat {
  id: string;
  label: string;
  description: string;
  post_id: string | null;
  case_study_id: string | null;
  phase_title: string | null;
  visible: boolean;
  sort_order: number;
}

/** Fetch stats for a capability_post */
export function usePostImpactStats(postId: string | undefined) {
  return useQuery({
    queryKey: ["impact-stats", "post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impact_stats")
        .select("*")
        .eq("post_id", postId!)
        .order("sort_order");
      if (error) throw error;
      return data as ImpactStat[];
    },
    enabled: !!postId,
  });
}

/** Fetch stats for a diagnostic_case_study */
export function useCaseStudyImpactStats(caseStudyId: string | undefined) {
  return useQuery({
    queryKey: ["impact-stats", "case-study", caseStudyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impact_stats")
        .select("*")
        .eq("case_study_id", caseStudyId!)
        .order("sort_order");
      if (error) throw error;
      return data as ImpactStat[];
    },
    enabled: !!caseStudyId,
  });
}

type StatInput = Omit<ImpactStat, "id"> & { id?: string };

/**
 * Sync a set of stats for a given post or case study.
 * Deletes removed stats, upserts existing/new ones.
 */
export function useSyncImpactStats() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      caseStudyId,
      phaseTitle,
      stats,
    }: {
      postId?: string;
      caseStudyId?: string;
      phaseTitle?: string;
      stats: StatInput[];
    }) => {
      // Determine which existing stats to manage
      let query = supabase.from("impact_stats").select("id");
      if (postId) query = query.eq("post_id", postId);
      if (caseStudyId) query = query.eq("case_study_id", caseStudyId);
      if (phaseTitle !== undefined) {
        query = phaseTitle
          ? query.eq("phase_title", phaseTitle)
          : query.is("phase_title", null);
      }

      const { data: existing, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      const existingIds = new Set((existing ?? []).map((r) => r.id));
      const incomingIds = new Set(stats.filter((s) => s.id).map((s) => s.id!));

      // Delete removed stats
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        const { error } = await supabase
          .from("impact_stats")
          .delete()
          .in("id", toDelete);
        if (error) throw error;
      }

      // Upsert remaining
      if (stats.length > 0) {
        const rows = stats.map((s, i) => ({
          ...(s.id ? { id: s.id } : {}),
          label: s.label,
          description: s.description,
          post_id: postId ?? s.post_id ?? null,
          case_study_id: caseStudyId ?? s.case_study_id ?? null,
          phase_title: phaseTitle !== undefined ? (phaseTitle || null) : (s.phase_title ?? null),
          visible: s.visible ?? true,
          sort_order: i,
        }));

        const { error } = await supabase
          .from("impact_stats")
          .upsert(rows as any, { onConflict: "id" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["impact-stats"] });
      qc.invalidateQueries({ queryKey: ["aggregated-stats"] });
    },
  });
}
