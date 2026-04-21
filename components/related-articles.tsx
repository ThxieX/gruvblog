'use client'

import Link from 'next/link'
import { Calendar, Clock, Folder } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import type { PostMeta } from '@/lib/blog-types'

interface RelatedArticlesProps {
  posts: PostMeta[]
  isRelated: boolean
}

export function RelatedArticles({ posts, isRelated }: RelatedArticlesProps) {
  const { t } = useI18n()

  if (posts.length === 0) return null

  const title = isRelated ? t('post.relatedArticles') : t('post.latestArticles')

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--prose-h2)' }}>
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <article className="h-full p-4 rounded-lg border border-border bg-card/50 transition-all duration-200 hover:bg-card hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5">
              {/* Category */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Folder className="h-3 w-3" />
                <span className="truncate">{post.categories[0]}</span>
              </div>
              
              {/* Title */}
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-snug">
                {post.title}
              </h4>
              
              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
