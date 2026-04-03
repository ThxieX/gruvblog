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
 * Hierarchy signals (priority order):
 * 1. Font Size (most important)
 * 2. Spacing (margin-top/margin-bottom)
 * 3. Font Weight
 * 4. Color Brightness (least important - grayscale gradient only)
 * 
 * ALL 4 DIMENSIONS MUST BE DIFFERENT FOR EACH LEVEL:
 * 
 * | Level | Size     | Weight | MarginTop | MarginBottom | Color       |
 * |-------|----------|--------|-----------|--------------|-------------|
 * | H1    | 2.25rem  | 800    | 2.5rem    | 1.25rem      | fg 100%     |
 * | H2    | 1.75rem  | 700    | 2rem      | 1rem         | fg 97%      |
 * | H3    | 1.375rem | 650    | 1.625rem  | 0.75rem      | fg 92%      |
 * | H4    | 1.125rem | 600    | 1.25rem   | 0.5rem       | fg 85%      |
 * | H5    | 1rem     | 550    | 1rem      | 0.375rem     | muted 75%   |
 * | H6    | 0.875rem | 500    | 0.75rem   | 0.25rem      | muted 60%   |
 */
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
          fontSize: '2.25rem',    // 36px - largest
          fontWeight: 800,        // extrabold - heaviest
          lineHeight: 1.2,
          marginTop: '2.5rem',    // 40px - most spacing
          marginBottom: '1.25rem', // 20px
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
          fontSize: '1.75rem',    // 28px
          fontWeight: 700,        // bold
          lineHeight: 1.25,
          marginTop: '2rem',      // 32px
          marginBottom: '1rem',   // 16px
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
          fontSize: '1.375rem',   // 22px
          fontWeight: 650,        // between semibold and bold
          lineHeight: 1.3,
          marginTop: '1.625rem',  // 26px
          marginBottom: '0.75rem', // 12px
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
          fontSize: '1.125rem',   // 18px
          fontWeight: 600,        // semibold
          lineHeight: 1.35,
          marginTop: '1.25rem',   // 20px
          marginBottom: '0.5rem', // 8px
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
          fontSize: '1rem',       // 16px - same as body
          fontWeight: 550,        // between medium and semibold
          lineHeight: 1.4,
          marginTop: '1rem',      // 16px
          marginBottom: '0.375rem', // 6px
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
          fontSize: '0.875rem',   // 14px - smaller than body
          fontWeight: 500,        // medium - lightest
          lineHeight: 1.5,
          marginTop: '0.75rem',   // 12px - least spacing
          marginBottom: '0.25rem', // 4px
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
        <p className="mb-6 leading-7 text-foreground">
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
        <figure className="my-8">
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
        className="my-6 pl-4 rounded-r-md [&_p]:text-inherit [&_p]:mb-3 [&_p:last-child]:mb-0"
        style={{ 
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
        className="pl-6 my-4 space-y-2"
        style={{ 
          listStyleType: 'disc',
        }}
      >
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol 
        className="pl-6 my-4 space-y-2"
        style={{ 
          listStyleType: 'decimal',
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
        className="my-10 border-none h-px"
        style={{
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
      <div className="my-6 overflow-x-auto">
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
