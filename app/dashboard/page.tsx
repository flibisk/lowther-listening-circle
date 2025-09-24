"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TierBadge } from "@/components/TierBadge"

interface Advocate {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  totalSales: number;
  earnings: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)
  const [stats, setStats] = useState({ clicks: 0, orders: 0, earnings: 0, pendingCommission: 0, totalSales: 0, advocateSales: 0, advocateCommission: 0, range: 'lifetime' as '30d' | 'lifetime' })
  const [range, setRange] = useState<'30d' | 'lifetime'>('30d')
  const [advocates, setAdvocates] = useState<Advocate[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
      if (session?.user?.id) {
      // Fetch user stats
        fetch(`/api/user/${session.user.id}/stats-debug?range=${range}`, {
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
    }, [session, range])

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
      <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-grey2">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const referralLink = session?.user?.refCode ? `${window.location.origin}/r/${session.user.refCode}` : ''
  const discountCode = session?.user?.discountCode || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl text-brand-light mb-2">Dashboard</h1>
            <p className="text-brand-grey2">Welcome back, {session.user?.email}</p>
          </div>
          {/* Sign Out button removed; use top navigation */}
        </div>

        {/* Tier Status */}
        <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl mb-4 text-brand-gold">Your Tier: {session.user?.tier}</h2>
              {session.user?.tier === "ADVOCATE" ? (
                <div>
                  <p className="text-brand-grey2 mb-4 text-lg">You're currently an Advocate earning 10% commission</p>
                  <div className="bg-brand-haze/50 rounded-2xl p-6 border border-brand-gold/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-brand-grey2 font-medium">Progress to Ambassador</span>
                      <span className="text-brand-light font-semibold">£{(stats.totalSales || 0).toLocaleString()} / £20,000</span>
                    </div>
                    <div className="w-full bg-brand-haze rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-brand-gold to-brand-bronze h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((stats.totalSales || 0) / 20000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-brand-grey2 text-sm">
                      £{(20000 - (stats.totalSales || 0)).toLocaleString()} more to become an Ambassador
                    </p>
                  </div>
                </div>
                     ) : (
                       <div>
                         <p className="text-brand-grey2 mb-4 text-lg">You're an Ambassador earning 15% commission + 5% from your Advocates</p>
                     <div className="flex items-center gap-3 mb-4">
                       <div className="text-brand-grey2">View metrics for:</div>
                       <div className="inline-flex rounded-xl overflow-hidden border border-brand-gold/30">
                         <button
                           className={`px-3 py-1 text-xs tracking-wider ${range === '30d' ? 'bg-brand-gold text-black' : 'bg-transparent text-brand-light'}`}
                           onClick={() => setRange('30d')}
                         >
                           Last 30 days
                         </button>
                         <button
                           className={`px-3 py-1 text-xs tracking-wider ${range === 'lifetime' ? 'bg-brand-gold text-black' : 'bg-transparent text-brand-light'}`}
                           onClick={() => setRange('lifetime')}
                         >
                           Lifetime
                         </button>
                       </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                           <div className="bg-brand-haze/50 rounded-2xl p-6 border border-brand-gold/20">
                             <div className="text-brand-grey2 mb-2">Your Advocates</div>
                             <div className="text-3xl font-heading text-brand-light">{advocates.length}</div>
                           </div>
                           <div className="bg-brand-haze/50 rounded-2xl p-6 border border-brand-gold/20">
                         <div className="text-brand-grey2 mb-2">Advocate Sales ({stats.range === '30d' ? '30d' : 'Lifetime'})</div>
                             <div className="text-3xl font-heading text-brand-light">£{(stats.advocateSales || 0).toLocaleString()}</div>
                           </div>
                           <div className="bg-brand-haze/50 rounded-2xl p-6 border border-brand-gold/20">
                         <div className="text-brand-grey2 mb-2">Your 5% Commission ({stats.range === '30d' ? '30d' : 'Lifetime'})</div>
                             <div className="text-3xl font-heading text-brand-light">£{(stats.advocateCommission || 0).toFixed(2)}</div>
                           </div>
                         </div>
                       </div>
                     )}
            </div>
            <div className="text-right">
              <TierBadge tier={session.user?.tier as "ADVOCATE" | "AMBASSADOR"} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-brand-grey2 mb-2">Clicks</div>
            <div className="text-3xl font-heading text-brand-light">{stats.clicks || 0}</div>
          </div>
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-brand-grey2 mb-2">Orders</div>
            <div className="text-3xl font-heading text-brand-light">{stats.orders || 0}</div>
          </div>
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-brand-grey2 mb-2">Total Sales</div>
            <div className="text-3xl font-heading text-brand-light">£{(stats.totalSales || 0).toLocaleString()}</div>
          </div>
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-brand-grey2 mb-2">Earnings</div>
            <div className="text-3xl font-heading text-brand-light">£{(stats.earnings || 0).toFixed(2)}</div>
          </div>
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 shadow-xl">
            <div className="text-sm text-orange-400 mb-2">Pending Commission</div>
            <div className="text-3xl font-heading text-orange-300">£{(stats.pendingCommission || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Referral Links Section */}
        <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-8 shadow-2xl">
          <h2 className="font-heading text-3xl mb-4 text-brand-gold">Your Referral Links</h2>
          <p className="text-brand-grey2 mb-8 text-lg">Share these links to earn commissions when people make purchases</p>
          
          <div className="space-y-6">
            {/* Referral Link */}
            <div className="bg-brand-haze/50 border border-brand-gold/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-brand-grey2 mb-3">
                    Referral Link
                  </label>
                  <div className="text-sm text-brand-light font-mono bg-brand-dark/50 p-4 rounded-xl border border-brand-gold/20">
                    {referralLink || 'Loading...'}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className="ml-6 btn-lowther disabled:opacity-50"
                  disabled={!referralLink}
                >
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Discount Code */}
            {discountCode && (
              <div className="bg-brand-haze/50 border border-brand-gold/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-brand-grey2 mb-3">
                      Discount Code
                    </label>
                    <div className="text-sm text-brand-light font-mono bg-brand-dark/50 p-4 rounded-xl border border-brand-gold/20">
                      {discountCode}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(discountCode, 'code')}
                    className="ml-6 btn-lowther"
                  >
                    {copied === 'code' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-sm text-brand-grey2 space-y-2">
            <p>• Share your referral link on social media, blogs, or directly with friends</p>
            <p>• When someone clicks your link and makes a purchase, you earn a commission</p>
            <p>• Track your performance in the stats above</p>
          </div>

          {/* Ambassador Advocate Management */}
          {session.user?.tier === "AMBASSADOR" && (
            <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl p-8">
              <h2 className="font-heading text-3xl mb-4 text-purple-300">Manage Your Advocates</h2>
              <p className="text-brand-grey2 mb-8 text-lg">Invite Advocates and earn 5% commission from their sales</p>
              
              <div className="bg-brand-haze/50 border border-purple-500/20 rounded-2xl p-6 mb-8">
                <h3 className="font-heading text-xl mb-4 text-purple-300">Invite New Advocate</h3>
                <p className="text-brand-grey2 mb-6">Share this link to invite new Advocates under you:</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-sm text-brand-light font-mono bg-brand-dark/50 p-4 rounded-xl border border-purple-500/20">
                    {referralLink ? `${referralLink}?ambassador=${session.user.refCode}` : 'Loading...'}
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${referralLink}?ambassador=${session.user.refCode}`, 'ambassador-link')}
                    className="btn-lowther disabled:opacity-50"
                    disabled={!referralLink}
                  >
                    {copied === 'ambassador-link' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {advocates.length > 0 ? (
                <div className="bg-brand-haze/50 border border-purple-500/20 rounded-2xl overflow-hidden">
                  <h3 className="font-heading text-xl p-6 border-b border-purple-500/20 text-purple-300">Your Advocates ({advocates.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-brand-dark/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Sales</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Your 5%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/20">
                        {advocates.map((advocate) => (
                          <tr key={advocate.id}>
                            <td className="px-6 py-4 text-sm font-medium text-brand-light">{advocate.fullName || advocate.name}</td>
                            <td className="px-6 py-4 text-sm text-brand-grey2">{advocate.email}</td>
                            <td className="px-6 py-4 text-sm text-brand-grey2">£{advocate.totalSales?.toLocaleString() || 0}</td>
                            <td className="px-6 py-4 text-sm text-purple-300 font-semibold">£{((advocate.totalSales || 0) * 0.05).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-haze/50 border border-purple-500/20 rounded-2xl p-8 text-center">
                  <p className="text-brand-grey2 text-lg">No advocates yet. Share your invite link to start earning!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

