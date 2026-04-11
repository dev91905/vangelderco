import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePostMeta, usePostBySlug, usePostHasPassword } from "@/hooks/usePostBySlug";
import { PasswordGateWrapper } from "@/components/PasswordGate";
import BlogPostView from "@/components/blog/BlogPostView";
import CaseStudyView from "@/components/casestudy/CaseStudyView";
import AtmosphericLayout from "@/components/AtmosphericLayout";
import { t } from "@/lib/theme";

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: meta, isLoading: metaLoading, error: metaError } = usePostMeta(slug);
  const { data: passwordInfo, isLoading: passwordLoading } = usePostHasPassword(slug);

  const requiresPassword = !!passwordInfo?.requiresPassword;
  const [unlocked, setUnlocked] = useState(false);

  const sessionKey = `gate:${slug}`;
  const sessionUnlocked = typeof window !== "undefined" && sessionStorage.getItem(sessionKey) === "1";
  const effectivelyUnlocked = unlocked || sessionUnlocked || !requiresPassword;

  const { data: post, isLoading: postLoading } = usePostBySlug(slug, effectivelyUnlocked);

  if (metaLoading || passwordLoading) {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center min-h-dvh">
          <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Loading...</span>
        </div>
      </AtmosphericLayout>
    );
  }

  if (metaError || !meta) {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center min-h-dvh">
          <span className="text-sm" style={{ fontFamily: t.sans, color: t.error(0.5) }}>Post not found</span>
        </div>
      </AtmosphericLayout>
    );
  }

  if (requiresPassword && !effectivelyUnlocked) {
    return (
      <PasswordGateWrapper slug={slug || ""} title={meta.title} heroImageUrl={meta.hero_image_url} capability={meta.capability} requiresPassword={true} onUnlock={() => setUnlocked(true)}>
        <div />
      </PasswordGateWrapper>
    );
  }

  if (postLoading || !post) {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center min-h-dvh">
          <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Loading...</span>
        </div>
      </AtmosphericLayout>
    );
  }

  const contentBlocks = post.content_blocks as any[] | null;

  if (post.type === "field-note") {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center min-h-dvh">
          <div className="max-w-xl w-full px-6 py-20 space-y-8">
            <div className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>
              Field Note — {post.capability?.replace(/-/g, " ")}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'DM Sans', sans-serif", color: t.ink(0.9) }}>
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-[15px] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", color: t.ink(0.5), lineHeight: 1.7 }}>
                {post.excerpt}
              </p>
            )}
            {(post as any).featured_stat && (
              <div className="pt-4" style={{ borderTop: `1px solid ${t.ink(0.06)}` }}>
                <span className="text-[10px] tracking-[0.15em] uppercase block mb-2" style={{ fontFamily: "'DM Sans', sans-serif", color: t.ink(0.25) }}>Impact</span>
                <span className="text-[15px]" style={{ fontFamily: "'DM Sans', sans-serif", color: "hsl(var(--foreground))" }}>
                  {(post as any).featured_stat}
                </span>
              </div>
            )}
          </div>
        </div>
      </AtmosphericLayout>
    );
  }

  return post.type === "case-study" ? (
    <CaseStudyView post={{ id: post.id, title: post.title, excerpt: post.excerpt, capability: post.capability, published_at: post.published_at, hero_image_url: post.hero_image_url, content_blocks: contentBlocks }} />
  ) : (
    <BlogPostView post={{ title: post.title, excerpt: post.excerpt, capability: post.capability, published_at: post.published_at, hero_image_url: post.hero_image_url, content_blocks: contentBlocks }} />
  );
};

export default PostDetail;
