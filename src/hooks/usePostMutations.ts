import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function friendlyError(msg: string): string {
  if (msg.includes("check constraint")) return "Save failed — post type not allowed by database.";
  return msg;
}

export type PostFormData = {
  title: string;
  slug: string;
  type: string;
  capability: string;
  excerpt: string | null;
  content: string | null;
  hero_image_url: string | null;
  content_blocks: unknown[] | null;
  stats: unknown[] | null;
  password: string | null;
  is_published: boolean;
  published_at: string | null;
  is_featured: boolean;
  sector_label: string | null;
  featured_stat: string | null;
};

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PostFormData) => {
      const { data: post, error } = await supabase
        .from("capability_posts")
        .insert({
          ...data,
          content_blocks: data.content_blocks as any,
          stats: data.stats as any,
        })
        .select()
        .single();
      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post created");
    },
    onError: (e: Error) => toast.error(friendlyError(e.message), { id: "post-save-error" }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PostFormData> }) => {
      const { error } = await supabase
        .from("capability_posts")
        .update({
          ...data,
          content_blocks: data.content_blocks as any,
          stats: data.stats as any,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["post"] });
      toast.success("Post saved");
    },
    onError: (e: Error) => toast.error(friendlyError(e.message), { id: "post-save-error" }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("capability_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("capability_posts")
        .update({
          is_published,
          published_at: is_published ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
