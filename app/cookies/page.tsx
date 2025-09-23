export default function CookiesPolicy() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-heading text-4xl mb-6 text-brand-light">Cookie Policy</h1>
      <p className="text-brand-grey2 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="space-y-6 text-brand-grey2 leading-relaxed">
        <h2 className="font-heading text-2xl text-brand-light">What Are Cookies</h2>
        <p>Cookies are small files used to remember preferences, maintain sessions, and analyze usage.</p>
        <h2 className="font-heading text-2xl text-brand-light">How We Use Cookies</h2>
        <p>We use essential cookies for authentication and security, and limited analytics to improve the service.</p>
        <h2 className="font-heading text-2xl text-brand-light">Managing Cookies</h2>
        <p>You can manage cookies in your browser settings. Disabling essential cookies may impact functionality.</p>
      </div>
    </section>
  )
}


