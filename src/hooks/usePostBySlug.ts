import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Lightweight metadata-only query — no content_blocks, content, or stats */
export function usePostMeta(slug: string | undefined) {
  return useQuery({
    queryKey: ["post-meta", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug");
      const { data, error } = await supabase
        .from("capability_posts")
        .select("id, title, slug, type, capability, excerpt, hero_image_url, published_at")
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

/** Full content query — use with enabled flag to gate behind password */
export function usePostBySlug(slug: string | undefined, enabled: boolean = true) {
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
    enabled: !!slug && enabled,
  });
}

/** Check if a post requires a password — fails CLOSED (assumes password required on error) */
export function usePostHasPassword(slug: string | undefined) {
  return useQuery({
    queryKey: ["post-has-password", slug],
    queryFn: async () => {
      if (!slug) return { requiresPassword: false };
      
      const { data, error } = await supabase.functions.invoke("verify-post-password", {
        body: { slug, action: "check" },
      });

      // Fail closed: if anything goes wrong, assume password is required
      if (error) return { requiresPassword: true };
      return { requiresPassword: !!data?.requiresPassword };
    },
    enabled: !!slug,
  });
}
