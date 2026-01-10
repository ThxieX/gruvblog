// ============================================================================
// Configuration Entry Point
// ============================================================================
// Single source of truth for all site configuration.
// Import from '@/lib/config' to access configuration values.
//
// Usage:
//   import { siteConfig, getTwitterHandle } from '@/lib/config'
//   const handle = getTwitterHandle() // Returns 'thxiex' from twitter URL
// ============================================================================

import { siteConfig } from './site.config'

export { siteConfig }
export type { Config, SiteConfig, AuthorConfig, CommentsConfig } from './types'

/**
 * Extract Twitter handle from the twitter URL
 * e.g., 'https://twitter.com/thxiex' -> 'thxiex'
 */
export function getTwitterHandle(): string {
  const url = siteConfig.author.twitter
  return url.split('/').pop() || ''
}
