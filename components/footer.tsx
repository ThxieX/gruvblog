'use client'

import Link from 'next/link'
import { Github, Twitter, Rss } from 'lucide-react'
import { siteConfig } from '@/lib/config'

export function Footer() {

  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {siteConfig.site.footerText}
          </p>
          
          <div className="flex items-center gap-4">
            <Link
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href={siteConfig.author.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="/rss.xml"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="RSS Feed"
            >
              <Rss className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
