'use client'

import { Globe, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { locales, localeNames, localeShortNames, Locale } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSelector() {
  const { locale, setLocale } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">{localeShortNames[locale]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc as Locale)}
            className="flex items-center justify-between"
          >
            <span>{localeNames[loc as Locale]}</span>
            {locale === loc && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
