"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn('email', { 
        email, 
        redirect: false 
      })
      // Show success message or redirect
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-grey2">Loading...</p>
        </div>
      </div>
    )
  }

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
        <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-8 mb-6 max-w-md mx-auto shadow-2xl transition-all duration-500 ease-in-out">
          <h2 className="font-heading text-2xl mb-6 text-brand-gold">Welcome Back</h2>
          
          {!showLoginForm ? (
            // Sign In Button
            <button
              onClick={() => setShowLoginForm(true)}
              className="btn-lowther btn-lowther--full btn-lowther--cta"
            >
              Sign In
            </button>
          ) : (
            // Login Form
            <form onSubmit={handleSignIn} className="space-y-4 animate-in slide-in-from-top-4 duration-500">
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
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-lowther btn-lowther--full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="btn-lowther"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-brand-grey2 mt-3">
                We'll send you a magic link to sign in securely
              </p>
            </form>
          )}
        </div>
        
        {/* Register Link */}
        <div className="text-center">
          <p className="text-brand-grey2 mb-4">New to Listening Circle?</p>
          <Link 
            href="/register" 
            className="btn-lowther"
          >
            Register Now
          </Link>
        </div>
        
        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-brand-light text-3xl mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 15l3-3 4 4 5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Track Performance</h3>
            <p className="text-brand-grey2">Monitor clicks, orders, and earnings in real-time</p>
          </div>
          <div className="p-6">
            <div className="text-brand-light text-3xl mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                <path d="M12 1v22M5 5h8a4 4 0 010 8H8a4 4 0 000 8h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Earn Commissions</h3>
            <p className="text-brand-grey2">Get rewarded for every successful referral</p>
          </div>
          <div className="p-6">
            <div className="text-brand-light text-3xl mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 4.5A2.5 2.5 0 016.5 7H20v13H6.5A2.5 2.5 0 014 17.5v-13z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-heading text-xl mb-2 text-brand-light">Knowledge Base</h3>
            <p className="text-brand-grey2">Access exclusive content and resources</p>
          </div>
        </div>
      </div>
    </div>
  )
}

