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
      const { data, error } = await supabase
        .from("capability_posts")
        .select("title, slug, capability, stats")
        .eq("is_published", true)
        .not("stats", "is", null);

      if (error) throw error;

      const aggregated: AggregatedStat[] = [];

      for (const post of data ?? []) {
        const stats = post.stats as Array<{
          label: string;
          description: string;
          visible?: boolean;
        }> | null;

        if (!Array.isArray(stats)) continue;

        for (const stat of stats) {
          if (stat.visible === false) continue;
          aggregated.push({
            label: stat.label,
            description: stat.description,
            sourceTitle: post.title,
            sourceSlug: post.slug,
            sourceCapability: post.capability,
          });
        }
      }

      return aggregated;
    },
    staleTime: 1000 * 60 * 5,
  });
}
