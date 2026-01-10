// ============================================================================
// Site Configuration Types
// ============================================================================
// Type definitions for all configuration options.
// These types ensure type safety across the entire codebase.

/**
 * Author information (Primary - used across the site)
 */
export interface AuthorConfig {
  /** Author display name */
  name: string
  /** Contact email */
  email: string
  /** GitHub profile URL */
  github: string
  /** Twitter/X profile URL */
  twitter: string
}

/**
 * Site metadata configuration
 */
export interface SiteConfig {
  /** Full title used in browser tab and SEO (combined with author.name) */
  title: string
  /** Site description for SEO and RSS */
  description: string
  /** Primary site URL (without trailing slash) */
  url: string
  /** Default locale for the site */
  locale: string
  /** SEO keywords */
  keywords: string[]
  /** Footer text */
  footerText: string
}

/**
 * Giscus comment system configuration
 * Get these values from https://giscus.app
 */
export interface CommentsConfig {
  /** Enable/disable comments */
  enabled: boolean
  /** GitHub repository in format "owner/repo" */
  repo: `${string}/${string}`
  /** Repository ID from Giscus setup */
  repoId: string
  /** Discussion category name */
  category: string
  /** Category ID from Giscus setup */
  categoryId: string
}

/**
 * Complete site configuration
 */
export interface Config {
  author: AuthorConfig
  site: SiteConfig
  comments: CommentsConfig
}
