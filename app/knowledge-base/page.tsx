import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { KnowledgeBaseClient } from '@/components/KnowledgeBaseClient'

export const dynamic = 'force-dynamic'

interface Article {
  id: number
  title?: string
  content?: string
  category?: string
  url?: string
  [key: string]: any
}

export default async function KB() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  // Fetch articles from Google Sheets
  let articles: Article[] = []
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/knowledge-base`, {
      cache: 'no-store'
    })
    if (response.ok) {
      const data = await response.json()
      articles = data.articles || []
    }
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
  }
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-heading text-4xl mb-6 text-brand-light">Knowledge Base</h1>
      <p className="text-brand-grey2 mb-8 text-lg">Find answers to common questions about Lowther products and services.</p>
      
      <KnowledgeBaseClient articles={articles} />
    </section>
  )
}
