export default function PrivacyPolicy() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-heading text-4xl mb-6 text-brand-light">Privacy Policy</h1>
      <p className="text-brand-grey2 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="space-y-6 text-brand-grey2 leading-relaxed">
        <p>We respect your privacy. This policy explains what data we collect, why we collect it, and how we use it.</p>
        <h2 className="font-heading text-2xl text-brand-light">Data We Collect</h2>
        <p>Account details (email, name, address, location), referral activity (clicks, orders), and technical data (IP hash, user agent) for security and analytics.</p>
        <h2 className="font-heading text-2xl text-brand-light">How We Use Data</h2>
        <p>To provide authentication, track referrals and commissions, operate the program, and comply with legal obligations.</p>
        <h2 className="font-heading text-2xl text-brand-light">Your Rights</h2>
        <p>You can request access, correction, deletion, or restriction of your personal data. Contact us to exercise these rights.</p>
        <h2 className="font-heading text-2xl text-brand-light">Contact</h2>
        <p>For privacy inquiries, contact: support@lowtherloudspeakers.com</p>
      </div>
    </section>
  )
}


