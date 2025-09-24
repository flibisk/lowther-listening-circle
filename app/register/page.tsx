"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const ambassadorCode = searchParams.get('ambassador')

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
        // Collect application answers
        const application = {
          discover: (document.getElementById('discover') as HTMLTextAreaElement)?.value || "",
          ownership: (document.getElementById('ownership') as HTMLTextAreaElement)?.value || "",
          setup: (document.getElementById('setup') as HTMLTextAreaElement)?.value || "",
          sharedBefore: (document.getElementById('sharedBefore') as HTMLTextAreaElement)?.value || "",
          hostInterest: (document.getElementById('hostInterest') as HTMLSelectElement)?.value || "",
          contribution: (document.getElementById('contribution') as HTMLTextAreaElement)?.value || "",
          supportLevel: (document.getElementById('supportLevel') as HTMLSelectElement)?.value || "",
          availability: (document.getElementById('availability') as HTMLInputElement)?.value || "",
          roleIntent: (document.getElementById('roleIntent') as HTMLSelectElement)?.value || "",
          anythingElse: (document.getElementById('anythingElse') as HTMLTextAreaElement)?.value || ""
        }
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
          application,
          ambassadorCode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setMessage(errorData.error || "Error creating account. Please try again.")
        return
      }

      // Do not send magic link now. Show application received message.
      setMessage(
        "Your application has been received. Each request is considered with care, and those selected will be invited to join the Listening Circle. If accepted, you will receive an email with a secure link to sign in."
      )
    } catch (error) {
      setMessage("Error creating account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6 pt-16">
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
          The Listening Circle is a private space for those who share our values. Your answers below help us understand how best to welcome you — as an Ambassador, an Advocate, or in another role.
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
              <label htmlFor="location" className="block text-sm font-medium text-brand-grey2 mb-2">
                Country of residence / City
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

            {/* Section 2 */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg text-brand-light">Your connection to music & Lowther</h3>
              <textarea id="discover" placeholder="How did you first discover Lowther?" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" rows={3} />
              <textarea id="ownership" placeholder="Do you currently own any Lowther loudspeakers or drive units? (If yes, which models?)" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" rows={3} />
              <textarea id="setup" placeholder="What other audio equipment forms part of your listening setup?" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" rows={3} />
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg text-brand-light">Your experience & community</h3>
              <textarea id="sharedBefore" placeholder="Have you shared Lowther with others before?" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" rows={3} />
              <div>
                <label className="block text-sm font-medium text-brand-grey2 mb-2">Would you host private listening events or demonstrations?</label>
                <select id="hostInterest" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold">
                  <option>Yes</option>
                  <option>Possibly</option>
                  <option>Not at this stage</option>
                </select>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg text-brand-light">Your role in the Circle</h3>
              <textarea id="contribution" placeholder="How do you see yourself contributing to the Listening Circle?" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" rows={3} />
              <div>
                <label className="block text-sm font-medium text-brand-grey2 mb-2">How much support would you like from Lowther?</label>
                <select id="supportLevel" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold">
                  <option>Minimal (I am confident presenting Lowther to others)</option>
                  <option>Some (materials, guidance and occasional help)</option>
                  <option>Significant (more structured support and training)</option>
                </select>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg text-brand-light">Your availability & intentions</h3>
              <input id="availability" placeholder="How much time can you dedicate each month?" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" />
              <div>
                <label className="block text-sm font-medium text-brand-grey2 mb-2">Do you see yourself as…</label>
                <select id="roleIntent" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold">
                  <option>Ambassador</option>
                  <option>Advocate</option>
                  <option>Not sure yet</option>
                </select>
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-2">
              <h3 className="font-heading text-lg text-brand-light">Anything else</h3>
              <textarea id="anythingElse" placeholder="Tell us anything else you'd like us to know" className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300" rows={4} />
            </div>
 
            <button
              type="submit"
              disabled={isLoading}
              className="btn-lowther btn-lowther--full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-xl ${
              message.includes("Your application has been received")
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
            className="btn-lowther"
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

