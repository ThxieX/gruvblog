// ============================================================================
// RSS Feed Route Handler
// ============================================================================
// GET /rss.xml - Returns RSS 2.0 compliant XML feed
// Statically generated at build time, revalidated every hour.

import { getPosts } from '@/lib/blog-data'
import { generateRssFeed } from '@/lib/rss'

export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const posts = getPosts()
  const feed = generateRssFeed(posts)

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
