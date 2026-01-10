// ============================================================================
// RSS Feed Configuration & Generator
// ============================================================================
// Minimal, fast, standards-compliant RSS 2.0 implementation.
// No external dependencies. Pure functions. Type-safe.

import type { PostMeta } from './blog-types'
import { siteConfig } from './config'

// ============================================================================
// Configuration (derived from site config)
// ============================================================================

export const RSS_CONFIG = {
  title: `${siteConfig.author.name} - ${siteConfig.site.title}`,
  description: siteConfig.site.description,
  siteUrl: siteConfig.site.url,
  language: 'en-us',
  managingEditor: `${siteConfig.author.email} (${siteConfig.author.name})`,
  webMaster: `${siteConfig.author.email} (${siteConfig.author.name})`,
  copyright: `Copyright ${new Date().getFullYear()} ${siteConfig.author.name}. All rights reserved.`,
  ttl: 60, // minutes
  maxItems: 50,
} as const

// ============================================================================
// XML Utilities
// ============================================================================

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRFC822(date: string): string {
  return new Date(date).toUTCString()
}

// ============================================================================
// RSS Item Generator
// ============================================================================

function generateItem(post: PostMeta, siteUrl: string): string {
  const postUrl = `${siteUrl}/posts/${post.slug}`
  const categories = post.categories
    .map(cat => `    <category>${escapeXml(cat)}</category>`)
    .join('\n')

  return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <description>${escapeXml(post.excerpt)}</description>
    <pubDate>${toRFC822(post.date)}</pubDate>
${categories}
  </item>`
}

// ============================================================================
// RSS Feed Generator
// ============================================================================

export function generateRssFeed(posts: PostMeta[]): string {
  const { 
    title, 
    description, 
    siteUrl, 
    language, 
    managingEditor,
    webMaster,
    copyright,
    ttl,
    maxItems 
  } = RSS_CONFIG

  const feedUrl = `${siteUrl}/rss.xml`
  const buildDate = new Date().toUTCString()
  
  // Sort by date (newest first) and limit items
  const sortedPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems)

  const items = sortedPosts
    .map(post => generateItem(post, siteUrl))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(title)}</title>
  <link>${siteUrl}</link>
  <description>${escapeXml(description)}</description>
  <language>${language}</language>
  <managingEditor>${managingEditor}</managingEditor>
  <webMaster>${webMaster}</webMaster>
  <copyright>${escapeXml(copyright)}</copyright>
  <lastBuildDate>${buildDate}</lastBuildDate>
  <ttl>${ttl}</ttl>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`
}
