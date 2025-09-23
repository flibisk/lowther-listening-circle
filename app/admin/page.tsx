"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name?: string
  refCode: string
  discountCode?: string
  role: string
  tier: string
  createdAt: string
  clicks: number
  orders: number
  earnings: number
  totalSales: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPromoteModal, setShowPromoteModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers()
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
        setUsers(data)
      } else {
        console.error("Expected array but got:", data)
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
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">Loading...</div>
      </section>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
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
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Total Users</div>
          <div className="text-2xl font-heading">{Array.isArray(users) ? users.length : 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Advocates</div>
          <div className="text-2xl font-heading">{Array.isArray(users) ? users.filter(u => u.tier === "ADVOCATE").length : 0}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Ambassadors</div>
          <div className="text-2xl font-heading">{Array.isArray(users) ? users.filter(u => u.tier === "AMBASSADOR").length : 0}</div>
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(users) && users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">Ref: {user.refCode}</div>
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.clicks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{user.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{user.earnings.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  )
}
