"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-3xl">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage all referrers and their tiers</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {session.user?.email}</span>
                 <button
                   onClick={() => signOut({ callbackUrl: '/admin/login' })}
                   className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                 >
                   Sign Out
                 </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Total Users</div>
          <div className="text-2xl font-heading">{Array.isArray(users) ? users.length : 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Pending Approval</div>
          <div className="text-2xl font-heading text-orange-600">{Array.isArray(users) ? users.filter(u => !u.isApproved).length : 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Advocates</div>
          <div className="text-2xl font-heading">{Array.isArray(users) ? users.filter(u => u.tier === "ADVOCATE" && u.isApproved).length : 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Ambassadors</div>
          <div className="text-2xl font-heading">{Array.isArray(users) ? users.filter(u => u.tier === "AMBASSADOR" && u.isApproved).length : 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Total Sales</div>
          <div className="text-2xl font-heading">£{Array.isArray(users) ? users.reduce((sum, u) => sum + u.totalSales, 0).toLocaleString() : 0}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-heading text-xl">All Referrers</h2>
          <div className="text-sm text-gray-500 mt-2">
            Debug: Users array length: {Array.isArray(users) ? users.length : 'Not an array'}, Loading: {loading.toString()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : !Array.isArray(users) ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-red-500">
                    Error: Users data is not an array
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id}>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                     <div className="text-sm font-medium text-gray-900">
                       <a href={`/admin/users/${user.id}`} className="underline hover:text-brand-light">{user.fullName || user.name || user.email}</a>
                     </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">Ref: {user.refCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isApproved 
                        ? "bg-green-100 text-green-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {user.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.tier === "AMBASSADOR" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.location || "N/A"}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.clicks}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.orders}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{user.totalSales.toLocaleString()}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{user.earnings.toFixed(2)}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           <div className="flex items-center gap-2">
                             <span className={`${user.pendingCommission > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                               £{user.pendingCommission.toFixed(2)}
                             </span>
                             {user.pendingCommission > 0 && (
                               <button
                                 onClick={() => { setSelectedUser(user); setPaymentAmount(user.pendingCommission.toString()); setShowPaymentModal(true); }}
                                 className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded"
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
                                 className="text-green-600 hover:text-green-900"
                               >
                                 Approve
                               </button>
                             )}
                             <select
                               value={user.tier}
                               onChange={(e) => changeTier(user.id, e.target.value)}
                               className="text-sm border rounded px-2 py-1"
                             >
                               <option value="ADVOCATE">Advocate</option>
                               <option value="AMBASSADOR">Ambassador</option>
                             </select>
                             <button
                               onClick={() => deleteUser(user.id)}
                               className="text-red-600 hover:text-red-900"
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
               <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                 <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                   <h3 className="font-heading text-xl mb-4">Approve User</h3>
                   <div className="mb-4">
                     <p className="font-medium">{selectedUser.fullName || selectedUser.name || selectedUser.email}</p>
                     <p className="text-sm text-gray-600">{selectedUser.email}</p>
                     <p className="text-sm text-gray-600">{selectedUser.location}</p>
                   </div>
                   <p className="mb-6">Are you sure you want to approve this user? They will be able to access their dashboard and start earning commissions.</p>
                   <div className="flex justify-end space-x-4">
                     <button
                       onClick={() => setShowApprovalModal(false)}
                       className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={() => approveUser(selectedUser.id)}
                       className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                     >
                       Approve
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Payment Modal */}
             {showPaymentModal && selectedUser && (
               <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                 <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                   <h3 className="font-heading text-xl mb-4">Pay Commission</h3>
                   <div className="mb-4">
                     <p className="font-medium">{selectedUser.fullName || selectedUser.name || selectedUser.email}</p>
                     <p className="text-sm text-gray-600">{selectedUser.email}</p>
                     <p className="text-sm text-gray-600">Pending Commission: £{selectedUser.pendingCommission.toFixed(2)}</p>
                   </div>
                   <div className="mb-6">
                     <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
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
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="0.00"
                     />
                   </div>
                   <div className="flex justify-end space-x-4">
                     <button
                       onClick={() => { setShowPaymentModal(false); setPaymentAmount(""); }}
                       className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
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
                       className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                     >
                       Process Payment
                     </button>
                   </div>
                 </div>
               </div>
             )}

           </section>
         )
       }
