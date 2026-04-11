import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AggregatedStat {
  label: string;
  description: string;
  sourceTitle: string;
  sourceSlug: string | null;
  sourceCapability: string;
}

export function useAggregatedStats() {
  return useQuery({
    queryKey: ["aggregated-stats"],
    queryFn: async () => {
      // Fetch all visible impact stats with their source info
      const { data: stats, error } = await supabase
        .from("impact_stats")
        .select("label, description, post_id, case_study_id")
        .eq("visible", true)
        .order("sort_order");

      if (error) throw error;
      if (!stats?.length) return [];

      // Gather unique post/case-study IDs for source info
      const postIds = [...new Set(stats.filter(s => s.post_id).map(s => s.post_id!))] ;
      const csIds = [...new Set(stats.filter(s => s.case_study_id).map(s => s.case_study_id!))];

      const [postsRes, csRes] = await Promise.all([
        postIds.length > 0
          ? supabase.from("capability_posts").select("id, title, slug, capability").in("id", postIds)
          : Promise.resolve({ data: [], error: null }),
        csIds.length > 0
          ? supabase.from("deck_case_studies").select("id, name, link_url").in("id", csIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const postMap = new Map((postsRes.data ?? []).map(p => [p.id, p]));
      const csMap = new Map((csRes.data ?? []).map(c => [c.id, c]));

      const aggregated: AggregatedStat[] = [];

      for (const stat of stats) {
        // Prefer post source, fall back to case study
        const post = stat.post_id ? postMap.get(stat.post_id) : null;
        const cs = stat.case_study_id ? csMap.get(stat.case_study_id) : null;

        if (post) {
          aggregated.push({
            label: stat.label,
            description: stat.description,
            sourceTitle: post.title,
            sourceSlug: post.slug,
            sourceCapability: post.capability,
          });
        } else if (cs) {
          aggregated.push({
            label: stat.label,
            description: stat.description,
            sourceTitle: cs.name,
            sourceSlug: cs.link_url,
            sourceCapability: "deck",
          });
        }
      }

      // Deduplicate by label+description
      const seen = new Set<string>();
      return aggregated.filter(a => {
        const key = `${a.label}::${a.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}
