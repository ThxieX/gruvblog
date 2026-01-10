import type { PostMeta } from '@/lib/blog-types'

/**
 * Build the secondary search corpus for a post.
 *
 * The post's `title` is searched at full weight (passed as `value` to cmdk);
 * everything returned here is searched at a lower weight (see `KEYWORD_WEIGHT`
 * in `./filter`). Title hits therefore always outrank keyword-only hits.
 */
export function postToKeywords(post: PostMeta): string[] {
  return [
    post.category,
    ...post.categories,
    ...post.tags,
    post.excerpt,
    post.aiSummary ?? '',
    post.slug,
  ].filter((v): v is string => Boolean(v))
}
