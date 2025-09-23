"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link href="/knowledge-base">Knowledge base</Link>
      
      {status === "loading" ? (
        <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-500">
          Loading...
        </div>
      ) : session ? (
        // Authenticated user navigation
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Welcome, {session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        // Unauthenticated user navigation
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="px-4 py-2 rounded-2xl bg-brand-secondary text-white hover:bg-blue-700 transition-colors">
            Sign in
          </Link>
          <Link href="/admin/login" className="px-4 py-2 rounded-2xl bg-red-600 text-white hover:bg-red-800 transition-colors">
            Admin
          </Link>
        </div>
      )}
    </nav>
  )
}
