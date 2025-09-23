"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link href="/knowledge-base" className="text-brand-grey2 hover:text-brand-light transition-colors">
        Knowledge base
      </Link>
      
      {status === "loading" ? (
        <div className="px-4 py-2 rounded-2xl bg-brand-haze text-brand-grey2">
          Loading...
        </div>
      ) : session ? (
        // Authenticated user navigation
        <div className="flex items-center gap-4">
          <span className="text-brand-grey2">
            Welcome, {session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign Out
          </button>
        </div>
      ) : (
        // Unauthenticated user navigation
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-gold to-brand-bronze text-brand-dark font-semibold hover:from-brand-bronze hover:to-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl">
            Sign in
          </Link>
          <Link href="/admin/login" className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl">
            Admin
          </Link>
        </div>
      )}
    </nav>
  )
}
