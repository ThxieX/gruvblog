// ============================================================================
// Blog Data Access Layer
// ============================================================================
// Re-exports generated data and provides query utilities.
// All data is statically generated at build time.

import {
  posts as generatedPosts,
  categories as generatedCategories,
  tags as generatedTags,
  getPostBySlug,
} from './generated'

// Import and re-export types
import type { PostMeta, Post, Category } from './blog-types'
export type { PostMeta, Post, Category }

// ============================================================================
// Utilities
// ============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ============================================================================
// Query Functions (Sync - uses metadata only)
// ============================================================================

export function getPosts() {
  return generatedPosts
}

export function getCategories() {
  return generatedCategories
}

export function getTags() {
  return generatedTags
}

export function getPostMetaBySlug(slug: string) {
  return generatedPosts.find(post => post.slug === slug)
}

export function getPostsByCategory(categorySlug: string) {
  return generatedPosts.filter(post =>
    post.category === categorySlug ||
    post.categories.some(cat => slugify(cat) === categorySlug)
  )
}

export function getPostsByTag(tag: string) {
  return generatedPosts.filter(post =>
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

export function getRecentPosts(count: number = 5) {
  return generatedPosts.slice(0, count)
}

/**
 * Get related posts based on category and tag overlap
 * Fallback: if no related posts found, returns latest posts
 * 
 * @returns { posts: PostMeta[], isRelated: boolean }
 */
export function getRelatedPosts(
  currentSlug: string,
  currentCategories: string[],
  currentTags: string[],
  limit: number = 3
): { posts: PostMeta[]; isRelated: boolean } {
  const otherPosts = generatedPosts.filter(p => p.slug !== currentSlug)
  
  if (otherPosts.length === 0) {
    return { posts: [], isRelated: false }
  }

  // Score each post based on category and tag overlap
  const scoredPosts = otherPosts.map(post => {
    let score = 0
    
    // Category match (higher weight)
    const categoryOverlap = post.categories.filter(cat => 
      currentCategories.some(c => c.toLowerCase() === cat.toLowerCase())
    ).length
    score += categoryOverlap * 3
    
    // Tag match
    const tagOverlap = post.tags.filter(tag =>
      currentTags.some(t => t.toLowerCase() === tag.toLowerCase())
    ).length
    score += tagOverlap * 2
    
    return { post, score }
  })

  // Sort by score (desc), then by date (desc) for same score
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
  })

  // Check if we have any related posts (score > 0)
  const hasRelated = scoredPosts[0]?.score > 0

  if (hasRelated) {
    // Return posts with score > 0, up to limit
    const relatedPosts = scoredPosts
      .filter(item => item.score > 0)
      .slice(0, limit)
      .map(item => item.post)
    
    return { posts: relatedPosts, isRelated: true }
  }

  // Fallback: return latest posts
  return { 
    posts: otherPosts.slice(0, limit), 
    isRelated: false 
  }
}

// ============================================================================
// Async Query Functions (Loads full post content)
// ============================================================================

export { getPostBySlug }

// ============================================================================
// Static Generation Helpers
// ============================================================================

export function getAllPostSlugs() {
  return generatedPosts.map(post => ({ slug: post.slug }))
}

export function getAllCategorySlugs() {
  return generatedCategories.map(category => ({ slug: category.slug }))
}

export function getAllTagSlugs() {
  return generatedTags.map(tag => ({ slug: encodeURIComponent(tag) }))
}
