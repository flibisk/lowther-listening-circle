"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ clicks: 0, orders: 0, earnings: 0 })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user stats
      fetch(`/api/user/${session.user.id}/stats`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching stats:', err))
    }
  }, [session])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (status === "loading") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">Loading...</div>
      </section>
    )
  }

  if (!session) {
    return null
  }

  const referralLink = session?.user?.refCode ? `${window.location.origin}/r/${session.user.refCode}` : ''
  const discountCode = session?.user?.discountCode || ''

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Clicks</div>
          <div className="text-2xl font-heading">{stats.clicks || 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Orders</div>
          <div className="text-2xl font-heading">{stats.orders || 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Earnings</div>
          <div className="text-2xl font-heading">£{(stats.earnings || 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Referral Links Section */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h2 className="font-heading text-2xl mb-4">Your Referral Links</h2>
        <p className="text-gray-600 mb-6">Share these links to earn commissions when people make purchases</p>
        
        <div className="space-y-4">
          {/* Referral Link */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Link
                </label>
                <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  {referralLink || 'Loading...'}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(referralLink, 'link')}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!referralLink}
              >
                {copied === 'link' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Discount Code */}
          {discountCode && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Code
                  </label>
                  <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                    {discountCode}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(discountCode, 'code')}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>• Share your referral link on social media, blogs, or directly with friends</p>
          <p>• When someone clicks your link and makes a purchase, you earn a commission</p>
          <p>• Track your performance in the stats above</p>
        </div>
      </div>
    </section>
  )
}

