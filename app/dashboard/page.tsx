export default function Dashboard() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-heading text-3xl mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-2xl"><div className="text-sm text-brand-grey2">Clicks</div><div className="text-2xl font-heading">0</div></div>
        <div className="p-6 border rounded-2xl"><div className="text-sm text-brand-grey2">Orders</div><div className="text-2xl font-heading">0</div></div>
        <div className="p-6 border rounded-2xl"><div className="text-sm text-brand-grey2">Earnings</div><div className="text-2xl font-heading">£0.00</div></div>
      </div>
    </section>
  )
}
