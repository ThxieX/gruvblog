'use client'

import { useState, useEffect } from 'react'
import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
import { useThemeStyle } from '@/lib/theme-context'
import { useI18n } from '@/lib/i18n-context'
import { siteConfig } from '@/lib/config'
import type { ThemeStyle, ThemeMode } from '@/lib/themes'
import type { Locale } from '@/lib/i18n'

// Map theme style + mode to Giscus built-in theme
// See: https://giscus.app/ for available themes
function getGiscusTheme(style: ThemeStyle, mode: ThemeMode): string {
  const themeMap: Record<ThemeStyle, Record<ThemeMode, string>> = {
    'gruvbox': {
      light: 'gruvbox_light',
      dark: 'gruvbox_dark',
    },
    'gruvbox-soft': {
      // gruvbox-soft 使用标准 gruvbox 主题（最接近）
      light: 'gruvbox_light',
      dark: 'gruvbox_dark',
    },
    'gruvbox-high-contrast': {
      // gruvbox-high-contrast 使用 dark_high_contrast / light_high_contrast
      light: 'gruvbox_light',
      dark: 'gruvbox_dark',
      // light: 'light_high_contrast',
      // dark: 'dark_high_contrast',
    },
    'catppuccin': {
      // catppuccin: latte (light), mocha (dark)
      light: 'catppuccin_latte',
      dark: 'catppuccin_mocha',
    },
  }
  return themeMap[style][mode]
}

// Map locale to Giscus supported language
function getGiscusLang(locale: Locale): string {
  const langMap: Record<Locale, string> = {
    'en': 'en',
    'zh-CN': 'zh-CN',
    'ja': 'ja',
  }
  return langMap[locale]
}

interface GiscusCommentsProps {
  className?: string
}

export function GitHubComments({ className }: GiscusCommentsProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const { themeStyle } = useThemeStyle()
  const { locale } = useI18n()

  const mode: ThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return (
      <section className={className}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--prose-h2)' }}>
          Comments
        </h2>
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading comments...</div>
        </div>
      </section>
    )
  }

  return (
    <section className={className}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--prose-h2)' }}>
        Comments
      </h2>
      <Giscus
        id="comments"
        repo={siteConfig.comments.repo}
        repoId={siteConfig.comments.repoId}
        category={siteConfig.comments.category}
        categoryId={siteConfig.comments.categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={getGiscusTheme(themeStyle, mode)}
        lang={getGiscusLang(locale)}
        loading="lazy"
      />
    </section>
  )
}
