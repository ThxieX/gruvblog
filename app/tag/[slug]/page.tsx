import { redirect } from 'next/navigation'
import { getAllTagSlugs } from '@/lib/blog-data'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllTagSlugs()
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params
  redirect(`/posts?tags=${encodeURIComponent(slug)}`)
}
