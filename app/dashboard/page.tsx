"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ clicks: 0, orders: 0, earnings: 0, totalSales: 0 })
  const [advocates, setAdvocates] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user stats
      fetch(`/api/user/${session.user.id}/stats-debug`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          console.log('Stats API response:', data)
          setStats(data)
        })
        .catch(err => console.error('Error fetching stats:', err))

      // If user is Ambassador, fetch their advocates
      if (session.user.tier === "AMBASSADOR") {
        fetch(`/api/user/${session.user.id}/advocates`, {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            console.log('Advocates API response:', data)
            setAdvocates(data)
          })
          .catch(err => console.error('Error fetching advocates:', err))
      }
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

      {/* Tier Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl mb-2">Your Tier: {session.user?.tier}</h2>
            {session.user?.tier === "ADVOCATE" ? (
              <div>
                <p className="text-gray-600 mb-2">You're currently an Advocate earning 10% commission</p>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress to Ambassador</span>
                    <span className="text-sm font-medium">£{(stats.totalSales || 0).toLocaleString()} / £20,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((stats.totalSales || 0) / 20000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    £{(20000 - (stats.totalSales || 0)).toLocaleString()} more to become an Ambassador
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">You're an Ambassador earning 15% commission + 5% from your Advocates</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600">Your Advocates</div>
                    <div className="text-2xl font-heading">{advocates.length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-sm text-gray-600">Advocate Earnings</div>
                    <div className="text-2xl font-heading">£{advocates.reduce((sum, a) => sum + (a.earnings || 0), 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
              session.user?.tier === "AMBASSADOR" 
                ? "bg-purple-100 text-purple-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {session.user?.tier}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Clicks</div>
          <div className="text-2xl font-heading">{stats.clicks || 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Orders</div>
          <div className="text-2xl font-heading">{stats.orders || 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Total Sales</div>
          <div className="text-2xl font-heading">£{(stats.totalSales || 0).toLocaleString()}</div>
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

      {/* Ambassador Advocate Management */}
      {session.user?.tier === "AMBASSADOR" && (
        <div className="bg-purple-50 rounded-2xl p-6 mb-8">
          <h2 className="font-heading text-2xl mb-4">Manage Your Advocates</h2>
          <p className="text-gray-600 mb-6">Invite Advocates and earn 5% commission from their sales</p>
          
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="font-heading text-lg mb-2">Invite New Advocate</h3>
            <p className="text-sm text-gray-600 mb-4">Share this link to invite new Advocates under you:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                {referralLink ? `${referralLink}?ambassador=${session.user.refCode}` : 'Loading...'}
              </div>
              <button
                onClick={() => copyToClipboard(`${referralLink}?ambassador=${session.user.refCode}`, 'ambassador-link')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                disabled={!referralLink}
              >
                {copied === 'ambassador-link' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {advocates.length > 0 ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <h3 className="font-heading text-lg p-4 border-b">Your Advocates ({advocates.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your 5%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {advocates.map((advocate) => (
                      <tr key={advocate.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{advocate.fullName || advocate.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{advocate.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">£{advocate.totalSales?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">£{((advocate.totalSales || 0) * 0.05).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-gray-500">No advocates yet. Share your invite link to start earning!</p>
            </div>
          )}
        </div>
      )}
    </div>
  </section>
)
}

