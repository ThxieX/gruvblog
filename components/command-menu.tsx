'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { 
  FileText, 
  Home, 
  User, 
  Moon, 
  Sun, 
  Tag,
  Folder,
  Sparkles,
  Gift
} from 'lucide-react'
import { getPosts, getCategories, getTags } from '@/lib/blog-data'
import { useI18n } from '@/lib/i18n-context'

// Confetti effect - enhanced for bigger visual impact
function createConfetti() {
  const colors = ['#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#fe8019']
  const confettiCount = 300
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div')
    const size = Math.random() * 15 + 8
    const startX = Math.random() * window.innerWidth
    const velocityX = (Math.random() - 0.5) * 8
    const velocityY = Math.random() * 4 + 3
    const rotation = Math.random() * 360
    const rotationSpeed = (Math.random() - 0.5) * 10
    
    confetti.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${startX}px;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(confetti)
    
    let y = -20
    let x = startX
    let rot = rotation
    let opacity = 1
    
    const animate = () => {
      y += velocityY
      x += velocityX
      rot += rotationSpeed
      
      // Fade out near bottom
      if (y > window.innerHeight * 0.7) {
        opacity -= 0.02
      }
      
      confetti.style.top = y + 'px'
      confetti.style.left = x + 'px'
      confetti.style.transform = `rotate(${rot}deg)`
      confetti.style.opacity = String(opacity)
      
      if (y < window.innerHeight + 50 && opacity > 0) {
        requestAnimationFrame(animate)
      } else {
        confetti.remove()
      }
    }
    
    // Stagger the start for wave effect
    setTimeout(() => requestAnimationFrame(animate), i * 5)
  }
}

// Celebrate effect (fireworks-like) - enhanced for bigger visual impact
function createCelebrate() {
  const colors = ['#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#fe8019', '#8ec07c']
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  
  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const x = centerX + (Math.random() - 0.5) * 600
      const y = centerY + (Math.random() - 0.5) * 400
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div')
        const angle = (i / 50) * Math.PI * 2
        const velocity = Math.random() * 350 + 150
        const size = Math.random() * 14 + 6
        
        particle.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${x}px;
          top: ${y}px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 ${size/2}px ${colors[Math.floor(Math.random() * colors.length)]};
        `
        document.body.appendChild(particle)
        
        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity
        let px = x, py = y, opacity = 1
        
        const animate = () => {
          px += vx * 0.016
          py += vy * 0.016 + 3
          opacity -= 0.015
          particle.style.left = px + 'px'
          particle.style.top = py + 'px'
          particle.style.opacity = String(opacity)
          particle.style.transform = `scale(${opacity})`
          
          if (opacity > 0) {
            requestAnimationFrame(animate)
          } else {
            particle.remove()
          }
        }
        requestAnimationFrame(animate)
      }
    }, burst * 250)
  }
}

// Randomly trigger one of the easter egg effects
function triggerSurprise() {
  const effects = [createConfetti, createCelebrate]
  effects[Math.floor(Math.random() * effects.length)]()
}

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  
  const posts = getPosts()
  const categories = getCategories()
  const allTags = getTags()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])



  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('cmd.search')} />
      <CommandList>
        <CommandEmpty>{t('cmd.noResults')}</CommandEmpty>
        
        <CommandGroup heading={t('cmd.pages')}>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/'))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>{t('nav.home')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/posts'))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('nav.posts')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/about'))}
          >
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.about')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.easterEgg')}>
          <CommandItem
            onSelect={() => runCommand(() => triggerSurprise())}
          >
            <Gift className="mr-2 h-4 w-4" />
            <span>{t('cmd.surprise')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.posts')}>
          {posts.map((post) => {
            // Build a searchable value covering title, tags, categories, excerpt and AI summary.
            // cmdk filters items by their `value` prop (falling back to text content),
            // so anything we put here becomes searchable while only the title is visible.
            const searchableValue = [
              post.title,
              post.category,
              ...post.categories,
              ...post.tags,
              post.excerpt,
              post.aiSummary ?? '',
            ]
              .filter(Boolean)
              .join(' ')

            const metaLabel = post.categories[0] ?? post.category

            return (
              <CommandItem
                key={post.slug}
                value={`${searchableValue} ${post.slug}`}
                onSelect={() => runCommand(() => router.push(`/posts/${post.slug}`))}
              >
                <FileText className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{post.title}</span>
                {metaLabel && (
                  <span className="ml-auto pl-2 text-xs text-muted-foreground shrink-0">
                    {metaLabel}
                  </span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.categories')}>
          {categories.map((category) => (
            <CommandItem
              key={category.slug}
              onSelect={() => runCommand(() => router.push(`/posts?categories=${encodeURIComponent(category.slug)}`))}
            >
              <Folder className="mr-2 h-4 w-4" />
              <span>{category.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {category.count} posts
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.tags')}>
          <div className="px-2 py-1.5 flex flex-wrap gap-1">
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => runCommand(() => router.push(`/posts?tags=${encodeURIComponent(tag)}`))}
                className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </button>
            ))}
          </div>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="AI">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/ai'))}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span>{t('ai.title')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.actions')}>
          <CommandItem
            onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{t('cmd.toggleTheme')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
