import Link from 'next/link'
import { Calendar, Clock, Tag as TagIcon, Folder } from 'lucide-react'
import type { PostMeta } from '@/lib/blog-data'

interface PostCardProps {
  post: PostMeta
  onCategoryClick?: (category: string) => void
  onTagClick?: (tag: string) => void
}

export function PostCard({ post, onCategoryClick, onTagClick }: PostCardProps) {
  return (
    <article>
      <div className="flex flex-col gap-2">
        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime}
          </span>
          {post.categories && post.categories.length > 0 && (
            <>
              <span className="text-border">·</span>
              {onCategoryClick ? (
                <button
                  onClick={() => onCategoryClick(post.category)}
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  <Folder className="h-3 w-3" />
                  {post.categories[0]}
                </button>
              ) : (
                <Link 
                  href={`/posts?categories=${encodeURIComponent(post.category)}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Folder className="h-3 w-3" />
                  {post.categories[0]}
                </Link>
              )}
            </>
          )}
        </div>

        {/* Title - clickable to post */}
        <Link href={`/posts/${post.slug}`} className="group">
          <h2 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg tracking-tight">
            {post.title}
          </h2>
          {/* Excerpt */}
          <p className="text-muted-foreground leading-relaxed line-clamp-2 mt-2">
            {post.excerpt}
          </p>
        </Link>

        {/* Tags - each clickable to filter or tag page */}
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {post.tags.map((tag) => (
            onTagClick ? (
              <button 
                key={tag}
                onClick={() => onTagClick(tag)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                <TagIcon className="h-2.5 w-2.5" />
                {tag}
              </button>
            ) : (
              <Link 
                key={tag}
                href={`/posts?tags=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <TagIcon className="h-2.5 w-2.5" />
                {tag}
              </Link>
            )
          ))}
        </div>
      </div>
    </article>
  )
}
