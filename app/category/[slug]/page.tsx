import { redirect } from 'next/navigation'
import { getAllCategorySlugs } from '@/lib/blog-data'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllCategorySlugs()
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  redirect(`/posts?categories=${encodeURIComponent(slug)}`)
}
