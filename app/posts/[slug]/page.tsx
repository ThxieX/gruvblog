import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Tag as TagIcon, Folder, Sparkles } from 'lucide-react'
import { getRelatedPosts, getAllPostSlugs, getPostBySlug } from '@/lib/blog-data'
import { siteConfig } from '@/lib/config'
import { GitHubComments } from '@/components/github-comments'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { TableOfContents } from '@/components/table-of-contents'
import { BackToPostsLink, AiSummaryLabel } from '@/components/post-detail-i18n'
import { RelatedArticles } from '@/components/related-articles'
import { ArticleContainer } from '@/components/article-container'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPostSlugs()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [siteConfig.author.name],
      tags: post.tags,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { posts: relatedPosts, isRelated } = getRelatedPosts(
    post.slug,
    post.categories,
    post.tags,
    3
  )

  // Meta content for the article header (passed to ArticleContainer)
  const metaContent = (
    <>
      <span className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        {new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {post.readingTime}
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1">
        <Folder className="h-4 w-4" />
        {post.categories.map((cat, idx) => (
          <span key={cat}>
            <Link
              href={`/posts?categories=${encodeURIComponent(cat.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5-]/g, '').replace(/\s+/g, '-'))}`}
              className="hover:text-primary transition-colors"
            >
              {cat}
            </Link>
            {idx < post.categories.length - 1 && <span className="mx-1">/</span>}
          </span>
        ))}
      </span>
    </>
  )

  return (
    <>
      <TableOfContents content={post.content} />

      <ArticleContainer metaContent={metaContent}>
        {/* Back link */}
        <BackToPostsLink />

        {/* Article Header */}
        <header className="mb-10">
          <h1 
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-balance"
            style={{ color: 'var(--prose-h1)' }}
          >
            {post.title}
          </h1>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mt-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/posts?tags=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <TagIcon className="h-3 w-3" />
                {tag}
              </Link>
            ))}
          </div>
        </header>

        {/* AI Summary */}
        {post.aiSummary && (
          <div className="mb-10 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              <AiSummaryLabel />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {post.aiSummary}
            </p>
          </div>
        )}

        {/* Article Content with Syntax Highlighting */}
        <MarkdownRenderer content={post.content} />

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          {/* Related Posts */}
          <RelatedArticles posts={relatedPosts} isRelated={isRelated} />

          {/* Comments */}
          <GitHubComments className="mt-12" />
        </footer>
      </ArticleContainer>
    </>
  )
}
