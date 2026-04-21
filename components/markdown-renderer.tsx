'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'
import { CodeBlock } from './code-block'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

/**
 * Semantic Markdown Renderer
 * 
 * Uses CSS custom properties (--prose-*) for theme-aware styling.
 * All colors are defined in lib/themes.ts and applied via ThemeStyleUpdater.
 * 
 * === Typography Hierarchy (YC/Silicon Valley Standard) ===
 * 
 * Design Principles:
 * 1. "Top-heavy spacing" - marginTop > marginBottom (~2.5:1 ratio)
 *    This creates clear section breaks while keeping content close to its heading.
 * 2. Generous breathing room - inspired by Linear, Stripe, Vercel blogs
 * 3. Hierarchical spacing - higher level headings get more space
 * 
 * Hierarchy signals (priority order):
 * 1. Font Size (most important)
 * 2. Spacing (margin-top/margin-bottom)
 * 3. Font Weight
 * 4. Color Brightness (least important - grayscale gradient only)
 */

// ═══════════════════════════════════════════════════════════════════════════
// SPACING SYSTEM - Centralized for easy maintenance
// All values in rem. Adjust these to fine-tune the overall breathing room.
// ═══════════════════════════════════════════════════════════════════════════
const SPACING = {
  // Heading spacing: [marginTop, marginBottom]
  // Ratio ~2.5:1 ensures headings "belong to" content below, not above
  h1: { top: '3.5rem', bottom: '1.5rem' },   // 56px / 24px - page title, maximum breathing
  h2: { top: '3rem', bottom: '1.25rem' },    // 48px / 20px - chapter level, clear section break
  h3: { top: '2.25rem', bottom: '1rem' },    // 36px / 16px - subsection
  h4: { top: '1.75rem', bottom: '0.75rem' }, // 28px / 12px - minor heading
  h5: { top: '1.5rem', bottom: '0.5rem' },   // 24px / 8px  - rare use
  h6: { top: '1.25rem', bottom: '0.375rem' },// 20px / 6px  - minimal
  
  // Block element spacing
  paragraph: '1.75rem',  // 28px - generous paragraph gap for readability
  list: '1.5rem',        // 24px - list block margin
  blockquote: '2rem',    // 32px - stand out as a distinct element
  codeBlock: '2rem',     // 32px - code blocks need clear separation
  image: '2.5rem',       // 40px - images as visual breaks
  hr: '3rem',            // 48px - horizontal rules as major section dividers
  table: '2rem',         // 32px - tables need breathing room
} as const
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // ═══════════════════════════════════════════════════════════════════════
    // HEADINGS - ALL 4 dimensions different for each level
    // Size > Spacing > Weight > Color (grayscale gradient)
    // ═══════════════════════════════════════════════════════════════════════
    h1: ({ children, id }) => (
      <h1 
        id={id} 
        className="font-serif scroll-mt-24"
        style={{ 
          fontSize: '2.25rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginTop: SPACING.h1.top,
          marginBottom: SPACING.h1.bottom,
          color: 'var(--prose-h1)',
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2 
        id={id} 
        className="font-serif scroll-mt-24"
        style={{ 
          fontSize: '1.75rem',
          fontWeight: 700,
          lineHeight: 1.25,
          marginTop: SPACING.h2.top,
          marginBottom: SPACING.h2.bottom,
          color: 'var(--prose-h2)',
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 
        id={id} 
        className="font-serif scroll-mt-24"
        style={{ 
          fontSize: '1.375rem',
          fontWeight: 650,
          lineHeight: 1.3,
          marginTop: SPACING.h3.top,
          marginBottom: SPACING.h3.bottom,
          color: 'var(--prose-h3)',
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4 
        id={id} 
        className="font-serif scroll-mt-24"
        style={{ 
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.35,
          marginTop: SPACING.h4.top,
          marginBottom: SPACING.h4.bottom,
          color: 'var(--prose-h4)',
        }}
      >
        {children}
      </h4>
    ),
    // H5-H6: Weakened hierarchy (smaller, lighter, less spacing)
    h5: ({ children, id }) => (
      <h5 
        id={id} 
        className="font-serif scroll-mt-24"
        style={{ 
          fontSize: '1rem',
          fontWeight: 550,
          lineHeight: 1.4,
          marginTop: SPACING.h5.top,
          marginBottom: SPACING.h5.bottom,
          color: 'var(--prose-h5)',
        }}
      >
        {children}
      </h5>
    ),
    h6: ({ children, id }) => (
      <h6 
        id={id} 
        className="font-serif scroll-mt-24"
        style={{ 
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.5,
          marginTop: SPACING.h6.top,
          marginBottom: SPACING.h6.bottom,
          color: 'var(--prose-h6)',
        }}
      >
        {children}
      </h6>
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // PARAGRAPH
    // ═══════════════════════════════════════════════════════════════════════
    p: ({ children, node }) => {
      // Check if the paragraph only contains an image (to avoid wrapping images in <p>)
      const hasOnlyImage = node?.children?.length === 1 && 
        node.children[0].type === 'element' && 
        node.children[0].tagName === 'img'
      
      if (hasOnlyImage) {
        return <>{children}</>
      }
      
      return (
        <p 
          className="leading-7 text-foreground"
          style={{ marginBottom: SPACING.paragraph }}
        >
          {children}
        </p>
      )
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TEXT EMPHASIS
    // ═══════════════════════════════════════════════════════════════════════
    strong: ({ children }) => (
      <strong 
        className="font-semibold"
        style={{ color: 'var(--prose-bold)' }}
      >
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em 
        className="italic"
        style={{ color: 'var(--prose-italic)' }}
      >
        {children}
      </em>
    ),

    del: ({ children }) => (
      <del className="line-through text-muted-foreground">
        {children}
      </del>
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // LINKS
    // ═══════════════════════════════════════════════════════════════════════
    a: ({ href, children }) => (
      <a
        href={href}
        className="underline underline-offset-2 transition-colors duration-200"
        style={{ 
          color: 'var(--prose-link)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--prose-link-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--prose-link)'
        }}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // IMAGES
    // ═══════════════════════════════════════════════════════════════════════
    img: ({ src, alt }) => {
      if (!src || typeof src !== 'string') return null
      
      return (
        <figure style={{ marginTop: SPACING.image, marginBottom: SPACING.image }}>
          <div className="relative overflow-hidden rounded-lg border border-border">
            <Image
              src={src}
              alt={alt || ''}
              width={800}
              height={450}
              className="w-full h-auto"
              unoptimized={src.startsWith('http')}
            />
          </div>
          {alt && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CODE
    // ═══════════════════════════════════════════════════════════════════════
    pre: ({ children }) => {
      return <>{children}</>
    },

    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      const codeContent = String(children)
      const hasNewlines = codeContent.includes('\n')
      const isInline = !match && !className && !hasNewlines
      
      if (isInline) {
        return (
          <code 
            className="font-mono px-1.5 py-0.5 rounded text-sm"
            style={{ 
              color: 'var(--prose-inline-code)',
              backgroundColor: 'var(--prose-inline-code-bg)',
            }}
            {...props}
          >
            {children}
          </code>
        )
      }

      // Extract language and optional filename from className
      const langPart = match?.[1] || 'text'
      const [language, filename] = langPart.split(':')
      const codeString = codeContent.replace(/\n$/, '')

      return <CodeBlock code={codeString} language={language} filename={filename} />
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BLOCKQUOTES - with subtle background, slightly smaller text
    // 不强制斜体，保留原有格式（正常/加粗/斜体由内容决定）
    // 使用 [&_p]:text-inherit 让子元素 p 继承 blockquote 的颜色
    // ═══════════════════════════════════════════════════════════════════════
    blockquote: ({ children }) => (
      <blockquote 
        className="pl-4 rounded-r-md [&_p]:text-inherit [&_p]:mb-3 [&_p:last-child]:mb-0"
        style={{
          marginTop: SPACING.blockquote,
          marginBottom: SPACING.blockquote, 
          borderLeft: '4px solid var(--prose-quote-border)',
          padding: '0.75rem 1rem',
          fontSize: '0.9375rem', // 15px, 比正文 16px 略小
          color: 'var(--prose-quote-text)',
          backgroundColor: 'var(--prose-quote-bg)',
        }}
      >
        {children}
      </blockquote>
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // LISTS - with subtle marker enhancement
    // ═══════════════════════════════════════════════════════════════════════
    ul: ({ children }) => (
      <ul 
        className="pl-6 space-y-2"
        style={{ 
          listStyleType: 'disc',
          marginTop: SPACING.list,
          marginBottom: SPACING.list,
        }}
      >
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol 
        className="pl-6 space-y-2"
        style={{ 
          listStyleType: 'decimal',
          marginTop: SPACING.list,
          marginBottom: SPACING.list,
        }}
      >
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li 
        className="text-foreground"
        style={{ 
          // Use ::marker pseudo-element styling via CSS
        }}
      >
        {children}
      </li>
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // HORIZONTAL RULE - gradient fade effect
    // ═══════════════════════════════════════════════════════════════════════
    hr: () => (
      <hr 
        className="border-none h-px"
        style={{
          marginTop: SPACING.hr,
          marginBottom: SPACING.hr,
          background: `linear-gradient(
            to right,
            transparent,
            var(--prose-hr) 15%,
            var(--prose-hr) 85%,
            transparent
          )`,
        }}
      />
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // TABLES (GFM)
    // ═══════════════════════════════════════════════════════════════════════
    table: ({ children }) => (
      <div 
        className="overflow-x-auto"
        style={{ marginTop: SPACING.table, marginBottom: SPACING.table }}
      >
        <table className="min-w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-secondary">
        {children}
      </thead>
    ),

    tbody: ({ children }) => (
      <tbody>{children}</tbody>
    ),

    tr: ({ children }) => (
      <tr className="border-b border-border">
        {children}
      </tr>
    ),

    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-bold text-foreground">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="px-4 py-2 text-foreground">
        {children}
      </td>
    ),

    // ═══════════════════════════════════════════════════════════════════════
    // TASK LISTS (GFM)
    // ═══════════════════════════════════════════════════════════════════════
    input: ({ checked, type }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 accent-primary"
          />
        )
      }
      return <input type={type} />
    },
  }

  return (
    <div className="prose-gruvbox">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
