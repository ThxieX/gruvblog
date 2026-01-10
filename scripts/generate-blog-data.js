const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = process.cwd()
const POSTS_DIRECTORY = path.join(PROJECT_ROOT, 'content', 'posts')
const OUTPUT_DIRECTORY = path.join(PROJECT_ROOT, 'lib', 'generated')
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'posts')

// Supported image extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']

// ============================================================================
// Utilities
// ============================================================================

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function calculateReadingTime(content) {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(chineseChars / 300 + englishWords / 200)
  return `${Math.max(1, minutes)} min`
}

function normalizeCategories(categories) {
  if (!categories) return ['Uncategorized']
  if (typeof categories === 'string') return [categories]
  return categories
}

function normalizeTags(tags) {
  if (!tags) return []
  if (typeof tags === 'string') return [tags]
  return tags
}

function extractExcerpt(content, maxLength = 160) {
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/#+\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/>\s/g, '')
    .replace(/-\s/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (plainText.length <= maxLength) return plainText
  return plainText.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

function escapeForTS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

// ============================================================================
// Image Processing
// ============================================================================

/**
 * Copy images from post directory to public/images/posts/[slug]/
 * Returns a map of original filename -> public path
 */
function copyPostImages(postDir, slug) {
  const imageMap = new Map()
  
  if (!fs.existsSync(postDir) || !fs.statSync(postDir).isDirectory()) {
    return imageMap
  }

  const files = fs.readdirSync(postDir)
  const imageFiles = files.filter(isImageFile)

  if (imageFiles.length === 0) {
    return imageMap
  }

  const targetDir = path.join(PUBLIC_IMAGES_DIR, slug)
  ensureDir(targetDir)

  for (const imageFile of imageFiles) {
    const sourcePath = path.join(postDir, imageFile)
    const targetPath = path.join(targetDir, imageFile)
    
    fs.copyFileSync(sourcePath, targetPath)
    
    // Map: ./image.png -> /images/posts/[slug]/image.png
    imageMap.set(`./${imageFile}`, `/images/posts/${slug}/${imageFile}`)
    imageMap.set(imageFile, `/images/posts/${slug}/${imageFile}`)
  }

  console.log(`[Blog] Copied ${imageFiles.length} image(s) for "${slug}"`)
  return imageMap
}

/**
 * Rewrite image paths in markdown content
 * ./image.png -> /images/posts/[slug]/image.png
 */
function rewriteImagePaths(content, imageMap) {
  if (imageMap.size === 0) return content

  let result = content

  // Replace markdown image syntax: ![alt](./image.png)
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      const newSrc = imageMap.get(src)
      if (newSrc) {
        return `![${alt}](${newSrc})`
      }
      return match
    }
  )

  // Replace HTML img tags: <img src="./image.png">
  result = result.replace(
    /<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/g,
    (match, before, src, after) => {
      const newSrc = imageMap.get(src)
      if (newSrc) {
        return `<img${before} src="${newSrc}"${after}>`
      }
      return match
    }
  )

  return result
}

// ============================================================================
// Post Discovery
// ============================================================================

/**
 * Find all posts in content/posts/
 * Supports two formats:
 * 1. Single file: 2024-01-15-my-post.md
 * 2. Directory: 2024-01-15-my-post/index.md (with images)
 */
function discoverPosts() {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return []
  }

  const entries = fs.readdirSync(POSTS_DIRECTORY, { withFileTypes: true })
  const posts = []

  for (const entry of entries) {
    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      // Format 1: Single markdown file
      posts.push({
        type: 'file',
        name: entry.name,
        mdPath: path.join(POSTS_DIRECTORY, entry.name),
        dirPath: null,
      })
    } else if (entry.isDirectory()) {
      // Format 2: Directory with index.md
      const indexPath = path.join(POSTS_DIRECTORY, entry.name, 'index.md')
      const indexMdxPath = path.join(POSTS_DIRECTORY, entry.name, 'index.mdx')
      
      if (fs.existsSync(indexPath)) {
        posts.push({
          type: 'directory',
          name: entry.name,
          mdPath: indexPath,
          dirPath: path.join(POSTS_DIRECTORY, entry.name),
        })
      } else if (fs.existsSync(indexMdxPath)) {
        posts.push({
          type: 'directory',
          name: entry.name,
          mdPath: indexMdxPath,
          dirPath: path.join(POSTS_DIRECTORY, entry.name),
        })
      }
    }
  }

  return posts
}

// ============================================================================
// Main Generation Logic
// ============================================================================

function generateBlogData() {
  console.log('[Blog] Generating blog data...')

  // Clean and ensure output directories
  cleanDirectory(path.join(OUTPUT_DIRECTORY, 'posts'))
  cleanDirectory(PUBLIC_IMAGES_DIR)
  ensureDir(OUTPUT_DIRECTORY)
  ensureDir(path.join(OUTPUT_DIRECTORY, 'posts'))

  // Discover posts
  const postEntries = discoverPosts()

  if (postEntries.length === 0) {
    console.log('[Blog] No posts found, creating empty index')
    writeEmptyIndex()
    return
  }

  const posts = []
  const generatedSlugs = []

  for (const entry of postEntries) {
    const fileContents = fs.readFileSync(entry.mdPath, 'utf8')

    try {
      const { data, content } = matter(fileContents)

      if (!data.title || !data.date) {
        console.warn(`[Blog] Skipping ${entry.name}: missing required frontmatter (title, date)`)
        continue
      }

      // Extract slug from filename/dirname
      const slug = entry.name
        .replace(/^\d{4}-\d{2}-\d{2}[-_]?/, '')  // Remove date prefix
        .replace(/\.(md|mdx)$/, '')               // Remove extension (for single files)

      // Process images if this is a directory-based post
      let processedContent = content
      if (entry.type === 'directory' && entry.dirPath) {
        const imageMap = copyPostImages(entry.dirPath, slug)
        processedContent = rewriteImagePaths(content, imageMap)
      }

      const categories = normalizeCategories(data.categories)
      const tags = normalizeTags(data.tags)

      const date = data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
        : String(data.date).split(' ')[0]

      const postMeta = {
        slug,
        title: data.title,
        excerpt: data.excerpt || extractExcerpt(content),
        date,
        readingTime: calculateReadingTime(content),
        categories,
        category: slugify(categories[categories.length - 1]),
        tags,
        aiSummary: data.aiSummary || null,
      }

      posts.push(postMeta)
      generatedSlugs.push(slug)

      // Generate individual post module
      generatePostModule(slug, postMeta, processedContent)

      console.log(`[Blog] Processed: ${entry.name} -> ${slug}`)

    } catch (error) {
      console.error(`[Blog] Error parsing ${entry.name}:`, error.message)
    }
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Generate categories
  const categoryMap = new Map()
  posts.forEach(post => {
    post.categories.forEach(categoryName => {
      const categorySlug = slugify(categoryName)
      const existing = categoryMap.get(categorySlug)
      if (existing) {
        existing.count++
      } else {
        categoryMap.set(categorySlug, { name: categoryName, count: 1 })
      }
    })
  })

  const categories = Array.from(categoryMap.entries())
    .map(([categorySlug, { name, count }]) => ({
      slug: categorySlug,
      name,
      description: `Posts about ${name}`,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  // Generate tags
  const tagSet = new Set()
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag))
  })
  const tags = Array.from(tagSet).sort()

  // Generate main index module
  generateIndexModule(posts, categories, tags, generatedSlugs)

  console.log(`[Blog] Complete: ${posts.length} posts, ${categories.length} categories, ${tags.length} tags`)
}

// ============================================================================
// File Generators
// ============================================================================

function generatePostModule(slug, meta, content) {
  const outputPath = path.join(OUTPUT_DIRECTORY, 'posts', `${slug}.ts`)
  
  const moduleContent = `// Auto-generated by scripts/generate-blog-data.js
// Do not edit this file directly

import type { Post } from '../../blog-types'

export const post: Post = {
  slug: ${JSON.stringify(meta.slug)},
  title: ${JSON.stringify(meta.title)},
  excerpt: ${JSON.stringify(meta.excerpt)},
  date: ${JSON.stringify(meta.date)},
  readingTime: ${JSON.stringify(meta.readingTime)},
  categories: ${JSON.stringify(meta.categories)},
  category: ${JSON.stringify(meta.category)},
  tags: ${JSON.stringify(meta.tags)},
  aiSummary: ${meta.aiSummary ? JSON.stringify(meta.aiSummary) : 'undefined'},
  content: \`${escapeForTS(content)}\`,
}

export default post
`

  fs.writeFileSync(outputPath, moduleContent, 'utf8')
}

function generateIndexModule(posts, categories, tags, slugs) {
  const outputPath = path.join(OUTPUT_DIRECTORY, 'index.ts')

  const postImportsMap = slugs
    .map(slug => `  '${slug}': () => import('./posts/${slug}'),`)
    .join('\n')

  const moduleContent = `// Auto-generated by scripts/generate-blog-data.js
// Do not edit this file directly

import type { PostMeta, Category } from '../blog-types'

// ============================================================================
// Static Data (Metadata only - small bundle size)
// ============================================================================

export const posts: PostMeta[] = ${JSON.stringify(posts, null, 2)}

export const categories: Category[] = ${JSON.stringify(categories, null, 2)}

export const tags: string[] = ${JSON.stringify(tags, null, 2)}

// ============================================================================
// Dynamic Post Loaders (Code-splitting - loaded on demand)
// ============================================================================

export const postLoaders: Record<string, () => Promise<{ post: import('../blog-types').Post }>> = {
${postImportsMap}
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function getPostBySlug(slug: string) {
  const loader = postLoaders[slug]
  if (!loader) return undefined
  const module = await loader()
  return module.post
}
`

  fs.writeFileSync(outputPath, moduleContent, 'utf8')
}

function writeEmptyIndex() {
  const outputPath = path.join(OUTPUT_DIRECTORY, 'index.ts')
  const moduleContent = `// Auto-generated by scripts/generate-blog-data.js
// Do not edit this file directly

import type { PostMeta, Category, Post } from '../blog-types'

export const posts: PostMeta[] = []
export const categories: Category[] = []
export const tags: string[] = []
export const postLoaders: Record<string, () => Promise<{ post: Post }>> = {}

export async function getPostBySlug(_slug: string) {
  return undefined
}
`
  fs.writeFileSync(outputPath, moduleContent, 'utf8')
}

// ============================================================================
// Execute
// ============================================================================

generateBlogData()
