import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FeaturedPost = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  sector_label: string | null;
  featured_stat: string | null;
  type: string;
  capability: string;
  published_at: string | null;
};

export function useFeaturedPosts() {
  return useQuery({
    queryKey: ["featured-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capability_posts")
        .select("id, title, slug, excerpt, sector_label, featured_stat, type, capability, published_at")
        .eq("is_featured", true)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data as FeaturedPost[];
    },
  });
}
