'use client'

import { ReactNode } from 'react'
import { useReadingWidth, ReadingWidthToggle } from './reading-width-toggle'

interface ArticleContainerProps {
  children: ReactNode
  metaContent: ReactNode
}

export function ArticleContainer({ children, metaContent }: ArticleContainerProps) {
  const { width, toggleWidth, mounted } = useReadingWidth()
  
  // Prevent hydration mismatch by rendering default width until mounted
  const currentWidth = mounted ? width : 'default'
  
  return (
    <article 
      className={`
        mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16
        transition-[max-width] duration-300 ease-in-out
        ${currentWidth === 'wide' ? 'max-w-5xl' : 'max-w-3xl'}
      `}
    >
      {/* Meta row with width toggle */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {metaContent}
        </div>
        <ReadingWidthToggle width={currentWidth} onToggle={toggleWidth} />
      </div>
      
      {children}
    </article>
  )
}
