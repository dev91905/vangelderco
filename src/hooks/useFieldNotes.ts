import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FieldNote = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  sector_label: string | null;
  featured_stat: string | null;
  capability: string;
  published_at: string | null;
  link_url: string | null;
};

export function useFieldNotes() {
  return useQuery({
    queryKey: ["field-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capability_posts")
        .select("id, title, slug, excerpt, sector_label, featured_stat, capability, published_at, link_url")
        .eq("type", "field-note")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as FieldNote[];
    },
  });
}
