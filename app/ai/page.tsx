'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUp, Square, Sparkles, Loader2, ExternalLink, Copy, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { MarkdownRenderer } from '@/components/markdown-renderer'

// Cloudflare AI Search Public Endpoint
const AI_SEARCH_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL
  ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL}/chat/completions`
  : null

// Maximum number of conversation turns to keep as context
const MAX_CONTEXT_TURNS = 10

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface Source {
  id: string
  score: number
  text: string
  item: {
    key: string
    metadata?: Record<string, unknown>
    timestamp?: number
  }
}

// Helper function to generate post URL from source key
function getSourceUrl(key: string): string | null {
  const match = key.match(/(?:posts\/)?([^/]+?)(?:\.mdx?)?$/i)
  if (match) {
    const slug = match[1].replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
    if (slug) {
      return `/posts/${slug}`
    }
  }
  return null
}

// Helper function to extract title from source
function getSourceTitle(source: Source): string {
  if (source.item.metadata && typeof source.item.metadata.title === 'string') {
    return source.item.metadata.title
  }
  const key = source.item.key
  const match = key.match(/(?:posts\/)?([^/]+?)(?:\.mdx?)?$/i)
  if (match) {
    const slug = match[1].replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  return key
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
    </div>
  )
}

// Sources component - Perplexity style
function Sources({ sources, locale }: { sources: Source[], locale: string }) {
  if (sources.length === 0) return null
  
  const labels = {
    en: 'Sources',
    'zh-CN': '来源',
    ja: '出典',
  }
  const label = labels[locale as keyof typeof labels] || labels.en
  
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
        <span>{label}</span>
        <span className="text-muted-foreground/50">{sources.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sources.slice(0, 5).map((source, index) => {
          const url = getSourceUrl(source.item.key)
          const title = getSourceTitle(source)
          
          if (url) {
            return (
              <Link
                key={source.id}
                href={url}
                className="group flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border rounded-lg transition-all shrink-0"
              >
                <span className="flex items-center justify-center w-5 h-5 bg-primary/10 text-primary text-xs font-medium rounded">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground truncate max-w-[140px]" title={title}>
                  {title}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </Link>
            )
          }
          
          return (
            <span
              key={source.id}
              className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg shrink-0"
            >
              <span className="flex items-center justify-center w-5 h-5 bg-muted text-muted-foreground text-xs font-medium rounded">
                {index + 1}
              </span>
              <span className="text-sm text-foreground truncate max-w-[140px]" title={title}>
                {title}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// Message component
function MessageBlock({ message, locale, isStreaming = false }: { message: Message, locale: string, isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (message.role === 'user') {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-foreground font-medium">{message.content}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-6 bg-secondary/30">
      <div className="max-w-3xl mx-auto px-4">
        {/* Answer */}
        <div className="prose-sm prose-gruvbox [&_p]:mb-3 [&_p:last-child]:mb-0 [&_pre]:my-4 [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1">
          <MarkdownRenderer content={message.content} />
        </div>
        
        {/* Sources - show below answer */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4">
            <Sources sources={message.sources} locale={locale} />
          </div>
        )}
        
        {/* Actions */}
        {!isStreaming && message.content && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const suggestedQuestions = {
  en: [
    'What topics does Thxie write about?',
    'Explain the ReAct pattern for AI agents',
    'Recommend an article about LLMs',
  ],
  'zh-CN': [
    'Thxie 写什么主题的文章？',
    '解释 AI 智能体的 ReAct 模式',
    '推荐一篇关于大语言模型的文章',
  ],
  ja: [
    'Thxieはどんなトピックについて書いていますか？',
    'AIエージェントのReActパターンを説明して',
    'LLMに関する記事をおすすめして',
  ],
}

export default function AIChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentSources, setCurrentSources] = useState<Source[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const { t, locale } = useI18n()

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  // Send message to Cloudflare AI Search
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    if (!AI_SEARCH_URL) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'AI Search is not configured. Please set NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL environment variable.',
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setStreamingContent('')
    setCurrentSources([])

    try {
      const contextMessages = messages
        .slice(-(MAX_CONTEXT_TURNS * 2))
        .map(m => ({ role: m.role, content: m.content }))
      
      const allMessages = [...contextMessages, { role: 'user' as const, content: text.trim() }]
      
      const response = await fetch(AI_SEARCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      readerRef.current = reader

      const decoder = new TextDecoder()
      let fullContent = ''
      let sources: Source[] = []
      let currentEventType = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmed = line.trim()
          
          if (trimmed.startsWith('event:')) {
            currentEventType = trimmed.slice(6).trim()
            continue
          }
          
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              
              if (currentEventType === 'chunks' && Array.isArray(parsed)) {
                sources = parsed.map((chunk: Source) => ({
                  id: chunk.id,
                  score: chunk.score,
                  text: chunk.text,
                  item: chunk.item,
                }))
                setCurrentSources(sources)
              }
              else if (parsed.choices?.[0]?.delta?.content) {
                const delta = parsed.choices[0].delta.content
                fullContent += delta
                setStreamingContent(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        sources: sources.length > 0 ? sources : undefined,
      }
      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')
      setIsLoading(false)
      readerRef.current = null
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('ai.error') || 'Sorry, something went wrong. Please try again.',
      }
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [messages, isLoading, t])

  const stopGeneration = useCallback(async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.cancel()
      } catch {
        // Ignore cancel errors
      }
      readerRef.current = null
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    if (streamingContent) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: streamingContent,
        sources: currentSources.length > 0 ? currentSources : undefined,
      }
      setMessages(prev => [...prev, assistantMessage])
    }
    
    setIsLoading(false)
    setStreamingContent('')
    setCurrentSources([])
  }, [streamingContent, currentSources])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return
    sendMessage(question)
  }

  const questions = suggestedQuestions[locale as keyof typeof suggestedQuestions] || suggestedQuestions.en

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('misc.backToHome')}</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{t('ai.title')}</span>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('ai.clear')}
            </button>
          )}
        </div>
      </header>

      {/* Main content - scrollable area */}
      <main className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {t('ai.title')}
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('ai.subtitle')}
              </p>
            </div>
            
            {/* Suggested questions */}
            <div className="grid gap-3 sm:grid-cols-3">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                  className="text-left p-4 bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border rounded-xl transition-all group"
                >
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="divide-y divide-border/50">
            {messages.map((message) => (
              <MessageBlock key={message.id} message={message} locale={locale} />
            ))}
            
            {/* Streaming response */}
            {isLoading && (streamingContent || currentSources.length > 0) && (
              <div className="py-6 bg-secondary/30">
                <div className="max-w-3xl mx-auto px-4">
                  {streamingContent ? (
                    <>
                      <div className="prose-sm prose-gruvbox [&_p]:mb-3 [&_p:last-child]:mb-0 [&_pre]:my-4 [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1">
                        <MarkdownRenderer content={streamingContent} />
                      </div>
                      {currentSources.length > 0 && (
                        <div className="mt-4">
                          <Sources sources={currentSources} locale={locale} />
                        </div>
                      )}
                    </>
                  ) : (
                    <TypingIndicator />
                  )}
                </div>
              </div>
            )}

            {/* Loading state - no content yet */}
            {isLoading && !streamingContent && currentSources.length === 0 && (
              <div className="py-6 bg-secondary/30">
                <div className="max-w-3xl mx-auto px-4">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input area - always at bottom */}
      <footer className="shrink-0 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.placeholder')}
              rows={1}
              className="w-full px-4 py-3 pr-14 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            />
            
            <div className="absolute right-2 bottom-2">
              {isLoading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  title={t('ai.stop') || 'Stop'}
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          
          <p className="text-xs text-muted-foreground/60 text-center mt-3">
            {t('ai.disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  )
}
