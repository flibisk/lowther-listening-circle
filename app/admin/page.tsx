"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TierBadge } from "@/components/TierBadge"
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm"

interface User {
  id: string
  email: string
  name?: string
  fullName?: string
  address?: string
  location?: string
  application?: any
  refCode: string
  discountCode?: string
  role: string
  tier: string
  isApproved: boolean
  approvedAt?: string
  approvedBy?: string
  ambassadorId?: string
  createdAt: string
         clicks: number
         orders: number
         earnings: number
         pendingCommission: number
         totalSales: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [viewMode, setViewMode] = useState<'admin' | 'ambassador'>('admin')
  const [ambassadorStats, setAmbassadorStats] = useState({
    clicks: 0,
    orders: 0,
    earnings: 0,
    pendingCommission: 0,
    totalSales: 0,
    advocateSales: 0,
    advocateCommission: 0
  })
  const [advocates, setAdvocates] = useState<any[]>([])
  const [range, setRange] = useState<'30d' | 'lifetime'>('lifetime')

  useEffect(() => {
    console.log("Auth status:", status)
    console.log("Session:", session)
    console.log("Session user:", session?.user)
    console.log("Session user role:", session?.user?.role)

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to admin login")
      router.push("/admin/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      console.log("User authenticated but not admin, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    console.log("Session changed:", session)
    console.log("Session user:", session?.user)
    console.log("Session user role:", session?.user?.role)
    
    if (session?.user?.role === "ADMIN") {
      console.log("User is admin, fetching users...")
      fetchUsers()
    } else {
      console.log("User is not admin or no session")
    }
  }, [session])

  useEffect(() => {
    if (viewMode === 'ambassador' && session?.user?.role === "ADMIN") {
      fetchAmbassadorData()
    }
  }, [viewMode, range, session])

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...")
      const response = await fetch("/api/admin/users", {
        credentials: 'include'
      })
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      
      const data = await response.json()
      console.log("Fetched users data:", data)
      console.log("Data type:", typeof data)
      console.log("Is array:", Array.isArray(data))
      
      if (!response.ok) {
        console.error("API error:", data)
        setUsers([])
        return
      }
      
      if (Array.isArray(data)) {
        console.log("Setting users:", data)
        console.log("Number of users:", data.length)
        console.log("First user:", data[0])
        setUsers(data)
      } else {
        console.error("Expected array but got:", data)
        console.error("Data type:", typeof data)
        console.error("Data keys:", Object.keys(data || {}))
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAmbassadorData = async () => {
    if (!session?.user?.id) return
    
    try {
      // Fetch ambassador stats
      const statsRes = await fetch(`/api/user/${session.user.id}/stats-debug?range=${range}`, {
        credentials: 'include'
      })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setAmbassadorStats(statsData)
      }

      // Fetch advocates
      const advocatesRes = await fetch(`/api/user/${session.user.id}/advocates`, {
        credentials: 'include'
      })
      if (advocatesRes.ok) {
        const advocatesData = await advocatesRes.json()
        setAdvocates(advocatesData)
      }
    } catch (error) {
      console.error("Error fetching ambassador data:", error)
    }
  }

  const changeTier = async (userId: string, newTier: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/tier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tier: newTier }),
        credentials: 'include'
      })
      if (response.ok) {
        fetchUsers() // Refresh the list
        setShowPromoteModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error changing tier:", error)
    }
  }

         const approveUser = async (userId: string) => {
           try {
             const response = await fetch(`/api/admin/users/${userId}/approve`, {
               method: "POST",
               credentials: 'include'
             })
             if (response.ok) {
               fetchUsers() // Refresh the list
               setShowApprovalModal(false)
               setSelectedUser(null)
             }
           } catch (error) {
             console.error("Error approving user:", error)
           }
         }

         const payCommission = async (userId: string, amount: number) => {
           try {
             const response = await fetch(`/api/admin/users/${userId}/pay-commission`, {
               method: "POST",
               headers: {
                 "Content-Type": "application/json"
               },
               body: JSON.stringify({ amount }),
               credentials: 'include'
             })
             if (response.ok) {
               fetchUsers() // Refresh the list
               setShowPaymentModal(false)
               setSelectedUser(null)
               setPaymentAmount("")
             } else {
               const errorData = await response.json()
               alert(`Failed to process payment: ${errorData.error || 'Unknown error'}`)
             }
           } catch (error) {
             console.error("Error processing payment:", error)
             alert(`Error processing payment: ${error}`)
           }
         }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(`Error deleting user: ${error}`)
    }
  }

  if (status === "loading") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">Loading authentication...</div>
      </section>
    )
  }

  if (status === "unauthenticated") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">Redirecting to login...</div>
      </section>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">Access denied. Redirecting...</div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 text-brand-light">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-3xl">
            {viewMode === 'admin' ? 'Admin Dashboard' : 'Ambassador Dashboard'}
          </h1>
          <p className="text-brand-grey2 mt-1">
            {viewMode === 'admin' ? 'Manage all referrers and their tiers' : 'Your referral performance and advocate management'}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-brand-grey2">Welcome, {session.user?.email}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-grey2">View:</span>
              <div className="flex bg-brand-haze/50 rounded-full p-1">
                <button
                  onClick={() => setViewMode('admin')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                    viewMode === 'admin' ? 'bg-brand-gold text-brand-dark' : 'text-brand-grey2 hover:text-brand-light'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setViewMode('ambassador')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                    viewMode === 'ambassador' ? 'bg-brand-gold text-brand-dark' : 'text-brand-grey2 hover:text-brand-light'
                  }`}
                >
                  Ambassador
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TierBadge tier={session.user?.tier as "ADVOCATE" | "AMBASSADOR"} />
        </div>
      </div>

      {/* Stats Overview */}
      {viewMode === 'admin' ? (
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Total Users</div>
            <div className="text-2xl font-heading">{Array.isArray(users) ? users.length : 0}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Pending Approval</div>
            <div className="text-2xl font-heading text-brand-gold">{Array.isArray(users) ? users.filter(u => !u.isApproved).length : 0}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Advocates</div>
            <div className="text-2xl font-heading">{Array.isArray(users) ? users.filter(u => u.tier === "ADVOCATE" && u.isApproved).length : 0}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Ambassadors</div>
            <div className="text-2xl font-heading">{Array.isArray(users) ? users.filter(u => u.tier === "AMBASSADOR" && u.isApproved).length : 0}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Total Sales</div>
            <div className="text-2xl font-heading">£{Array.isArray(users) ? users.reduce((sum, u) => sum + u.totalSales, 0).toLocaleString() : 0}</div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Total Clicks</div>
            <div className="text-2xl font-heading">{ambassadorStats.clicks}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Total Orders</div>
            <div className="text-2xl font-heading">{ambassadorStats.orders}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Total Sales</div>
            <div className="text-2xl font-heading">£{ambassadorStats.totalSales.toLocaleString()}</div>
          </div>
          <div className="p-6 border border-brand-gold/20 bg-brand-primary/70 rounded-2xl">
            <div className="text-sm text-brand-grey2">Total Earnings</div>
            <div className="text-2xl font-heading">£{ambassadorStats.earnings.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Ambassador-specific content */}
      {viewMode === 'ambassador' && (
        <>
          {/* Ambassador Stats */}
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-3xl mb-4 text-brand-gold">Your Ambassador Performance</h2>
                <p className="text-brand-grey2 mb-4 text-lg">You're an Ambassador earning 15% commission + 5% from your Advocates</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-brand-grey2 text-sm">View metrics for:</span>
                  <div className="flex bg-brand-haze/50 rounded-full p-1">
                    <button
                      onClick={() => setRange('30d')}
                      className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                        range === '30d' ? 'bg-brand-gold text-brand-dark' : 'text-brand-grey2 hover:text-brand-light'
                      }`}
                    >
                      Last 30 days
                    </button>
                    <button
                      onClick={() => setRange('lifetime')}
                      className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                        range === 'lifetime' ? 'bg-brand-gold text-brand-dark' : 'text-brand-grey2 hover:text-brand-light'
                      }`}
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
                    <div className="text-sm text-brand-grey2 mb-2">Advocate Sales</div>
                    <div className="text-3xl font-heading text-brand-light">£{(ambassadorStats.advocateSales || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-brand-haze/50 rounded-2xl p-6 border border-brand-gold/20">
                    <div className="text-sm text-brand-grey2 mb-2">Your 5% Commission</div>
                    <div className="text-3xl font-heading text-brand-light">£{(ambassadorStats.advocateCommission || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Links */}
          <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-8 shadow-2xl">
            <h2 className="font-heading text-2xl mb-6 text-brand-gold">Your Referral Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-grey2 mb-2">Your Referral Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/r/${session?.user?.refCode}`}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/r/${session?.user?.refCode}`)
                    }}
                    className="btn-lowther"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-grey2 mb-2">Your Discount Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={session?.user?.discountCode || 'Not assigned'}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advocates List */}
          {advocates.length > 0 && (
            <div className="bg-brand-primary/80 rounded-2xl border border-brand-gold/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-brand-gold/20">
                <h2 className="font-heading text-xl text-brand-light">Your Advocates</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-haze/60">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Your Commission</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-brand-haze/50">
                    {advocates.map((advocate) => (
                      <tr key={advocate.id} className="hover:bg-brand-haze/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">
                          {advocate.fullName || advocate.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-grey2">
                          {advocate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">
                          £{advocate.totalSales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gold">
                          £{(advocate.totalSales * 0.05).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Users Table */}
      {viewMode === 'admin' && (
      <div className="bg-brand-primary/80 rounded-2xl border border-brand-gold/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-gold/20">
          <h2 className="font-heading text-xl text-brand-light">All Referrers</h2>
          <div className="text-sm text-brand-grey2 mt-2">
            Debug: Users array length: {Array.isArray(users) ? users.length : 'Not an array'}, Loading: {loading.toString()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-haze/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-grey2 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-brand-haze/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-brand-grey2">
                    Loading users...
                  </td>
                </tr>
              ) : !Array.isArray(users) ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-red-400">
                    Error: Users data is not an array
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-brand-grey2">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id}>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                    <div className="text-sm font-medium text-brand-light">
                       <a href={`/admin/users/${user.id}`} className="underline hover:text-brand-light">{user.fullName || user.name || user.email}</a>
                     </div>
                     <div className="text-sm text-brand-grey2">{user.email}</div>
                     <div className="text-xs text-brand-grey2">Ref: {user.refCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isApproved 
                        ? "bg-green-600/20 text-green-300 border border-green-600/30" 
                        : "bg-orange-600/20 text-orange-300 border border-orange-600/30"
                    }`}>
                      {user.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TierBadge tier={user.tier as "ADVOCATE" | "AMBASSADOR"} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">{user.location || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">{user.clicks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">{user.orders}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">£{user.totalSales.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">£{user.earnings.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-light">
                           <div className="flex items-center gap-2">
                            <span className={`${user.pendingCommission > 0 ? 'text-brand-gold font-medium' : 'text-brand-grey2'}`}>
                               £{user.pendingCommission.toFixed(2)}
                             </span>
                             {user.pendingCommission > 0 && (
                               <button
                                onClick={() => { setSelectedUser(user); setPaymentAmount(user.pendingCommission.toString()); setShowPaymentModal(true); }}
                                className="text-brand-light text-xs px-2 py-1 border border-brand-gold/40 rounded hover:bg-brand-gold/10"
                               >
                                 Pay
                               </button>
                             )}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex gap-2">
                             {!user.isApproved && (
                               <button
                                onClick={() => { setSelectedUser(user); setShowApprovalModal(true); }}
                                className="text-green-300 hover:text-green-200"
                               >
                                 Approve
                               </button>
                             )}
                             <select
                               value={user.tier}
                               onChange={(e) => changeTier(user.id, e.target.value)}
                              className="text-sm border border-brand-gold/30 bg-brand-haze/50 text-brand-light rounded px-2 py-1"
                             >
                               <option value="ADVOCATE">Advocate</option>
                               <option value="AMBASSADOR">Ambassador</option>
                             </select>
                             <button
                               onClick={() => deleteUser(user.id)}
                              className="text-red-300 hover:text-red-200"
                             >
                               Delete
                             </button>
                           </div>
                         </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

             {/* Approval Modal */}
            {showApprovalModal && selectedUser && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-brand-primary/90 border border-brand-gold/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-brand-light">
                  <h3 className="font-heading text-xl mb-4 text-brand-gold">Approve User</h3>
                   <div className="mb-4">
                     <p className="font-medium">{selectedUser.fullName || selectedUser.name || selectedUser.email}</p>
                    <p className="text-sm text-brand-grey2">{selectedUser.email}</p>
                    <p className="text-sm text-brand-grey2">{selectedUser.location}</p>
                   </div>
                  <p className="mb-6 text-brand-grey2">Are you sure you want to approve this user? They will be able to access their dashboard and start earning commissions.</p>
                   <div className="flex justify-end space-x-4">
                     <button
                      onClick={() => setShowApprovalModal(false)}
                      className="btn-lowther"
                     >
                       Cancel
                     </button>
                     <button
                      onClick={() => approveUser(selectedUser.id)}
                      className="btn-lowther"
                     >
                       Approve
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Payment Modal */}
            {showPaymentModal && selectedUser && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-brand-primary/90 border border-brand-gold/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-brand-light">
                  <h3 className="font-heading text-xl mb-4 text-brand-gold">Pay Commission</h3>
                   <div className="mb-4">
                     <p className="font-medium">{selectedUser.fullName || selectedUser.name || selectedUser.email}</p>
                    <p className="text-sm text-brand-grey2">{selectedUser.email}</p>
                    <p className="text-sm text-brand-grey2">Pending Commission: £{selectedUser.pendingCommission.toFixed(2)}</p>
                   </div>
                   <div className="mb-6">
                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-brand-grey2 mb-2">
                       Payment Amount (£)
                     </label>
                     <input
                       type="number"
                       id="paymentAmount"
                       value={paymentAmount}
                       onChange={(e) => setPaymentAmount(e.target.value)}
                       step="0.01"
                       min="0"
                       max={selectedUser.pendingCommission}
                      className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                       placeholder="0.00"
                     />
                   </div>
                   <div className="flex justify-end space-x-4">
                     <button
                      onClick={() => { setShowPaymentModal(false); setPaymentAmount(""); }}
                      className="btn-lowther"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={() => {
                         const amount = parseFloat(paymentAmount)
                         if (amount > 0 && amount <= selectedUser.pendingCommission) {
                           payCommission(selectedUser.id, amount)
                         } else {
                           alert("Please enter a valid amount between £0.01 and £" + selectedUser.pendingCommission.toFixed(2))
                         }
                       }}
                      className="btn-lowther"
                     >
                       Process Payment
                     </button>
                   </div>
                 </div>
               </div>
             )}

      {/* Admin Settings Section */}
      {viewMode === 'admin' && (
        <div className="mt-12">
          <h2 className="font-heading text-2xl mb-6 text-brand-light">Admin Settings</h2>
          <div className="max-w-md">
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </section>
  )
}
