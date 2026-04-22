'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { PostCard } from '@/components/post-card'
import { getRecentPosts } from '@/lib/blog-data'
import { useI18n } from '@/lib/i18n-context'
import { siteConfig } from '@/lib/config'

export default function Home() {
  const recentPosts = getRecentPosts(5)
  const { t } = useI18n()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4 text-balance">
          {t('home.greeting')} <span className="text-primary">{siteConfig.author.name}</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t('home.subtitle')}
        </p>
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed max-w-2xl font-mono">
          {/* Identity - diff style */}
          <div>
            <p className="text-foreground/80 mb-1">* <span className="font-semibold">{t('home.label.identity')}</span></p>
            <p className="pl-4">
              <span className="opacity-70">[ - ] </span>
              <span className="line-through">{t('home.identity.old')}</span>
            </p>
            <p className="pl-4">
              <span className="opacity-70">[ + ] </span>
              <span className="font-semibold">{t('home.identity.new')}</span>
            </p>
          </div>
          
          {/* Mindset */}
          <div>
            <p className="text-foreground/80 mb-1">* <span className="font-semibold">{t('home.label.mindset')}</span></p>
            <p className="pl-4">
              <span className="opacity-70">[ + ] </span>
              <span className="font-semibold">{t('home.mindset.a')}</span>
            </p>
          </div>

          {/* Process */}
          <div>
            <p className="text-foreground/80 mb-1">* <span className="font-semibold">{t('home.label.process')}</span></p>
            <p className="pl-4">
              <span className="opacity-70">[ {">"} ] </span>
              <span className="font-semibold">{t('home.process.a')}</span>
            </p>
          </div>
          
          {/* Just for fun */}
          <div>
            <p className="text-foreground/80"><span className="font-semibold">{t('home.justforfun')}</span></p>
          </div>
        </div>
        
        {/* Quick AI chat link */}
        <Link 
          href="/ai"
          className="inline-flex items-center gap-2 mt-10 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">{t('ai.title')}</span>
        </Link>
      </section>

      {/* Recent Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-primary">
            {t('home.recentPosts')}
          </h2>
          <Link 
            href="/posts"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            {t('home.viewAll')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="flex flex-col gap-8">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

    
    </div>
  )
}
