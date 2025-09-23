"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Page() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // First, create the user with additional information
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          fullName,
          address,
          location,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setMessage(errorData.error || "Error creating account. Please try again.")
        return
      }

      // Then send magic link
      const result = await signIn("email", {
        email,
        redirect: false,
      })

      if (result?.error) {
        setMessage("Account created but error sending magic link. Please try again.")
      } else {
        setMessage("Account created! Check your email for the magic link to complete registration.")
      }
    } catch (error) {
      setMessage("Error creating account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        {/* Listening Circle Image */}
        <div className="mb-8">
          <img 
            src="/listening-circle.png" 
            alt="Lowther Listening Circle" 
            className="mx-auto h-32 w-auto object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* Title */}
        <h1 className="font-heading text-4xl md:text-6xl mb-6 text-brand-light tracking-wide">
          Join Listening Circle
        </h1>
        
        {/* Subtitle */}
        <p className="text-brand-grey2 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Create your account and start earning commissions through our exclusive referral program
        </p>
        
        {/* Registration Form */}
        <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-6 max-w-lg mx-auto shadow-2xl">
          <h2 className="font-heading text-2xl mb-6 text-brand-gold">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-brand-grey2 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-grey2 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-brand-grey2 mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300 resize-none"
                placeholder="123 Main Street, City, State, ZIP"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-brand-grey2 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                placeholder="London, UK"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-gold to-brand-bronze text-brand-dark font-semibold text-lg hover:from-brand-bronze hover:to-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account & Send Magic Link"
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-xl ${
              message.includes("Check your email") 
                ? "bg-green-500/20 border border-green-500/30 text-green-300" 
                : "bg-red-500/20 border border-red-500/30 text-red-300"
            }`}>
              {message}
            </div>
          )}
        </div>
        
        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-brand-grey2 mb-4">Already have an account?</p>
          <Link 
            href="/" 
            className="inline-block px-8 py-3 rounded-2xl border-2 border-brand-gold text-brand-gold font-semibold hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 hover:shadow-lg"
          >
            Sign In
          </Link>
        </div>
        
        {/* Benefits */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-brand-gold text-3xl mb-4">🎯</div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Easy Setup</h3>
            <p className="text-brand-grey2">Quick registration with magic link authentication</p>
          </div>
          <div className="p-6">
            <div className="text-brand-gold text-3xl mb-4">💎</div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Exclusive Access</h3>
            <p className="text-brand-grey2">Join our premium referral community</p>
          </div>
          <div className="p-6">
            <div className="text-brand-gold text-3xl mb-4">🚀</div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Start Earning</h3>
            <p className="text-brand-grey2">Begin earning commissions immediately</p>
          </div>
        </div>
      </div>
    </div>
  )
}

