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

/** Check if a post requires a password (without revealing the password) */
export function usePostHasPassword(slug: string | undefined) {
  return useQuery({
    queryKey: ["post-has-password", slug],
    queryFn: async () => {
      if (!slug) return { hasPostPassword: false, hasGlobalPassword: false };
      
      // Check if post has a password set (just boolean, not the value)
      const { data: post } = await supabase
        .from("capability_posts")
        .select("password")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      const hasPostPassword = !!post?.password;

      // Check if global password is set
      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "global_article_password")
        .maybeSingle();

      const hasGlobalPassword = !!setting?.value;

      return { hasPostPassword, hasGlobalPassword };
    },
    enabled: !!slug,
  });
}
