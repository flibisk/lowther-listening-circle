"use client"

import { useState } from "react"
import { SearchBar } from "./SearchBar"
import { FAQItem } from "./FAQItem"

interface Article {
  id: number
  question?: string
  answer?: string
  category?: string
  [key: string]: any
}

interface KnowledgeBaseClientProps {
  articles: Article[]
}

export function KnowledgeBaseClient({ articles }: KnowledgeBaseClientProps) {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles)

  const handleSearch = (filtered: Article[]) => {
    setFilteredArticles(filtered)
  }

  return (
    <>
      <SearchBar articles={articles} onSearch={handleSearch} />
      
      {filteredArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <FAQItem 
              key={article.id} 
              question={article.question || `Question ${article.id}`}
              answer={article.answer || ''}
              category={article.category || ''}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-brand-grey2 text-lg mb-4">No FAQ items available yet.</p>
          <p className="text-brand-grey2 text-sm">The knowledge base will be populated from Google Sheets.</p>
        </div>
      )}
    </>
  )
}
