// ============================================================================
// Site Configuration
// ============================================================================
// Central configuration file for all site-wide settings.
// Edit this file to customize your blog.
//
// For open source users:
// 1. Fork this repository
// 2. Edit the values below
// 3. Deploy to Vercel
// ============================================================================

import type { Config } from './types'

export const siteConfig: Config = {
  // ---------------------------------------------------------------------------
  // Author Information (Primary - used across the site)
  // ---------------------------------------------------------------------------
  author: {
    name: 'Thxie',
    email: 'coderthank@gmail.com',
    github: 'https://github.com/thxiex',
    twitter: 'https://twitter.com/thxiex',
  },

  // ---------------------------------------------------------------------------
  // Site Information
  // ---------------------------------------------------------------------------
  site: {
    title: 'AI & Code',
    description: 'Personal blog. Exploring AI, programming, and minimalist design.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://thxie.com',
    locale: 'en_US',
    keywords: ['AI', 'Programming', 'Machine Learning', 'Web Development', 'Minimalism'],
    footerText: '© 2026 · Crafted with ❤️ by Thxie · All rights reserved.',
  },

  // ---------------------------------------------------------------------------
  // Comments (Giscus)
  // ---------------------------------------------------------------------------
  // To set up Giscus for your own blog:
  // 1. Go to https://giscus.app
  // 2. Enter your repository information
  // 3. Copy the repo, repoId, category, and categoryId values here
  // ---------------------------------------------------------------------------
  comments: {
    enabled: true,
    repo: 'ThxieX/echo-comments',
    repoId: 'R_kgDOR2u0AQ',
    category: 'Comments',
    categoryId: 'DIC_kwDOR2u0Ac4C5w15',
  },
}
