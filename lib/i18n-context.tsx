'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Locale, t as translate } from './i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only use saved preference, default to English
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && ['en', 'zh-CN', 'ja'].includes(saved)) {
      setLocaleState(saved)
    }
    // Default is already 'en', no need to change
    setMounted(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    
    // Update html lang attribute
    document.documentElement.lang = newLocale === 'zh-CN' ? 'zh-Hans' : newLocale
  }, [])

  const t = useCallback((key: string) => {
    return translate(key, locale)
  }, [locale])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: 'en', setLocale, t: (key) => translate(key, 'en') }}>
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
