import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminUserProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      Orders: true,
      Clicks: true,
      Ledger: true,
    }
  })

  if (!user) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-red-400">User not found.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-3xl">User Profile</h1>
        <Link href="/admin" className="underline">Back to Admin</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-2xl bg-white text-black">
          <h2 className="font-heading text-xl mb-4">Basics</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Name:</strong> {user.fullName || user.name || "—"}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Location:</strong> {user.location || "—"}</div>
            <div><strong>Address:</strong> {user.address || "—"}</div>
            <div><strong>Tier:</strong> {user.tier}</div>
            <div><strong>Status:</strong> {user.isApproved ? "Approved" : "Pending"}</div>
            <div><strong>Ref code:</strong> {user.refCode}</div>
          </div>
        </div>

        <div className="p-6 border rounded-2xl bg-white text-black">
          <h2 className="font-heading text-xl mb-4">Application</h2>
          {user.application ? (
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(user.application, null, 2)}</pre>
          ) : (
            <p className="text-sm text-gray-600">No application data.</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="p-6 border rounded-2xl bg-white text-black">
          <h3 className="font-heading mb-2">Clicks</h3>
          <div className="text-2xl">{user.Clicks.length}</div>
        </div>
        <div className="p-6 border rounded-2xl bg-white text-black">
          <h3 className="font-heading mb-2">Orders</h3>
          <div className="text-2xl">{user.Orders.length}</div>
        </div>
        <div className="p-6 border rounded-2xl bg-white text-black">
          <h3 className="font-heading mb-2">Ledger entries</h3>
          <div className="text-2xl">{user.Ledger.length}</div>
        </div>
      </div>
    </section>
  )
}


