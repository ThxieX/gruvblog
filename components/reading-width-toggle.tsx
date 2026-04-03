'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

type ReadingWidth = 'default' | 'wide'

const STORAGE_KEY = 'reading-width-preference'

export function useReadingWidth() {
  const [width, setWidth] = useState<ReadingWidth>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as ReadingWidth | null
    if (stored === 'default' || stored === 'wide') {
      setWidth(stored)
    }
  }, [])

  const toggleWidth = () => {
    const newWidth = width === 'default' ? 'wide' : 'default'
    setWidth(newWidth)
    localStorage.setItem(STORAGE_KEY, newWidth)
  }

  return { width, toggleWidth, mounted }
}

interface ReadingWidthToggleProps {
  width: ReadingWidth
  onToggle: () => void
}

export function ReadingWidthToggle({ width, onToggle }: ReadingWidthToggleProps) {
  const isWide = width === 'wide'
  
  return (
    <button
      onClick={onToggle}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      title={isWide ? '标准宽度' : '宽屏模式'}
      aria-label={isWide ? '切换到标准宽度' : '切换到宽屏模式'}
    >
      {isWide ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </button>
  )
}
