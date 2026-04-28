'use client'

import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { getPosts, getCategories, getTags } from '@/lib/blog-data'
import { useI18n } from '@/lib/i18n-context'
import { scoreItem } from '@/lib/command-menu/filter'
import { postToKeywords } from '@/lib/command-menu/post-keywords'
import { triggerSurprise } from '@/lib/command-menu/easter-eggs'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const posts = getPosts()
  const categories = getCategories()
  const allTags = getTags()

  // Pre-compute each post's secondary search corpus once per data change
  // instead of rebuilding on every render.
  const postsWithKeywords = useMemo(
    () => posts.map((post) => ({ post, keywords: postToKeywords(post) })),
    [posts],
  )

  // Cmd+K / Ctrl+K toggles the menu.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const runCommand = (command: () => unknown) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} filter={scoreItem}>
      <CommandInput placeholder={t('cmd.search')} />
      <CommandList>
        <CommandEmpty>{t('cmd.noResults')}</CommandEmpty>

        <CommandGroup heading={t('cmd.pages')}>
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>{t('nav.home')}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/posts'))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('nav.posts')}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/about'))}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.about')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.actions')}>
          <CommandItem
            value={t('cmd.toggleTheme')}
            onSelect={() =>
              runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))
            }
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{t('cmd.toggleTheme')}</span>
          </CommandItem>
          <CommandItem
            value={t('ai.title')}
            onSelect={() => runCommand(() => router.push('/ai'))}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span>{t('ai.title')}</span>
          </CommandItem>
          {/* Hidden easter egg: a bare emoji item with no searchable text.
              Discoverable only by visually scanning the menu — cannot be
              found by typing, regardless of locale. */}
          <CommandItem
            value="🎉"
            onSelect={() => runCommand(() => triggerSurprise())}
          >
            <span>🎉</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmd.posts')}>
          {postsWithKeywords.map(({ post, keywords }) => {
            const metaLabel = post.categories[0] ?? post.category
            return (
              <CommandItem
                key={post.slug}
                value={post.title}
                keywords={keywords}
                onSelect={() =>
                  runCommand(() => router.push(`/posts/${post.slug}`))
                }
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
              value={category.name}
              keywords={[category.slug, category.description].filter(Boolean)}
              onSelect={() =>
                runCommand(() =>
                  router.push(
                    `/posts?categories=${encodeURIComponent(category.slug)}`,
                  ),
                )
              }
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
          {allTags.map((tag) => (
            <CommandItem
              key={tag}
              value={tag}
              onSelect={() =>
                runCommand(() =>
                  router.push(`/posts?tags=${encodeURIComponent(tag)}`),
                )
              }
            >
              <Tag className="mr-2 h-4 w-4" />
              <span>{tag}</span>
            </CommandItem>
          ))}
        </CommandGroup>

      </CommandList>
    </CommandDialog>
  )
}
