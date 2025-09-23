"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-2xl"><div className="text-sm text-brand-grey2">Clicks</div><div className="text-2xl font-heading">0</div></div>
        <div className="p-6 border rounded-2xl"><div className="text-sm text-brand-grey2">Orders</div><div className="text-2xl font-heading">0</div></div>
        <div className="p-6 border rounded-2xl"><div className="text-sm text-brand-grey2">Earnings</div><div className="text-2xl font-heading">£0.00</div></div>
      </div>
    </section>
  )
}

