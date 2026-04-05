import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CapabilityPost = {
  id: string;
  capability: string;
  type: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  published_at: string | null;
  created_at: string;
};

export function useCapabilityPosts(capability: string) {
  return useQuery({
    queryKey: ["capability-posts", capability],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capability_posts")
        .select("*")
        .eq("capability", capability)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as CapabilityPost[];
    },
  });
}
