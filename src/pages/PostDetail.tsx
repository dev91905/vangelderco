import { useParams } from "react-router-dom";
import { usePostBySlug } from "@/hooks/usePostBySlug";
import { useGlobalPassword } from "@/hooks/useSiteSettings";
import { PasswordGateWrapper } from "@/components/PasswordGate";
import BlogPostView from "@/components/blog/BlogPostView";
import CaseStudyView from "@/components/casestudy/CaseStudyView";
import AtmosphericLayout from "@/components/AtmosphericLayout";

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePostBySlug(slug);
  const globalPassword = useGlobalPassword();

  if (isLoading) {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center h-full">
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 0% 100% / 0.2)" }}>Loading...</span>
        </div>
      </AtmosphericLayout>
    );
  }

  if (error || !post) {
    return (
      <AtmosphericLayout>
        <div className="flex items-center justify-center h-full">
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "hsl(0 80% 48% / 0.6)" }}>Post not found</span>
        </div>
      </AtmosphericLayout>
    );
  }

  const contentBlocks = post.content_blocks as any[] | null;
  const stats = post.stats as { label: string; description: string; visible?: boolean }[] | null;
  const postPassword = (post as any).password as string | null;

  const articleContent = post.type === "case-study" ? (
    <CaseStudyView post={{ title: post.title, capability: post.capability, published_at: post.published_at, hero_image_url: post.hero_image_url, content_blocks: contentBlocks, stats }} />
  ) : (
    <BlogPostView post={{ title: post.title, capability: post.capability, published_at: post.published_at, hero_image_url: post.hero_image_url, content_blocks: contentBlocks }} />
  );

  return (
    <PasswordGateWrapper
      postPassword={postPassword}
      globalPassword={globalPassword}
      slug={slug || ""}
      title={post.title}
      heroImageUrl={post.hero_image_url}
      capability={post.capability}
    >
      {articleContent}
    </PasswordGateWrapper>
  );
};

export default PostDetail;
