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
      // Fetch from both sources in parallel
      const [capRes, deckRes] = await Promise.all([
        supabase
          .from("capability_posts")
          .select("title, slug, capability, stats")
          .eq("is_published", true)
          .not("stats", "is", null),
        supabase
          .from("deck_case_studies")
          .select("name, link_url, phases")
          .eq("is_published", true)
          .not("phases", "is", null),
      ]);

      if (capRes.error) throw capRes.error;
      if (deckRes.error) throw deckRes.error;

      const aggregated: AggregatedStat[] = [];

      // 1. capability_posts stats (label + description format)
      for (const post of capRes.data ?? []) {
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

      // 2. deck_case_studies phase stats (label + value format)
      for (const cs of deckRes.data ?? []) {
        const phases = cs.phases as Array<{
          title?: string;
          stats?: Array<{ label: string; value: string }>;
        }> | null;

        if (!Array.isArray(phases)) continue;

        for (const phase of phases) {
          if (!Array.isArray(phase.stats)) continue;

          for (const stat of phase.stats) {
            // Deduplicate: skip if we already have exact same label+description
            const desc = stat.value;
            const alreadyExists = aggregated.some(
              (a) => a.label === stat.label && a.description === desc
            );
            if (alreadyExists) continue;

            aggregated.push({
              label: stat.label,
              description: desc,
              sourceTitle: cs.name,
              sourceSlug: cs.link_url,
              sourceCapability: "deck",
            });
          }
        }
      }

      return aggregated;
    },
    staleTime: 1000 * 60 * 5,
  });
}
