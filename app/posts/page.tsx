'use client'

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PostCard } from '@/components/post-card'
import { getPosts, getCategories, getTags } from '@/lib/blog-data'
import { Tag as TagIcon, Folder, ChevronDown, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const INITIAL_YEARS_TO_SHOW = 5

// Filter chip component for toggleable selection
function FilterChip({
  label,
  isSelected,
  onClick,
  size = 'default',
}: {
  label: string
  isSelected: boolean
  onClick: () => void
  size?: 'default' | 'small'
}) {
  const sizeClasses = size === 'small' 
    ? 'text-xs px-2 py-1' 
    : 'text-sm px-3 py-1.5'
  
  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} rounded-md transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
        isSelected
          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
      {isSelected && <X className="h-3 w-3" />}
    </button>
  )
}

// Filter section with dialog modal for viewing all items
function FilterSection({
  title,
  icon,
  items,
  selectedItems,
  onToggle,
  itemKey,
  visibleCount = 6,
}: {
  title: string
  icon: React.ReactNode
  items: { name: string; slug: string }[] | string[]
  selectedItems: Set<string>
  onToggle: (item: string) => void
  itemKey: 'slug' | 'name'
  visibleCount?: number
}) {
  const getName = (item: { name: string; slug: string } | string) => 
    typeof item === 'string' ? item : item.name
  
  const getKey = (item: { name: string; slug: string } | string) => 
    typeof item === 'string' ? item : (itemKey === 'slug' ? item.slug : item.name)
  
  const visibleItems = items.slice(0, visibleCount)
  const overflowItems = items.slice(visibleCount)
  const overflowCount = overflowItems.length
  const hasMore = overflowCount > 0
  
  // Count how many hidden items are selected
  const hiddenSelectedCount = overflowItems.filter(item => selectedItems.has(getKey(item))).length

  return (
    <div>
      <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex flex-wrap gap-2 items-center">
        {visibleItems.map((item) => {
          const key = getKey(item)
          const name = getName(item)
          return (
            <FilterChip
              key={key}
              label={name}
              isSelected={selectedItems.has(key)}
              onClick={() => onToggle(key)}
              size={itemKey === 'name' ? 'small' : 'default'}
            />
          )
        })}
        {hasMore && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={`text-xs px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  hiddenSelectedCount > 0
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                }`}
              >
                ... +{overflowCount}
                {hiddenSelectedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px] leading-none font-medium">
                    {hiddenSelectedCount}
                  </span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {icon}
                  All {title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 pt-4">
                {items.map((item) => {
                  const key = getKey(item)
                  const name = getName(item)
                  return (
                    <FilterChip
                      key={key}
                      label={name}
                      isSelected={selectedItems.has(key)}
                      onClick={() => onToggle(key)}
                      size="default"
                    />
                  )
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

// Active filters summary bar
function ActiveFilterBar({
  selectedCategories,
  selectedTags,
  categories,
  matchCount,
  onClearAll,
  onRemoveCategory,
  onRemoveTag,
  t,
}: {
  selectedCategories: Set<string>
  selectedTags: Set<string>
  categories: { name: string; slug: string }[]
  matchCount: number
  onClearAll: () => void
  onRemoveCategory: (slug: string) => void
  onRemoveTag: (tag: string) => void
  t: (key: string) => string
}) {
  const hasFilters = selectedCategories.size > 0 || selectedTags.size > 0
  
  if (!hasFilters) return null

  const getCategoryName = (slug: string) => {
    const cat = categories.find(c => c.slug === slug)
    return cat?.name || slug
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 px-4 bg-primary/5 border border-primary/10 rounded-lg mb-6">
      <span className="text-sm text-muted-foreground">
        {t('filter.showing')} <strong className="text-foreground">{matchCount}</strong> {t('filter.matchingPosts')}
      </span>
      <div className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">
        {Array.from(selectedCategories).map(slug => (
          <button 
            key={slug} 
            onClick={() => onRemoveCategory(slug)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors cursor-pointer group"
          >
            <Folder className="h-3 w-3" />
            {getCategoryName(slug)}
            <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
        {Array.from(selectedTags).map(tag => (
          <button 
            key={tag} 
            onClick={() => onRemoveTag(tag)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors cursor-pointer group"
          >
            <TagIcon className="h-3 w-3" />
            {tag}
            <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
      </div>
      <button
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
      >
        <X className="h-3 w-3" />
        {t('filter.clearAll')}
      </button>
    </div>
  )
}

// Sidebar with filter controls
function FilterSidebar({
  categories,
  allTags,
  selectedCategories,
  selectedTags,
  onToggleCategory,
  onToggleTag,
  t,
}: {
  categories: { name: string; slug: string }[]
  allTags: string[]
  selectedCategories: Set<string>
  selectedTags: Set<string>
  onToggleCategory: (slug: string) => void
  onToggleTag: (tag: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="flex flex-col gap-6">
      <FilterSection
        title={t('cmd.categories')}
        icon={<Folder className="h-4 w-4" />}
        items={categories}
        selectedItems={selectedCategories}
        onToggle={onToggleCategory}
        itemKey="slug"
        visibleCount={8}
      />
      <FilterSection
        title={t('cmd.tags')}
        icon={<TagIcon className="h-4 w-4" />}
        items={allTags}
        selectedItems={selectedTags}
        onToggle={onToggleTag}
        itemKey="name"
        visibleCount={12}
      />
    </div>
  )
}

// Timeline year section
function TimelineYear({
  year,
  posts,
  isLast,
  onCategoryClick,
  onTagClick,
}: {
  year: number
  posts: ReturnType<typeof getPosts>
  isLast: boolean
  onCategoryClick: (category: string) => void
  onTagClick: (tag: string) => void
}) {
  return (
    <div className="relative">
      <div
        className={`absolute left-[7px] top-8 w-px bg-border ${isLast ? 'h-0' : 'h-full'}`}
        aria-hidden="true"
      />
      <div className="flex items-center gap-4 mb-6">
        <div className="relative z-10 flex items-center justify-center w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
        <h2 className="font-mono text-lg font-semibold text-primary">{year}</h2>
        <span className="text-xs text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'}
        </span>
      </div>
      <div className="pl-8 flex flex-col gap-6 pb-8">
        {posts.map((post) => (
          <PostCard 
            key={post.slug} 
            post={post} 
            onCategoryClick={onCategoryClick}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </div>
  )
}

// Empty state when no posts match
function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
        <Folder className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t('filter.noResults')}
      </h3>
      <p className="text-muted-foreground text-sm">
        {t('filter.tryClearing')}
      </p>
    </div>
  )
}

function PostsPageContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [visibleYearsCount, setVisibleYearsCount] = useState(INITIAL_YEARS_TO_SHOW)

  const posts = getPosts()
  const categories = getCategories()
  const allTags = getTags()

  // Parse URL params for filter state
  const selectedCategories = useMemo(() => {
    const param = searchParams.get('categories')
    return new Set(param ? param.split(',').filter(Boolean) : [])
  }, [searchParams])

  const selectedTags = useMemo(() => {
    const param = searchParams.get('tags')
    return new Set(param ? param.split(',').filter(Boolean) : [])
  }, [searchParams])

  // Update URL when filters change
  const updateFilters = useCallback((newCategories: Set<string>, newTags: Set<string>) => {
    const params = new URLSearchParams()
    
    if (newCategories.size > 0) {
      params.set('categories', Array.from(newCategories).join(','))
    }
    if (newTags.size > 0) {
      params.set('tags', Array.from(newTags).join(','))
    }
    
    const queryString = params.toString()
    router.push(queryString ? `/posts?${queryString}` : '/posts', { scroll: false })
  }, [router])

  const toggleCategory = useCallback((slug: string) => {
    const newCategories = new Set(selectedCategories)
    if (newCategories.has(slug)) {
      newCategories.delete(slug)
    } else {
      newCategories.add(slug)
    }
    updateFilters(newCategories, selectedTags)
  }, [selectedCategories, selectedTags, updateFilters])

  const toggleTag = useCallback((tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    updateFilters(selectedCategories, newTags)
  }, [selectedCategories, selectedTags, updateFilters])

  const clearAllFilters = useCallback(() => {
    router.push('/posts', { scroll: false })
  }, [router])

  // Filter posts based on selected categories and tags
  const filteredPosts = useMemo(() => {
    let result = [...posts]
    
    // Filter by categories (OR logic within categories)
    if (selectedCategories.size > 0) {
      result = result.filter(post => 
        selectedCategories.has(post.category) ||
        post.categories.some(cat => {
          const slug = cat.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5-]/g, '').replace(/\s+/g, '-')
          return selectedCategories.has(slug)
        })
      )
    }
    
    // Filter by tags (OR logic within tags)
    if (selectedTags.size > 0) {
      result = result.filter(post => 
        post.tags.some(tag => selectedTags.has(tag))
      )
    }
    
    return result
  }, [posts, selectedCategories, selectedTags])

  // Sort and group filtered posts by year
  const sortedPosts = useMemo(() => 
    [...filteredPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ), [filteredPosts])

  const postsByYear = useMemo(() => 
    sortedPosts.reduce((acc, post) => {
      const year = new Date(post.date).getFullYear()
      if (!acc[year]) acc[year] = []
      acc[year].push(post)
      return acc
    }, {} as Record<number, typeof posts>
  ), [sortedPosts])

  const allYears = Object.keys(postsByYear).map(Number).sort((a, b) => b - a)
  const visibleYears = allYears.slice(0, visibleYearsCount)
  const hiddenYears = allYears.slice(visibleYearsCount)
  const hasMoreYears = hiddenYears.length > 0
  const hiddenPostsCount = hiddenYears.reduce((sum, year) => sum + postsByYear[year].length, 0)

  // Reset visible years when filters change
  useEffect(() => {
    setVisibleYearsCount(INITIAL_YEARS_TO_SHOW)
  }, [selectedCategories, selectedTags])

  const loadMore = () => {
    setVisibleYearsCount((prev) => prev + 2)
  }

  const hasActiveFilters = selectedCategories.size > 0 || selectedTags.size > 0

  return (
    <div className="py-12 sm:py-16 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            {t('posts.title')}
          </h1>
          <p className="text-muted-foreground">{t('posts.description')}</p>
        </header>

        {/* Mobile/Tablet: Filters */}
        <div className="xl:hidden mb-8 p-4 bg-secondary/30 rounded-lg">
          <FilterSidebar
            categories={categories}
            allTags={allTags}
            selectedCategories={selectedCategories}
            selectedTags={selectedTags}
            onToggleCategory={toggleCategory}
            onToggleTag={toggleTag}
            t={t}
          />
        </div>

        {/* Active Filter Summary */}
        <ActiveFilterBar
          selectedCategories={selectedCategories}
          selectedTags={selectedTags}
          categories={categories}
          matchCount={filteredPosts.length}
          onClearAll={clearAllFilters}
          onRemoveCategory={toggleCategory}
          onRemoveTag={toggleTag}
          t={t}
        />

        {/* Posts or Empty State */}
        {filteredPosts.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="relative">
            {visibleYears.map((year, index) => (
              <TimelineYear
                key={year}
                year={year}
                posts={postsByYear[year]}
                isLast={index === visibleYears.length - 1 && !hasMoreYears}
                onCategoryClick={toggleCategory}
                onTagClick={toggleTag}
              />
            ))}

            {hasMoreYears && (
              <div className="relative">
                <div
                  className="absolute left-[7px] top-0 w-px h-12 bg-border"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-4 pt-4">
                  <div className="relative z-10 flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 ring-4 ring-background">
                    <ChevronDown className="w-3 h-3 text-primary" />
                  </div>
                  <button
                    onClick={loadMore}
                    className="group flex items-center gap-3 px-4 py-2.5 bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-sm font-medium text-foreground">{t('posts.loadEarlier')}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                      {hiddenYears.join(' · ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {hiddenPostsCount} {t('posts.articles')}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="hidden xl:block fixed top-32 w-52"
        style={{ left: 'calc(50% + 384px + 32px)' }}
      >
        <FilterSidebar
          categories={categories}
          allTags={allTags}
          selectedCategories={selectedCategories}
          selectedTags={selectedTags}
          onToggleCategory={toggleCategory}
          onToggleTag={toggleTag}
          t={t}
        />
      </aside>
    </div>
  )
}

// Loading skeleton for the posts page
function PostsPageSkeleton() {
  return (
    <div className="py-12 sm:py-16 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="h-10 w-32 bg-secondary/50 rounded animate-pulse mb-4" />
          <div className="h-5 w-64 bg-secondary/30 rounded animate-pulse" />
        </header>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-secondary/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsPageSkeleton />}>
      <PostsPageContent />
    </Suspense>
  )
}
