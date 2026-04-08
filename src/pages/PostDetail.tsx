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
        <div className="flex items-center justify-center h-full">
          <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Loading...</span>
        </div>
      </AtmosphericLayout>
    );
  }

  if (metaError || !meta) {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center h-full">
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
        <div className="flex items-center justify-center h-full">
          <span className="text-sm" style={{ fontFamily: t.sans, color: t.ink(0.3) }}>Loading...</span>
        </div>
      </AtmosphericLayout>
    );
  }

  const contentBlocks = post.content_blocks as any[] | null;
  const stats = post.stats as { label: string; description: string; visible?: boolean }[] | null;

  return post.type === "case-study" ? (
    <CaseStudyView post={{ title: post.title, excerpt: post.excerpt, capability: post.capability, published_at: post.published_at, hero_image_url: post.hero_image_url, content_blocks: contentBlocks, stats }} />
  ) : (
    <BlogPostView post={{ title: post.title, excerpt: post.excerpt, capability: post.capability, published_at: post.published_at, hero_image_url: post.hero_image_url, content_blocks: contentBlocks }} />
  );
};

export default PostDetail;
