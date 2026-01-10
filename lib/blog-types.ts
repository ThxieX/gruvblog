// ============================================================================
// Blog Data Types
// ============================================================================

/**
 * Post metadata (used for listings, search, etc.)
 * Small footprint - safe to load all at once
 */
export interface PostMeta {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  categories: string[]
  category: string
  tags: string[]
  aiSummary?: string | null
}

/**
 * Full post with content (loaded on demand)
 */
export interface Post extends PostMeta {
  content: string
}

/**
 * Category with post count
 */
export interface Category {
  slug: string
  name: string
  description: string
  count: number
}
