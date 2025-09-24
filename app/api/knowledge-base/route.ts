import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEETS_ID
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!sheetId) {
      return NextResponse.json(
        { error: "Google Sheets ID not configured" },
        { status: 500 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Sheets API key not configured" },
        { status: 500 }
      )
    }

    // Initialize the Google Sheets API with API key
    const sheets = google.sheets({ version: 'v4', auth: apiKey })

    // First, get the spreadsheet metadata to check if it's accessible
    let spreadsheet
    try {
      spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })
    } catch (error: any) {
      if (error.message?.includes('not supported')) {
        return NextResponse.json(
          { 
            error: "This appears to be an Excel file (.xlsx). Please convert it to a Google Sheet: File → Save as Google Sheets",
            details: error.message 
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Get the first sheet name
    const firstSheet = spreadsheet.data.sheets?.[0]
    const sheetName = firstSheet?.properties?.title || 'Sheet1'

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return NextResponse.json({ articles: [] })
    }

    // Assume first row is headers
    const headers = rows[0]
    const articles = rows.slice(1).map((row, index) => {
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

    return NextResponse.json({ articles })
  } catch (error: any) {
    console.error('Error fetching from Google Sheets:', error)
    
    // Provide more specific error messages
    if (error.code === 403) {
      return NextResponse.json(
        { 
          error: "Access denied. Please make your Google Sheet publicly readable: Share → Anyone with the link → Viewer",
          details: error.message 
        },
        { status: 403 }
      )
    }
    
    if (error.code === 404) {
      return NextResponse.json(
        { 
          error: "Google Sheet not found. Please check the GOOGLE_SHEETS_ID in your environment variables.",
          details: error.message 
        },
        { status: 404 }
      )
    }
    
    if (error.message?.includes('not supported')) {
      return NextResponse.json(
        { 
          error: "Sheet access issue. Please ensure your Google Sheet is publicly readable: Share → Anyone with the link → Viewer",
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch knowledge base data",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}
