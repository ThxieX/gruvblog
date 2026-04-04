'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowUp, Square, Sparkles, ExternalLink, Copy, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { MarkdownRenderer } from '@/components/markdown-renderer'

// Cloudflare AI Search Public Endpoint
const AI_SEARCH_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL
  ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL}/chat/completions`
  : null

// Maximum conversation turns to keep as context
const MAX_CONTEXT_TURNS = 10

// Chat window height
const CHAT_HEIGHT = 'h-[600px]'

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

// ============================================================================
// Utility Functions
// ============================================================================

function getSourceUrl(key: string): string | null {
  const match = key.match(/(?:posts\/)?([^/]+?)(?:\.mdx?)?$/i)
  if (match) {
    const slug = match[1].replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
    if (slug) return `/posts/${slug}`
  }
  return null
}

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

// ============================================================================
// Sub-components
// ============================================================================

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2">
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
    </div>
  )
}

function Sources({ sources, locale }: { sources: Source[], locale: string }) {
  if (sources.length === 0) return null
  
  const labels: Record<string, string> = {
    en: 'Sources',
    'zh-CN': '来源',
    ja: '出典',
  }
  
  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <span>{labels[locale] || labels.en}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.slice(0, 5).map((source, index) => {
          const url = getSourceUrl(source.item.key)
          const title = getSourceTitle(source)
          
          if (url) {
            return (
              <Link
                key={source.id}
                href={url}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary/80 hover:bg-secondary border border-border/50 hover:border-border rounded-md transition-colors group"
              >
                <span className="text-primary/70 font-medium">{index + 1}</span>
                <span className="truncate max-w-[120px]" title={title}>{title}</span>
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/50 group-hover:text-primary" />
              </Link>
            )
          }
          
          return (
            <span
              key={source.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary/80 border border-border/50 rounded-md"
            >
              <span className="text-muted-foreground font-medium">{index + 1}</span>
              <span className="truncate max-w-[120px]" title={title}>{title}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[85%] px-4 py-2.5 bg-primary text-primary-foreground rounded-2xl rounded-br-md">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

function AssistantMessage({ 
  message, 
  locale, 
  isStreaming = false 
}: { 
  message: Message
  locale: string
  isStreaming?: boolean 
}) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="mb-4">
      <div className="prose-sm prose-gruvbox max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:my-3 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5">
        <MarkdownRenderer content={message.content} />
      </div>
      
      {message.sources && message.sources.length > 0 && (
        <Sources sources={message.sources} locale={locale} />
      )}
      
      {!isStreaming && message.content && (
        <div className="mt-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState({ 
  questions, 
  onSelect, 
  isLoading,
  t 
}: { 
  questions: string[]
  onSelect: (q: string) => void
  isLoading: boolean
  t: (key: string) => string
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-lg font-medium text-foreground mb-2">
        {t('ai.title')}
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {t('ai.subtitle')}
      </p>
      <div className="w-full space-y-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 text-sm bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border rounded-lg transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Suggested Questions
// ============================================================================

const suggestedQuestions: Record<string, string[]> = {
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

// ============================================================================
// Main Component
// ============================================================================

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
  const questions = suggestedQuestions[locale] || suggestedQuestions.en

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    if (!AI_SEARCH_URL) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'AI Search is not configured.',
      }])
      return
    }

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')
    setCurrentSources([])

    try {
      const contextMessages = messages
        .slice(-(MAX_CONTEXT_TURNS * 2))
        .map(m => ({ role: m.role, content: m.content }))
      
      const response = await fetch(AI_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...contextMessages, { role: 'user', content: text.trim() }],
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

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
                sources = parsed.map((c: Source) => ({
                  id: c.id,
                  score: c.score,
                  text: c.text,
                  item: c.item,
                }))
                setCurrentSources(sources)
              } else if (parsed.choices?.[0]?.delta?.content) {
                fullContent += parsed.choices[0].delta.content
                setStreamingContent(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        sources: sources.length > 0 ? sources : undefined,
      }])
      setStreamingContent('')
      setIsLoading(false)
      readerRef.current = null
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('ai.error') || 'Sorry, something went wrong.',
      }])
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [messages, isLoading, t])

  // Stop generation
  const stopGeneration = useCallback(async () => {
    try {
      await readerRef.current?.cancel()
    } catch {}
    readerRef.current = null
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    
    if (streamingContent) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: streamingContent,
        sources: currentSources.length > 0 ? currentSources : undefined,
      }])
    }
    
    setIsLoading(false)
    setStreamingContent('')
    setCurrentSources([])
  }, [streamingContent, currentSources])

  // Form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const clearChat = () => {
    setMessages([])
    setStreamingContent('')
    setCurrentSources([])
  }

  const hasMessages = messages.length > 0 || streamingContent

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-2">
            {t('ai.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('ai.subtitle')}
          </p>
        </header>

        {/* Chat Container */}
        <div className={`${CHAT_HEIGHT} flex flex-col bg-background border border-border rounded-xl overflow-hidden`}>
          {/* Chat Header */}
          {hasMessages && (
            <div className="shrink-0 px-4 py-2 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{messages.filter(m => m.role === 'user').length} messages</span>
              </div>
              <button
                onClick={clearChat}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('ai.clear')}
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!hasMessages ? (
              <EmptyState 
                questions={questions} 
                onSelect={sendMessage} 
                isLoading={isLoading}
                t={t}
              />
            ) : (
              <div className="p-4">
                {messages.map((message) => (
                  message.role === 'user' ? (
                    <UserMessage key={message.id} content={message.content} />
                  ) : (
                    <AssistantMessage 
                      key={message.id} 
                      message={message} 
                      locale={locale} 
                    />
                  )
                ))}
                
                {/* Streaming */}
                {isLoading && streamingContent && (
                  <AssistantMessage 
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streamingContent,
                      sources: currentSources,
                    }}
                    locale={locale}
                    isStreaming
                  />
                )}
                
                {/* Typing indicator */}
                {isLoading && !streamingContent && (
                  <TypingIndicator />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-3 border-t border-border/50">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.placeholder')}
                rows={1}
                className="w-full px-4 py-2.5 pr-12 bg-secondary/50 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
              
              <div className="absolute right-2 bottom-1.5">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="p-1.5 bg-destructive/90 text-destructive-foreground rounded-lg hover:bg-destructive transition-colors"
                    title={t('ai.stop')}
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center mt-4">
          {t('ai.disclaimer')}
        </p>
      </div>
    </div>
  )
}
