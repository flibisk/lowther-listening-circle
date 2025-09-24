"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type Tier = "ADVOCATE" | "AMBASSADOR"

export function UserActions({ userId, isApproved, tier }: { userId: string, isApproved: boolean, tier: Tier }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedTier, setSelectedTier] = useState<Tier>(tier)
  const [loading, setLoading] = useState(false)

  const approve = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: "POST", credentials: "include" })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`HTTP ${res.status} ${body}`)
      }
      startTransition(() => router.refresh())
    } catch (e: any) {
      alert(`Failed to approve user: ${e?.message || e}`)
    } finally {
      setLoading(false)
    }
  }

  const saveTier = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}/tier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier: selectedTier })
      })
      if (!res.ok) throw new Error("Failed to update tier")
      startTransition(() => router.refresh())
    } catch (e) {
      alert("Failed to update tier")
    } finally {
      setLoading(false)
    }
  }

  if (!isApproved) {
    return (
      <button onClick={approve} disabled={loading || pending} className="btn-lowther">
        {loading || pending ? "Approving..." : "Approve"}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedTier}
        onChange={(e) => setSelectedTier(e.target.value as Tier)}
        className="px-3 py-2 rounded-md bg-brand-haze/50 border border-brand-gold/30 text-brand-light"
      >
        <option value="ADVOCATE">Advocate</option>
        <option value="AMBASSADOR">Ambassador</option>
      </select>
      <button onClick={saveTier} disabled={loading || pending} className="btn-lowther">
        {loading || pending ? "Saving..." : "Save"}
      </button>
    </div>
  )
}


