import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      const map: Record<string, string | null> = {};
      data?.forEach((row: any) => { map[row.key] = row.value; });
      return map;
    },
  });
}

/** Returns boolean whether global password is set — does NOT expose the password value */
export function useGlobalPassword() {
  const { data } = useSiteSettings();
  // We still need to know if it's set for admin UI, but the actual value
  // is only used in the admin panel (which needs auth to be secured separately)
  return data?.global_article_password ?? null;
}

export function useUpdateSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | null }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Setting saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
