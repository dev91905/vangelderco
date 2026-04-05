import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { slug, password, action } = body;

    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // "check" mode: just return whether a password is required (no secrets exposed)
    if (action === "check") {
      const { data: post } = await supabase
        .from("capability_posts")
        .select("password")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      const hasPostPassword = !!post?.password;

      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "global_article_password")
        .maybeSingle();

      const hasGlobalPassword = !!setting?.value;

      return new Response(
        JSON.stringify({ requiresPassword: hasPostPassword || hasGlobalPassword }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // "verify" mode (default): check the supplied password
    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ error: "password is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: post, error: postError } = await supabase
      .from("capability_posts")
      .select("password")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (postError) {
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!post) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check post-level password first
    if (post.password) {
      const valid = password === post.password;
      return new Response(
        JSON.stringify({ valid }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check global password
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "global_article_password")
      .maybeSingle();

    if (setting?.value) {
      const valid = password === setting.value;
      return new Response(
        JSON.stringify({ valid }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No password required
    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
