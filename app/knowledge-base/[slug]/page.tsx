// import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Markdown from 'react-markdown'

export default async function Article({ params }: { params: Promise<{ slug: string }>}) {
  const { slug } = await params
  // const article = await prisma.article.findUnique({ where: { slug } })
  // if (!article) return notFound()
  
  // Temporary placeholder
  return notFound()
  
  // return (
  //   <article className="mx-auto max-w-3xl px-6 py-12 prose">
  //     <h1>{article.title}</h1>
  //     <Markdown>{article.bodyMd}</Markdown>
  //   </article>
  // )
}
