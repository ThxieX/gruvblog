'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Sparkles, User, Bot, Loader2, Trash2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

// Cloudflare AI Search Public Endpoint
const AI_SEARCH_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL
  ? `${process.env.NEXT_PUBLIC_CLOUDFLARE_AI_SEARCH_URL}/chat/completions`
  : null

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
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

    try {
      const response = await fetch(AI_SEARCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                fullContent += delta
                setStreamingContent(fullContent)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add assistant message when done
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
      }
      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')
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
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [messages, isLoading, t])

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

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return
    sendMessage(question)
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
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-6">
                {t('ai.placeholder')}
              </p>
              
              {/* Suggested questions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="text-xs px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <div className="prose-sm prose-gruvbox whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Streaming response */}
              {isLoading && streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="max-w-[80%] px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
                    <div className="prose-sm prose-gruvbox whitespace-pre-wrap">
                      {streamingContent}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            {t('ai.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
