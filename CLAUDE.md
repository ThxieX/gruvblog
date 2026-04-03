# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 (App Router) personal blog with a custom Gruvbox color scheme. Uses React 19, TypeScript, and Tailwind CSS v4. Content is written in Markdown and statically generated at build time.

## Dev Commands

```bash
pnpm dev          # Generate blog data + start dev server
pnpm build        # Generate blog data + production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm generate-blog-data  # Generate blog data without dev server
```

## Build Pipeline

Content in `content/posts/` is processed by `scripts/generate-blog-data.js` at build/dev time:

```
content/posts/                    lib/generated/                 public/images/posts/
├── post.md                       ├── index.ts (metadata)        [slug]/
└── post-with-img/        ───►   └── posts/*.ts (content)  ───►  [images]
    ├── index.md                  (code-split, loaded on demand)
    └── *.png
```

The script:
1. Parses Markdown frontmatter (gray-matter)
2. Calculates reading time and extracts excerpts
3. Copies directory-based images to `public/images/posts/[slug]/`
4. Generates TypeScript modules with Post metadata and content
5. Creates dynamic `postLoaders` for code-splitting

## Key Files

| File | Purpose |
|------|---------|
| `scripts/generate-blog-data.js` | Build-time MD→TS generator |
| `lib/blog-data.ts` | Data access layer (getPosts, getPostBySlug, etc.) |
| `lib/blog-types.ts` | `PostMeta` (listings) and `Post` (full content) types |
| `lib/theme-context.tsx` | Theme style provider (gruvbox variants) |
| `components/markdown-renderer.tsx` | react-markdown with custom components |
| `components/code-block.tsx` | PrismJS syntax highlighting with copy button |
| `app/prism-gruvbox.css` | Custom PrismJS Gruvbox theme |

## Architecture Patterns

**Blog post format** (in `content/posts/`):
- Single file: `2024-01-15-my-post.md`
- Directory (for images): `2024-01-15-my-post/index.md` + images

**Frontmatter**:
```yaml
---
title: Article Title
date: 2024-01-15 10:00:00
categories: [Parent, Child]
tags: [tag1, tag2]
excerpt: Optional excerpt
aiSummary: Optional AI-generated summary
---
```

**Metadata vs Content**: `PostMeta` is small and loaded synchronously for listings. Full `Post` content is loaded via dynamic `postLoaders` only when viewing a post.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 + CSS variables for theming
- **UI Components**: shadcn/ui-style components in `components/ui/`
- **Markdown**: react-markdown + remark-gfm + rehype-slug
- **Syntax Highlighting**: PrismJS (custom Gruvbox theme)
- **Theme**: next-themes with multiple Gruvbox variants (gruvbox, gruvbox-soft, gruvbox-high-contrast, catppuccin)
- **AI Features**: @ai-sdk/react + Vercel OIDC

## Routes

- `/` — Home
- `/posts` — All posts
- `/posts/[slug]` — Individual post
- `/category/[slug]` — Posts by category
- `/tag/[slug]` — Posts by tag
- `/about` — About page
- `/ai` — AI chat page
