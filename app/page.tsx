import Link from "next/link"
export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-heading text-4xl md:text-5xl mb-4">Lowther Listening Circle</h1>
      <p className="text-brand-grey1 max-w-2xl">Join our referral community. Track clicks and earnings. Access the knowledge base.</p>
      <div className="mt-8 flex gap-4">
        <Link href="/login" className="px-5 py-3 rounded-2xl bg-brand-secondary text-white">Sign in</Link>
        <Link href="/register" className="px-5 py-3 rounded-2xl border">Join</Link>
      </div>
    </section>
  )
}
