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

  // Fetch articles directly from Google Sheets (server-side)
  let articles: Article[] = []
  try {
    // Import the Google Sheets logic directly instead of making HTTP call
    const { google } = await import("googleapis")
    
    const sheetId = process.env.GOOGLE_SHEETS_ID
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (sheetId && apiKey) {
      const sheets = google.sheets({ version: 'v4', auth: apiKey })
      
      // Get the spreadsheet metadata
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })
      
      // Get the first sheet name
      const firstSheet = spreadsheet.data.sheets?.[0]
      const sheetName = firstSheet?.properties?.title || 'Sheet1'

      // Fetch data from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:Z`,
      })

      const rows = response.data.values
      if (rows && rows.length > 0) {
        // Assume first row is headers
        const headers = rows[0]
        articles = rows.slice(1).map((row, index) => {
          const article: any = { id: index + 1 }
          headers.forEach((header, headerIndex) => {
            if (row[headerIndex]) {
              // Convert header to camelCase for easier use
              const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
              article[key] = row[headerIndex]
            }
          })
          return article
        })
      }
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
