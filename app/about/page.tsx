'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Github,
  Twitter,
  Mail,
  MapPin,
  Calendar,
  Zap,
  BookOpen,
  Code,
  Brain,
  Music,
  MonitorSmartphone,
  Monitor,
  Terminal,
  Keyboard,
  Cat,
  ExternalLink,
  Heart,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n-context'
import { siteConfig } from '@/lib/config'

// Core competencies organized by category
const coreStacks = [
  {
    category: 'Backend',
    icon: 'openjdk',
    items: [
      { name: 'Java', icon: 'openjdk' },
      { name: 'Golang', icon: 'GoLand' },
      { name: 'Python', icon: 'python' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Redis', icon: 'redis' },
      { name: 'MQ', icon: 'apacherocketmq' },
    ],
  },
  {
    category: 'Architecture',
    icon: 'databricks',
    items: [
      { name: 'Microservices', icon: 'kubernetes' },
      { name: 'System Design', icon: 'cloudflare' },
      { name: 'High Availability', icon: 'amazonelaticloadbalancing' },
    ],
  },
  {
    category: 'Build',
    icon: 'docker',
    items: [
      { name: 'Docker', icon: 'docker' },
      { name: 'Vercel', icon: 'vercel' },
      { name: 'K8s', icon: 'kubernetes' },
      { name: 'CI/CD', icon: 'githubactions' },
    ],
  },
]

const timeline = [
  {
    year: '2024',
    titleKey: 'AI Research & Development',
    descriptionKey: 'Building AI-powered applications and exploring the frontiers of LLM capabilities.',
  },
  {
    year: '2022',
    titleKey: 'Full-Stack Engineering',
    descriptionKey: 'Developing web applications with a focus on performance and user experience.',
  },
  {
    year: '2020',
    titleKey: 'Started Programming Journey',
    descriptionKey: 'Fell in love with code and the art of building software.',
  },
]

const nowItems = {
  focus: [
    'Building AI-powered developer tools that enhance productivity without adding complexity',

  ],
  learning: [
    'Slowly but consistently, using Anki and immersion',
  ],
  building: [
    'A personal knowledge management system with AI-assisted note connections（Obsidian CLI With AI）',
    'This blog - as a digital garden for ideas and technical explorations',
  ],
  thinking: [
    'How to maintain focus in an age of infinite distractions',
    'Exploring the intersection of LLMs and code generation',
  ],
}

interface Tool {
  name: string
  description: string
  url?: string
  icon?: string // Simple Icons slug
  lucideIcon?: 'keyboard' | 'monitor' | 'cat' // Fallback for brands not in Simple Icons
}

const usesCategories = [
  {
    icon: MonitorSmartphone,
    titleKey: 'uses.hardware',
    items: [
      { name: 'MacBook Pro (Apple Silicon)', description: 'Primary development machine', icon: 'apple' },
      { name: 'iPhone', description: 'Mobile development & testing', icon: 'ios' },
      { name: 'Keyboard Nuphy Air', description: 'Previous: TKL, WASD CODE, Keychron k3', url: 'https://happyhackingkb.com/', lucideIcon: 'keyboard' },
      { name: 'BenQ EW 28" 4K Monitor', description: 'Secondary display for docs', lucideIcon: 'monitor' },
    ] as Tool[],
  },
  {
    icon: Code,
    titleKey: 'uses.editor',
    items: [
      { name: 'JetBrains', description: 'A rich suite of tools', url: 'https://jetbrains.com/', icon: 'jetbrains' },
      { name: 'Zed', description: 'Minimal and crafted editor', url: 'https://zed.dev/', icon: 'zedindustries' },
      { name: 'Neovim', description: 'Secondary editor with LazyVim', url: 'https://neovim.io/', icon: 'neovim' },
      { name: 'Gruvbox Theme', description: 'Warm, retro colors', url: 'https://github.com/morhetz/gruvbox' },
    ] as Tool[],
  },
  {
    icon: Terminal,
    titleKey: 'uses.terminal',
    items: [
      { name: 'Kitty', description: 'Primary terminal, GPU-rendered', url: 'https://sw.kovidgoyal.net/kitty/', lucideIcon: 'cat' },
      { name: 'Warp', description: 'Secondary, AI-powered', url: 'https://warp.dev/', icon: 'warp' },
      { name: 'zsh + Starship', description: 'Shell with minimal prompt', url: 'https://starship.rs/', icon: 'starship' },
      { name: 'yazi + fzf + zoxide + tmux', description: 'Session & fuzzy navigation', icon: 'tmux' },
    ] as Tool[],
  },
  {
    icon: Keyboard,
    titleKey: 'uses.apps',
    items: [
      { name: 'Raycast', description: 'Launcher & automation', url: 'https://www.raycast.com/', icon: 'raycast' },
      { name: 'Obsidian', description: 'Knowledge management', url: 'https://obsidian.md/', icon: 'obsidian' },
      { name: 'Arc Browser', description: 'Modern tab management', url: 'https://arc.net/', icon: 'arc' },
    ] as Tool[],
  },

  {
    icon: Music,
    titleKey: 'uses.entertainment',
    items: [
      { name: 'Van Gogh AG15, Dove dd260s', description: 'Music player', icon: 'guitarpro' },
      { name: 'Zoom H6, IQ7', description: 'Previous: Zoom IQ7, Zoom H6', icon: 'zoom' },
    ] as Tool[],
  },
]

// Projects & Contributions data
const projects = [
  {
    name: 'edgex-ui-go',
    repo: 'edgexfoundry/edgex-ui-go',
  },
]

// Links data
const links = [
  {
    name: 'Dan Abramov',
    description: 'React core team, creator of Redux',
    url: 'https://overreacted.io/',
    avatar: 'D',
  },
  {
    name: 'Josh Comeau',
    description: 'CSS wizard, educator',
    url: 'https://www.joshwcomeau.com/',
    avatar: 'J',
  },
  {
    name: 'Lee Robinson',
    description: 'VP of DX at Vercel',
    url: 'https://leerob.io/',
    avatar: 'L',
  },
  {
    name: 'Tania Rascia',
    description: 'Full-stack developer, writer',
    url: 'https://www.taniarascia.com/',
    avatar: 'T',
  },
  {
    name: 'Kent C. Dodds',
    description: 'Testing expert, educator',
    url: 'https://kentcdodds.com/',
    avatar: 'K',
  },
  {
    name: 'Wes Bos',
    description: 'Web developer, course creator',
    url: 'https://wesbos.com/',
    avatar: 'W',
  },
  {
    name: 'Takuya Matsuyama',
    description: 'devaslife, indie hacker & Inkdrop creator',
    url: 'https://www.craftz.dog/',
    avatar: 'T',
  },
]

type TabType = 'about' | 'now' | 'uses' | 'links'

const VALID_TABS = ['about', 'now', 'uses', 'links'] as const

function getTabFromHash(): TabType {
  if (typeof window === 'undefined') return 'about'
  const hash = window.location.hash.slice(1).toLowerCase()
  return VALID_TABS.includes(hash as TabType) ? (hash as TabType) : 'about'
}

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about')
  const lastUpdated = '2024-01-15'
  const { t } = useI18n()

  // Sync tab state with URL hash
  useEffect(() => {
    // Set initial tab from hash
    setActiveTab(getTabFromHash())

    // Listen for hash changes (browser back/forward)
    const onHashChange = () => setActiveTab(getTabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Update URL hash when tab changes (without triggering hashchange)
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    window.history.replaceState(null, '', tab === 'about' ? '/about' : `#${tab}`)
  }

  const tabs = [
    { id: 'about' as TabType, label: t('about.tab.about') },
    { id: 'now' as TabType, label: t('about.tab.now') },
    { id: 'uses' as TabType, label: t('about.tab.uses') },
    { id: 'links' as TabType, label: t('about.tab.links') },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero - Always visible */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold text-3xl shrink-0">
            T
          </div>

          <div className="flex-1">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-1">
              {siteConfig.author.name}
            </h1>
            <p className="text-sm text-muted-foreground mb-3">
              {t('home.subtitle')}
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
                href={`mailto:${siteConfig.author.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-8 overflow-hidden">
        <nav className="flex gap-6 sm:gap-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Bio */}
            <section>
              <p className="text-lg leading-relaxed mb-4 text-foreground">
                {t('about.bio.intro')}
              </p>
              <p className="text-sm text-muted-foreground font-mono mb-1">
                <span className="opacity-50"># </span>{t('about.bio.line1')}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                <span className="opacity-50"> # </span>{t('about.bio.line2')}
              </p>
            </section>

            {/* Stacks */}
            <section>
              <h2 className="font-serif text-lg font-bold text-foreground mb-5">
                {t('about.stacks')}
              </h2>

              {/* Part 1: Core Competencies by Category */}
              <div className="space-y-5 mb-8">
                {coreStacks.map((stack) => (
                  <div key={stack.category}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <img
                        src={`https://cdn.simpleicons.org/${stack.icon}`}
                        alt=""
                        className="h-4 w-4 opacity-60 dark:invert dark:brightness-90"
                      />
                      <span className="text-sm font-medium text-foreground">{stack.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-6">
                      {stack.items.map((item) => (
                        <span
                          key={item.name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                        >
                          <img
                            src={`https://cdn.simpleicons.org/${item.icon}`}
                            alt=""
                            className="h-3 w-3 opacity-70 dark:invert dark:brightness-90"
                          />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Part 2: AI Philosophy - How I Work */}
              <div className="ai-shimmer group relative p-5 bg-card border border-border rounded-lg transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(254,128,25,0.15)]">
                {/* Intro */}
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('about.stacks.subtitle')}</p>

                {/* Formula */}
                <p className="font-mono text-base text-foreground mb-3">
                  Skills = <span className="text-muted-foreground">Core Logic</span> <span className="mx-1">x</span> <span className="font-medium">AI Proficiency</span>
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Not limited by tools. I focus on leveraging AI to adapt, learn, explore, design, and build beyond my core stacks and across domains.
                </p>
              </div>
            </section>

            {/* Projects & Contributions */}
            <section>
              <h2 className="font-serif text-lg font-bold text-foreground mb-3">
                {t('about.projects')}
              </h2>
              <p className="text-sm text-muted-foreground font-mono mb-5">
                <span className="opacity-50"> # </span>{t('about.projects.intro')}
              </p>


              <div className="space-y-2">
                {projects.map((project) => (
                  <a
                    key={project.repo}
                    href={`https://github.com/${project.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 py-2 px-3 bg-card border border-border rounded-md hover:border-primary/50 transition-colors"
                  >
                    <img
                      src="https://cdn.simpleicons.org/github"
                      alt=""
                      className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity dark:invert dark:brightness-90"
                    />
                    <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                      {project.repo}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <img
                        src={`https://img.shields.io/github/stars/${project.repo}?style=flat&label=&color=gray`}
                        alt="stars"
                        className="h-4 opacity-60"
                      />
                      <img
                        src={`https://img.shields.io/github/forks/${project.repo}?style=flat&label=&color=gray`}
                        alt="forks"
                        className="h-4 opacity-60"
                      />
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                ))}
              </div>
            </section>

            {/* Philosophy */}
            <section>
              <h2 className="font-serif text-lg font-bold text-foreground mb-4">{t('about.philosophy')}</h2>
              <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                &ldquo;Simplicity is the ultimate sophistication.&rdquo;
                <footer className="mt-1 text-sm not-italic">— Leonardo da Vinci</footer>
              </blockquote>
            </section>
          </div>
        )}

        {/* Now Tab */}
        {activeTab === 'now' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 text-sm text-muted-foreground pb-4 border-b border-border">

              <p className="text-muted-foreground text-sm">
                {t('now.description').split('now page')[0]}
                <a
                  href="https://nownownow.com/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  now page
                </a>
                {t('now.description').split('now page')[1] || ''}
              </p>

            </div>



            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="font-serif font-bold text-foreground">{t('now.focus')}</h2>
              </div>
              <ul className="space-y-2">
                {nowItems.focus.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">-</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="font-serif font-bold text-foreground">{t('now.learning')}</h2>
              </div>
              <ul className="space-y-2">
                {nowItems.learning.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">-</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Code className="h-4 w-4 text-primary" />
                <h2 className="font-serif font-bold text-foreground">{t('now.building')}</h2>
              </div>
              <ul className="space-y-2">
                {nowItems.building.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">-</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-primary" />
                <h2 className="font-serif font-bold text-foreground">{t('now.thinking')}</h2>
              </div>
              <ul className="space-y-2">
                {nowItems.thinking.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">-</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Uses Tab */}
        {activeTab === 'uses' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <p className="text-muted-foreground text-sm pb-4 border-b border-border">
              {t('uses.description')}{' '}
              <a
                href="https://uses.tech/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                uses.tech
              </a>.
            </p>

            <div className="grid gap-8 sm:grid-cols-2">
              {usesCategories.map((category) => {
                const Icon = category.icon
                return (
                  <section key={category.titleKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <h2 className="font-serif font-bold text-foreground">{t(category.titleKey)}</h2>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item) => {
                        const LucideIcon = item.lucideIcon === 'keyboard' ? Keyboard : item.lucideIcon === 'monitor' ? Monitor : item.lucideIcon === 'cat' ? Cat : null
                        return (
                        <li key={item.name} className="group flex items-start gap-2">
                          {item.icon ? (
                            <img
                              src={`https://cdn.simpleicons.org/${item.icon}`}
                              alt=""
                              className="h-4 w-4 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity dark:invert dark:brightness-90"
                            />
                          ) : LucideIcon ? (
                            <LucideIcon className="h-4 w-4 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          ) : null}
                          <div className="flex-1">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1"
                              >
                                {item.name}
                                <ExternalLink className="h-3 w-3 opacity-40" />
                              </a>
                            ) : (
                              <span className="text-sm font-medium text-foreground">{item.name}</span>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                        </li>
                      )})}
                    </ul>
                  </section>
                )
              })}
            </div>

            {/* Dotfiles */}
            <section className="p-4 bg-card border border-border rounded-lg">
              <h3 className="font-medium text-foreground text-sm mb-1">{t('uses.dotfiles')}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {t('uses.dotfiles.description')}
              </p>
              <a
                href={`${siteConfig.author.github}/dotfiles`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Code className="h-3 w-3" />
                {siteConfig.author.github.replace('https://', '')}/dotfiles
              </a>
            </section>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <p className="text-muted-foreground text-sm pb-4 border-b border-border">
              {t('links.description')}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold text-lg shrink-0">
                    {link.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {link.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {link.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Apply for friend link */}
            <section className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{t('links.apply')}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('links.apply.description')}
                  </p>
                  <a
                    href={`mailto:${siteConfig.author.email}?subject=Friend Link Exchange`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    {siteConfig.author.email}
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Contact CTA - Always visible */}
      <section className="mt-12 pt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-medium text-foreground mb-1">{t('about.connect')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('about.connect.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`mailto:${siteConfig.author.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email
            </Link>
            <Link
              href={siteConfig.author.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
