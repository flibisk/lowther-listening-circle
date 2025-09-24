"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Remove console log for security
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError("Invalid email or password")
        } else if (result.error === 'RateLimitExceeded') {
          setError("Too many login attempts. Please try again in 15 minutes.")
        } else {
          setError("Login failed. Please try again.")
        }
      } else {
        // Force a page reload to ensure session is properly set
        window.location.href = "/admin"
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetMessage("")

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResetMessage(data.error || "Failed to send reset email")
        return
      }

      setResetMessage("Password reset email sent! Check your inbox.")
      setShowForgotPassword(false)
    } catch (error) {
      setResetMessage("An error occurred. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-haze flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/listening-circle.png" alt="Lowther Listening Circle" className="mx-auto h-16 w-auto object-contain drop-shadow-2xl" />
          <h2 className="mt-6 font-heading text-3xl text-brand-light tracking-wide">Admin Sign In</h2>
          <p className="mt-2 text-sm text-brand-grey2">Lowther Listening Circle Admin Portal</p>
        </div>
        <div className="bg-brand-primary/80 backdrop-blur-sm border border-brand-gold/30 rounded-3xl p-6 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-grey2 mb-2">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-grey2 mb-2">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center rounded-xl p-2">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-lowther disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-brand-gold hover:text-brand-light text-sm transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {resetMessage && (
            <div className={`mt-4 p-3 rounded-xl text-sm text-center ${
              resetMessage.includes("sent") 
                ? "bg-green-500/20 border border-green-500/30 text-green-300"
                : "bg-red-500/20 border border-red-500/30 text-red-300"
            }`}>
              {resetMessage}
            </div>
          )}

          {showForgotPassword && (
            <div className="mt-6 p-4 bg-brand-haze/30 rounded-xl border border-brand-gold/20">
              <h3 className="font-heading text-lg text-brand-light mb-3">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter admin email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-brand-haze/50 border border-brand-gold/30 text-brand-light placeholder-brand-grey2 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 btn-lowther text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetMessage("")
                      setResetEmail("")
                    }}
                    className="flex-1 bg-brand-haze/50 text-brand-light border border-brand-gold/30 rounded-lg px-3 py-2 text-sm hover:bg-brand-haze/70 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
