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
      router.push("/login")
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
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const promoteToAmbassador = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: "POST"
      })
      if (response.ok) {
        fetchUsers() // Refresh the list
        setShowPromoteModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error promoting user:", error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
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
        <h1 className="font-heading text-3xl">Admin Dashboard</h1>
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
          <div className="text-2xl font-heading">{users.length}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Advocates</div>
          <div className="text-2xl font-heading">{users.filter(u => u.tier === "ADVOCATE").length}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Ambassadors</div>
          <div className="text-2xl font-heading">{users.filter(u => u.tier === "AMBASSADOR").length}</div>
        </div>
        <div className="p-6 border rounded-2xl">
          <div className="text-sm text-brand-grey2">Total Sales</div>
          <div className="text-2xl font-heading">£{users.reduce((sum, u) => sum + u.totalSales, 0).toLocaleString()}</div>
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
              {users.map((user) => (
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
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowPromoteModal(true)
                        }}
                        disabled={user.tier === "AMBASSADOR"}
                        className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Promote
                      </button>
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

      {/* Promote Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Promote to Ambassador
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Promote {selectedUser.email} to Ambassador tier? They will earn 15% commission instead of 10%.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => promoteToAmbassador(selectedUser.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Promote
                </button>
                <button
                  onClick={() => {
                    setShowPromoteModal(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
