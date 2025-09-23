export default function Terms() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-heading text-4xl mb-6 text-brand-light">Terms & Conditions</h1>
      <p className="text-brand-grey2 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="space-y-6 text-brand-grey2 leading-relaxed">
        <h2 className="font-heading text-2xl text-brand-light">Program Participation</h2>
        <p>By joining the Listening Circle, you agree to these terms and all applicable laws.</p>
        <h2 className="font-heading text-2xl text-brand-light">Commissions</h2>
        <p>Commissions accrue based on tracked sales and may be pending until approved and paid. Fraudulent or abusive activity will void eligibility.</p>
        <h2 className="font-heading text-2xl text-brand-light">Account</h2>
        <p>You are responsible for maintaining accurate information and the security of your account.</p>
        <h2 className="font-heading text-2xl text-brand-light">Changes</h2>
        <p>We may update these terms and will post updates here. Continued use constitutes acceptance.</p>
        <h2 className="font-heading text-2xl text-brand-light">Contact</h2>
        <p>For questions, contact: support@lowtherloudspeakers.com</p>
      </div>
    </section>
  )
}


