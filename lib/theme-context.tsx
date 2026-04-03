'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { ThemeStyle, themeVariables } from './themes'

interface ThemeStyleContextType {
  themeStyle: ThemeStyle
  setThemeStyle: (style: ThemeStyle) => void
}

const ThemeStyleContext = createContext<ThemeStyleContextType | undefined>(undefined)

export function useThemeStyle() {
  const context = useContext(ThemeStyleContext)
  if (!context) {
    throw new Error('useThemeStyle must be used within a ThemeStyleProvider')
  }
  return context
}

const validThemeStyles: ThemeStyle[] = ['gruvbox', 'gruvbox-soft', 'gruvbox-high-contrast', 'catppuccin']

function ThemeStyleUpdater({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const { themeStyle } = useThemeStyle()

  useEffect(() => {
    const mode = resolvedTheme === 'dark' ? 'dark' : 'light'
    const variables = themeVariables[themeStyle][mode]
    
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Also update sidebar variables
    const sidebarVars = {
      '--sidebar': variables['--card'],
      '--sidebar-foreground': variables['--foreground'],
      '--sidebar-primary': variables['--primary'],
      '--sidebar-primary-foreground': variables['--primary-foreground'],
      '--sidebar-accent': variables['--secondary'],
      '--sidebar-accent-foreground': variables['--foreground'],
      '--sidebar-border': variables['--border'],
      '--sidebar-ring': variables['--ring'],
    }
    Object.entries(sidebarVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [themeStyle, resolvedTheme])

  return <>{children}</>
}

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>('gruvbox')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only use saved preference, default is already 'gruvbox'
    const saved = localStorage.getItem('theme-style') as ThemeStyle | null
    if (saved && validThemeStyles.includes(saved)) {
      setThemeStyleState(saved)
    }
    setMounted(true)
  }, [])

  const setThemeStyle = useCallback((style: ThemeStyle) => {
    setThemeStyleState(style)
    localStorage.setItem('theme-style', style)
  }, [])

  return (
    <ThemeStyleContext.Provider value={{ themeStyle, setThemeStyle }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {mounted ? <ThemeStyleUpdater>{children}</ThemeStyleUpdater> : children}
      </NextThemesProvider>
    </ThemeStyleContext.Provider>
  )
}
