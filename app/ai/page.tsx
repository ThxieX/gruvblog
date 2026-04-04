'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Square, Sparkles, Bot, Trash2, FileText, ExternalLink, Copy, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { MarkdownRenderer } from '@/components/markdown-renderer'

// Cloudflare AI Search Public Endpoint
const AI_SEARCH_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL
  ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL}/chat/completions`
  : null

// Maximum number of conversation turns to keep as context (user + assistant pairs)
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

// Typing indicator component (three bouncing dots)
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
    </div>
  )
}

// Helper function to generate post URL from source key
function getSourceUrl(key: string): string | null {
  // Handle different key formats from Cloudflare AI Search
  // e.g., "2015-06-26-singleton-pattern.md", "posts/my-article.md", "content/posts/slug.mdx"
  const match = key.match(/(?:posts\/)?([^/]+?)(?:\.mdx?)?$/i)
  if (match) {
    // Remove date prefix (e.g., "2015-06-26-" or "2015_06_26-") to get the actual slug
    const slug = match[1].replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
    if (slug) {
      return `/posts/${slug}`
    }
  }
  return null
}

// Helper function to extract title from source
function getSourceTitle(source: Source): string {
  // Try to get title from metadata first
  if (source.item.metadata && typeof source.item.metadata.title === 'string') {
    return source.item.metadata.title
  }
  // Fall back to key-based title
  const key = source.item.key
  const match = key.match(/(?:posts\/)?([^/]+?)(?:\.mdx?)?$/i)
  if (match) {
    // Remove date prefix, then convert slug to readable title
    const slug = match[1].replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  return key
}

// Sources card component
function SourcesCard({ sources, label }: { sources: Source[], label: string }) {
  if (sources.length === 0) return null
  
  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <FileText className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.slice(0, 5).map((source) => {
          const url = getSourceUrl(source.item.key)
          const title = getSourceTitle(source)
          
          if (url) {
            return (
              <Link
                key={source.id}
                href={url}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-background/50 border border-border/50 rounded-md hover:bg-primary/10 hover:border-primary/50 hover:shadow-sm transition-all duration-200 group"
              >
                <span className="truncate max-w-[200px]" title={title}>{title}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </Link>
            )
          }
          
          return (
            <span
              key={source.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-background/50 border border-border/50 rounded-md"
            >
              <span className="truncate max-w-[200px]" title={title}>{title}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// Message bubble component with copy functionality
function MessageBubble({ message, sourcesLabel }: { message: Message, sourcesLabel: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div
      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className="max-w-[80%] group">
        <div
          className={`px-4 py-2 rounded-lg ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {message.role === 'assistant' ? (
            <>
              <div className="prose-sm prose-gruvbox [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:my-2 [&_ul]:my-2 [&_ol]:my-2">
                <MarkdownRenderer content={message.content} />
              </div>
              {message.sources && message.sources.length > 0 && (
                <SourcesCard sources={message.sources} label={sourcesLabel} />
              )}
            </>
          ) : (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
        
        {/* Copy button for assistant messages */}
        {message.role === 'assistant' && message.content && (
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-colors"
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
    </div>
  )
}

const suggestedQuestions = {
  en: [
    'What topics does Thxie write about?',
    'Explain the ReAct pattern for AI agents',
    'What is Thxie\'s philosophy on code?',
    'Recommend an article about LLMs',
  ],
  'zh-CN': [
    'Thxie 写什么主题的文章？',
    '解释 AI 智能体的 ReAct 模式',
    'Thxie 的代码哲学是什么？',
    '推荐一篇关于大语言模型的文章',
  ],
  ja: [
    'Thxieはどんなトピックについて書いていますか？',
    'AIエージェントのReActパターンを説明して',
    'Thxieのコード哲学は何ですか？',
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const { t, locale } = useI18n()

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

    // Cancel any ongoing request
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
      // Build conversation history with max context turns
      // Take the last N messages (user + assistant pairs = 2 * MAX_CONTEXT_TURNS messages)
      const contextMessages = messages
        .slice(-(MAX_CONTEXT_TURNS * 2))
        .map(m => ({ role: m.role, content: m.content }))
      
      // Add current user message
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
          
          // Track event type
          if (trimmed.startsWith('event:')) {
            currentEventType = trimmed.slice(6).trim()
            continue
          }
          
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              
              // Handle chunks event (RAG sources)
              if (currentEventType === 'chunks' && Array.isArray(parsed)) {
                sources = parsed.map((chunk: Source) => ({
                  id: chunk.id,
                  score: chunk.score,
                  text: chunk.text,
                  item: chunk.item,
                }))
                setCurrentSources(sources)
              }
              // Handle regular chat completion delta
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

      // Add assistant message when done, include sources
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
        // Handled by stopGeneration, don't do anything here
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

  // Stop generation and keep already streamed content
  const stopGeneration = useCallback(async () => {
    // Cancel the reader first to properly close the connection
    if (readerRef.current) {
      try {
        await readerRef.current.cancel()
      } catch {
        // Ignore cancel errors
      }
      readerRef.current = null
    }
    
    // Then abort the fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    // Save the streamed content as a message if any
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleClear = () => {
    setMessages([])
  }

  const questions = suggestedQuestions[locale] || suggestedQuestions.en

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Back link */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('misc.backToHome')}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {t('ai.title')}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t('ai.subtitle')}
        </p>
      </header>

      {/* Chat container */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Messages area */}
        <div className="min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              
              {/* Suggested questions as cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left text-sm px-4 py-3 bg-secondary/50 text-secondary-foreground rounded-lg border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-foreground transition-all duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  sourcesLabel={t('ai.sources')}
                />
              ))}
              
              {/* Streaming response */}
              {isLoading && streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="max-w-[80%] px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
                    <div className="prose-sm prose-gruvbox [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:my-2 [&_ul]:my-2 [&_ol]:my-2">
                      <MarkdownRenderer content={streamingContent} />
                    </div>
                    {currentSources.length > 0 && (
                      <SourcesCard sources={currentSources} label={t('ai.sources')} />
                    )}
                  </div>
                </div>
              )}

              {/* Loading indicator with typing animation */}
              {isLoading && !streamingContent && (
                <div className="flex gap-3 justify-start animate-in fade-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-secondary text-secondary-foreground">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.placeholder')}
              className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title={t('ai.clear')}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
                title={t('ai.stop') || 'Stop generating'}
              >
                <Square className="h-5 w-5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            {t('ai.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
