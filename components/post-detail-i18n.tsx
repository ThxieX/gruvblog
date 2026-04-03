'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

export function BackToPostsLink() {
  const { t } = useI18n()
  
  return (
    <Link
      href="/posts"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('post.backToPosts')}
    </Link>
  )
}

export function AiSummaryLabel() {
  const { t } = useI18n()
  
  return (
    <span className="text-sm font-medium">{t('post.aiSummary')}</span>
  )
}


