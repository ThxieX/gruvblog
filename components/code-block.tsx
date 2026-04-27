'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Copy } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-java'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language = 'typescript', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Map common language aliases
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'js': 'javascript',
    'py': 'python',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
  }

  const normalizedLang = languageMap[language] || language

  return (
    <div 
      className="group relative rounded-lg border border-border bg-card overflow-hidden"
      style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/60" />
            <span className="w-3 h-3 rounded-full bg-chart-2/60" />
          </div>
          {filename && (
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {filename}
            </span>
          )}
          {!filename && language && (
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {normalizedLang}
            </span>
          )}
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-colors"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-chart-2">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="p-4 !bg-transparent !border-0 !m-0">
          <code
            ref={codeRef}
            className={`language-${normalizedLang} font-mono text-sm leading-relaxed`}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
