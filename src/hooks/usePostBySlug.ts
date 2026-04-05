import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug");
      const { data, error } = await supabase
        .from("capability_posts")
        .select("id, title, slug, type, capability, excerpt, content, hero_image_url, content_blocks, stats, is_published, published_at, created_at")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Post not found");
      return data;
    },
    enabled: !!slug,
  });
}

/** Check if a post requires a password — uses server-side edge function, never exposes the password */
export function usePostHasPassword(slug: string | undefined) {
  return useQuery({
    queryKey: ["post-has-password", slug],
    queryFn: async () => {
      if (!slug) return { requiresPassword: false };
      
      const { data, error } = await supabase.functions.invoke("verify-post-password", {
        body: { slug, action: "check" },
      });

      if (error) return { requiresPassword: false };
      return { requiresPassword: !!data?.requiresPassword };
    },
    enabled: !!slug,
  });
}
