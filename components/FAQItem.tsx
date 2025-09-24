"use client"

import { useState } from "react"

interface FAQItemProps {
  question: string
  answer: string
  category: string
}

export function FAQItem({ question, answer, category }: FAQItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-inset rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {category && (
              <span className="inline-block bg-brand-gold/20 text-brand-gold text-xs px-2 py-1 rounded-full mb-2">
                {category}
              </span>
            )}
            <h3 className="font-heading text-lg text-brand-light hover:text-brand-gold transition-colors">
              {question}
            </h3>
          </div>
          <div className="ml-4 flex-shrink-0">
            <svg
              className={`w-5 h-5 text-brand-gold transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="border-t border-brand-gold/20 pt-4">
            <p className="text-brand-grey2 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
