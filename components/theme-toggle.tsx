'use client'

import { Moon, Sun, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useThemeStyle } from '@/lib/theme-context'
import { themeStyles } from '@/lib/themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { themeStyle, setThemeStyle } = useThemeStyle()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 text-muted-foreground" aria-label="Toggle theme">
        <Palette className="h-5 w-5" />
      </button>
    )
  }

  const gruvboxThemes = themeStyles.filter(s => s.family === 'gruvbox')
  const catppuccinThemes = themeStyles.filter(s => s.family === 'catppuccin')

  const RadioIndicator = ({ selected }: { selected: boolean }) => (
    <span className={`text-xs ${selected ? 'text-primary' : 'text-muted-foreground/30'}`}>
      {selected ? '●' : '○'}
    </span>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
          aria-label="Theme settings"
        >
          <Palette className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {/* Mode Section */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-normal">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => setTheme('light')}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </span>
            <RadioIndicator selected={theme === 'light'} />
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme('dark')}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </span>
            <RadioIndicator selected={theme === 'dark'} />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {/* Style Section */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-normal mt-2">
          Style
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {gruvboxThemes.map((style) => (
            <DropdownMenuItem
              key={style.value}
              onClick={() => setThemeStyle(style.value)}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{style.label}</span>
              <RadioIndicator selected={themeStyle === style.value} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <div className="my-1 mx-2 border-t border-dashed border-border/40" />
        
        <DropdownMenuGroup>
          {catppuccinThemes.map((style) => (
            <DropdownMenuItem
              key={style.value}
              onClick={() => setThemeStyle(style.value)}
              className="flex items-center justify-between"
            >
              <span className="text-sm">{style.label}</span>
              <RadioIndicator selected={themeStyle === style.value} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
