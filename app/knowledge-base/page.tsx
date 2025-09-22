import Link from 'next/link'
// import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function KB() {
  // const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } })
  const articles: any[] = [] // Temporary placeholder
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-heading text-4xl mb-6">Knowledge base</h1>
      <ul className="space-y-4">
        {articles.map(a=>(
          <li key={a.id} className="p-4 border rounded-2xl hover:bg-brand-haze/50">
            <Link href={`/knowledge-base/${a.slug}`} className="font-heading text-xl">{a.title}</Link>
          </li>
        ))}
      </ul>
      {articles.length === 0 && (
        <p className="text-brand-grey2">No articles yet. Database will be connected after deployment.</p>
      )}
    </section>
  )
}
