"use client"

import { useState, useMemo, useEffect } from "react"

interface Article {
  id: number
  question?: string
  answer?: string
  category?: string
  [key: string]: any
}

interface SearchBarProps {
  articles: Article[]
  onSearch: (filteredArticles: Article[]) => void
}

export function SearchBar({ articles, onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) {
      return articles
    }

    return articles.filter((article) => {
      const question = (article.question || '').toLowerCase()
      const answer = (article.answer || '').toLowerCase()
      const category = (article.category || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      
      return question.includes(searchLower) || 
             answer.includes(searchLower) || 
             category.includes(searchLower)
    })
  }, [articles, searchTerm])

  // Update parent component when filtered articles change
  useEffect(() => {
    onSearch(filteredArticles)
  }, [filteredArticles, onSearch])

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-brand-grey2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search questions, answers, or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-12 py-3 bg-brand-haze/50 border border-brand-gold/30 rounded-xl text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-grey2 hover:text-brand-light transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      {searchTerm && (
        <div className="mt-4 text-sm text-brand-grey2">
          {filteredArticles.length === 0 ? (
            <p>No results found for "{searchTerm}"</p>
          ) : (
            <p>
              {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} found for "{searchTerm}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}
