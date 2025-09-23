import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        {/* Listening Circle Image */}
        <div className="mb-8">
          <img 
            src="/listening-circle.png" 
            alt="Lowther Listening Circle" 
            className="mx-auto h-64 w-auto object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* Title */}
        <h1 className="font-heading text-5xl md:text-7xl mb-6 text-brand-light tracking-wide">
          Listening Circle
        </h1>
        
        {/* Subtitle */}
        <p className="text-brand-grey2 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Join our exclusive referral community. Track clicks, earn commissions, and access our premium knowledge base.
        </p>
        
        {/* Login Box */}
        <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-6 max-w-md mx-auto shadow-2xl">
          <h2 className="font-heading text-2xl mb-6 text-brand-gold">Welcome Back</h2>
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="w-full block px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-gold to-brand-bronze text-brand-dark font-semibold text-lg hover:from-brand-bronze hover:to-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        {/* Register Link */}
        <div className="text-center">
          <p className="text-brand-grey2 mb-4">New to Listening Circle?</p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-3 rounded-2xl border-2 border-brand-gold text-brand-gold font-semibold hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 hover:shadow-lg"
          >
            Register Now
          </Link>
        </div>
        
        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-brand-gold text-3xl mb-4">📊</div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Track Performance</h3>
            <p className="text-brand-grey2">Monitor clicks, orders, and earnings in real-time</p>
          </div>
          <div className="p-6">
            <div className="text-brand-gold text-3xl mb-4">💰</div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Earn Commissions</h3>
            <p className="text-brand-grey2">Get rewarded for every successful referral</p>
          </div>
          <div className="p-6">
            <div className="text-brand-gold text-3xl mb-4">📚</div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Knowledge Base</h3>
            <p className="text-brand-grey2">Access exclusive content and resources</p>
          </div>
        </div>
      </div>
    </div>
  )
}

