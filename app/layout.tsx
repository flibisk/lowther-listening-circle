import './globals.css'
import localFont from 'next/font/local'
import { Sarabun } from 'next/font/google'
import Link from 'next/link'
import { Providers } from '@/components/providers'
import { Navigation } from '@/components/navigation'

const hvMuse = localFont({ 
  src: [
    { path: '../public/fonts/HV Muse.otf', style: 'normal' },
    { path: '../public/fonts/HV Muse Italic.otf', style: 'italic' }
  ], 
  variable: '--font-hvmuse', 
  display: 'swap' 
})
const sarabun = Sarabun({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-sarabun', 
  display: 'swap' 
})

export const metadata = { title: 'Lowther Listening Circle', description: 'Affiliate and knowledge base for Lowther' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hvMuse.variable} ${sarabun.variable}`}>
      <body className="min-h-screen bg-brand-dark text-brand-light font-body">
        <Providers>
          <header className="border-b border-brand-haze bg-brand-primary">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <img src="https://cdn.prod.website-files.com/60642ec35aaa96134a87538a/612f6e6f1ede67731870e1f7_lowther-logo.svg" alt="Lowther" className="h-5" />
              </Link>
              <Navigation />
            </div>
          </header>
          <main>{children}</main>
          <footer className="mt-16 py-10 border-t border-brand-haze text-center text-sm text-brand-grey2">© Lowther Listening Circle</footer>
        </Providers>
      </body>
    </html>
  )
}
