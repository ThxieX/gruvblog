'use client'

import { useState, useEffect, useMemo } from 'react'
import { List, X, ChevronRight } from 'lucide-react'
import GithubSlugger from 'github-slugger'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  text: string
  level: number
  children?: TOCItem[]
}

interface TableOfContentsProps {
  content: string
}

// Helper to clean markdown formatting and HTML tags from heading text
// Must match rehype-slug's behavior for correct ID matching
function cleanHeadingText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/`([^`]+)`/g, '$1')  // Remove inline code backticks
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold
    .replace(/\*([^*]+)\*/g, '$1')  // Remove italic
    .replace(/_([^_]+)_/g, '$1')  // Remove underscore emphasis
    .replace(/~~([^~]+)~~/g, '$1')  // Remove strikethrough
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')  // Remove images, keep alt
    .trim()
}

// Build hierarchical tree from flat headings
function buildTree(flatHeadings: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = []
  const stack: { item: TOCItem; level: number }[] = []

  for (const heading of flatHeadings) {
    const newItem: TOCItem = { ...heading, children: [] }

    // Pop items from stack until we find a parent with lower level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      // No parent, add to root
      result.push(newItem)
    } else {
      // Add as child of last item in stack
      stack[stack.length - 1].item.children!.push(newItem)
    }

    stack.push({ item: newItem, level: heading.level })
  }

  return result
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [flatHeadings, setFlatHeadings] = useState<TOCItem[]>([])

  // Parse headings from content (H1-H6), excluding code blocks
  useEffect(() => {
    const slugger = new GithubSlugger()
    const lines = content.split('\n')
    const items: TOCItem[] = []
    let inCodeBlock = false

    lines.forEach((line) => {
      // Track code block boundaries (``` or ~~~)
      if (line.match(/^```|^~~~/)) {
        inCodeBlock = !inCodeBlock
        return
      }

      // Skip headings inside code blocks
      if (inCodeBlock) {
        return
      }

      // Match h1 through h6
      const match = line.match(/^(#{1,6}) (.+)$/)

      if (match) {
        const level = match[1].length
        const rawText = match[2].trim()
        const text = cleanHeadingText(rawText)
        const id = slugger.slug(text)
        items.push({ id, text, level })
      }
    })

    setFlatHeadings(items)

    // Default: expand H1-H3 (sections containing H4-H6 are collapsed)
    const defaultExpanded = new Set<string>()
    items.forEach((item) => {
      if (item.level <= 3) {
        defaultExpanded.add(item.id)
      }
    })
    setExpandedSections(defaultExpanded)
  }, [content])

  // Build hierarchical tree
  const headingTree = useMemo(() => buildTree(flatHeadings), [flatHeadings])

  // Intersection observer for active heading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    flatHeadings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [flatHeadings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const y = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Check if a heading has H4+ children (collapsible)
  const hasDeepChildren = (item: TOCItem): boolean => {
    if (!item.children || item.children.length === 0) return false
    return item.children.some((child) => child.level >= 4 || hasDeepChildren(child))
  }

  // Render a single TOC item and its children
  const renderTOCItem = (item: TOCItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.has(item.id)
    const isCollapsible = item.level <= 3 && hasChildren && hasDeepChildren(item)

    // Indentation based on level (递进式缩进) - 紧凑缩进，左侧更贴边
    const indentPx = (item.level - 1) * 10 // H1=0px, H2=10px, H3=20px, H4=30px...
    // 箭头按钮宽度（包括 padding）
    const arrowWidth = 16

    const fontSizeClass = {
      1: 'text-[15px] font-medium',
      2: 'text-sm font-medium',
      3: 'text-sm',
      4: 'text-[13px]',
      5: 'text-[13px]',
      6: 'text-xs',
    }[item.level] || 'text-sm'

    return (
      <li key={item.id} className="relative">
        {/* Active indicator line */}
        <div
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full transition-all duration-200",
            activeId === item.id
              ? "bg-primary"
              : "bg-transparent"
          )}
        />

        <div className="flex items-center" style={{ paddingLeft: `${indentPx}px` }}>
          {/* 箭头占位区域 - 统一宽度，无论是否可折叠 */}
          <div className="flex-shrink-0" style={{ width: `${arrowWidth}px` }}>
            {isCollapsible && (
              <button
                onClick={() => toggleSection(item.id)}
                className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>
            )}
          </div>

          <button
            onClick={() => scrollToHeading(item.id)}
            className={cn(
              "flex-1 text-left py-1 pr-2 transition-all duration-200 rounded-r-md",
              fontSizeClass,
              // Active state
              activeId === item.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              // H5-H6 are more muted
              item.level >= 5 && "opacity-75"
            )}
          >
            <span className="line-clamp-1">{item.text}</span>
          </button>
        </div>

        {/* Children (H4-H6 are collapsed by default under their parent) */}
        {hasChildren && (
          <ul
            className={cn(
              "space-y-0.5 overflow-hidden transition-all duration-200",
              // For items with deep children (H4+), control visibility
              isCollapsible && !isExpanded && "max-h-0 opacity-0",
              isCollapsible && isExpanded && "max-h-[1000px] opacity-100",
              // For items without deep children (just H2-H3 structure), always show
              !isCollapsible && "max-h-[1000px] opacity-100"
            )}
          >
            {item.children!.map((child) => renderTOCItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (flatHeadings.length === 0) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-4 top-20 z-40 p-2 rounded-lg border border-border bg-card shadow-lg transition-all",
          "hover:bg-secondary lg:right-8"
        )}
        aria-label={isOpen ? 'Close table of contents' : 'Open table of contents'}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <List className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* TOC Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-30 h-full w-72 bg-card/95 backdrop-blur-sm border-l border-border shadow-xl",
          "transform transition-transform duration-300 ease-in-out",
          "pt-20 pb-8 overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="pl-2 pr-4">
          {/* Navigation - 支持水平滚动但隐藏滚动条 */}
          <nav className="relative overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Vertical guide line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />

            <ul className="space-y-0.5 min-w-max">
              {headingTree.map((item) => renderTOCItem(item))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
