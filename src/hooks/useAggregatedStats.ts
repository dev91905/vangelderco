import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AggregatedStat {
  label: string;
  description: string;
  sourceTitle: string;
  sourceSlug: string | null;
  sourceCapability: string;
  sourceType: string;
  sourceCreatedAt: string;
}

const MAX_STATS = 6;

export function useAggregatedStats() {
  return useQuery({
    queryKey: ["aggregated-stats"],
    queryFn: async () => {
      const { data: stats, error } = await supabase
        .from("impact_stats")
        .select("label, description, post_id, case_study_id, sort_order")
        .eq("visible", true)
        .order("sort_order");

      if (error) throw error;
      if (!stats?.length) return [];

      const postIds = [...new Set(stats.filter(s => s.post_id).map(s => s.post_id!))];
      const csIds = [...new Set(stats.filter(s => s.case_study_id).map(s => s.case_study_id!))];

      const [postsRes, csRes] = await Promise.all([
        postIds.length > 0
          ? supabase.from("capability_posts").select("id, title, slug, capability, created_at").in("id", postIds)
          : Promise.resolve({ data: [], error: null }),
        csIds.length > 0
          ? supabase.from("deck_case_studies").select("id, name, link_url, created_at").in("id", csIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const postMap = new Map((postsRes.data ?? []).map(p => [p.id, p]));
      const csMap = new Map((csRes.data ?? []).map(c => [c.id, c]));

      // Build all stats with source info
      type RawStat = AggregatedStat & { sourceId: string; sortOrder: number };
      const all: RawStat[] = [];

      for (const stat of stats) {
        const post = stat.post_id ? postMap.get(stat.post_id) : null;
        const cs = stat.case_study_id ? csMap.get(stat.case_study_id) : null;

        if (post) {
          all.push({
            label: stat.label,
            description: stat.description,
            sourceTitle: post.title,
            sourceSlug: post.slug,
            sourceCapability: post.capability,
            sourceCreatedAt: post.created_at,
            sourceId: post.id,
            sortOrder: stat.sort_order,
          });
        } else if (cs) {
          all.push({
            label: stat.label,
            description: stat.description,
            sourceTitle: cs.name,
            sourceSlug: cs.link_url,
            sourceCapability: "deck",
            sourceCreatedAt: cs.created_at,
            sourceId: cs.id,
            sortOrder: stat.sort_order,
          });
        }
      }

      // Round 1: best stat per source (lowest sort_order)
      const bestPerSource = new Map<string, RawStat>();
      for (const s of all) {
        const existing = bestPerSource.get(s.sourceId);
        if (!existing || s.sortOrder < existing.sortOrder) {
          bestPerSource.set(s.sourceId, s);
        }
      }

      // Sort by recency, take as many as we have
      const curated = [...bestPerSource.values()]
        .sort((a, b) => new Date(b.sourceCreatedAt).getTime() - new Date(a.sourceCreatedAt).getTime());

      // Round 2: fill remaining slots via round-robin across sources
      if (curated.length < MAX_STATS) {
        const usedKeys = new Set(curated.map(s => s.label + s.sourceId));
        const remaining = all
          .filter(s => !usedKeys.has(s.label + s.sourceId))
          .sort((a, b) => a.sortOrder - b.sortOrder);

        while (curated.length < MAX_STATS && remaining.length > 0) {
          const sourcesUsedCount = new Map<string, number>();
          for (const s of curated) {
            sourcesUsedCount.set(s.sourceId, (sourcesUsedCount.get(s.sourceId) || 0) + 1);
          }
          remaining.sort((a, b) => {
            const aCount = sourcesUsedCount.get(a.sourceId) || 0;
            const bCount = sourcesUsedCount.get(b.sourceId) || 0;
            return aCount - bCount || a.sortOrder - b.sortOrder;
          });
          curated.push(remaining.shift()!);
        }
      }

      // Strip internal fields, cap at MAX_STATS
      return curated.slice(0, MAX_STATS).map(({ sourceId, sortOrder, ...rest }) => rest);
    },
    staleTime: 1000 * 60 * 5,
  });
}
