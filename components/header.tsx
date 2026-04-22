'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Command, Menu, X, Sparkles } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { ThemeToggle } from './theme-toggle'
import { LanguageSelector } from './language-selector'
import { useI18n } from '@/lib/i18n-context'
import { siteConfig } from '@/lib/config'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const [readProgress, setReadProgress] = useState(0)
  const lastScrollY = useRef(0)
  const { t } = useI18n()
  
  // Check if we're on a post detail page
  const isPostPage = pathname.startsWith('/posts/') && pathname !== '/posts'

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/posts', label: t('nav.posts') },
    { href: '/about', label: t('nav.about') },
  ]

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  // Smart hide logic + reading progress
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingUp = currentScrollY < lastScrollY.current
      const isTop = currentScrollY < 10

      setIsAtTop(isTop)

      // Show header when scrolling up or at top
      // Hide header when scrolling down (and not at top)
      if (isScrollingUp || isTop) {
        setIsVisible(true)
      } else if (currentScrollY > 100 && !isScrollingUp) {
        setIsVisible(false)
      }

      // Update reading progress for post pages
      if (isPostPage) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0
        setReadProgress(Math.min(100, Math.max(0, progress)))
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isPostPage])

  const openCommandMenu = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <>
      {/* Reading Progress Bar - Fixed at top, independent of header */}
      {isPostPage && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-secondary/30">
          <div 
            className="h-full bg-primary transition-all duration-150 ease-out"
            style={{ width: `${readProgress}%` }}
          />
        </div>
      )}
      
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isAtTop ? "bg-background" : "bg-background/80 backdrop-blur-md border-b border-border"
        )}
      >
        <nav className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with icon */}
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{siteConfig.author.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            {/* Search button */}
            <button
              onClick={openCommandMenu}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Command className="h-3.5 w-3.5" />
              <span className="text-xs">
                {isMac ? 'K' : 'Ctrl K'}
              </span>
            </button>

            {/* Language selector */}
            <LanguageSelector />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-2 pt-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  openCommandMenu()
                }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Command className="h-4 w-4" />
                {t('nav.search')}
              </button>
            </div>
          </div>
        )}
      </nav>
      </header>
    </>
  )
}
