"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const [email, setEmail] = useState("peter@lowtherloudspeakers.com")
  const [password, setPassword] = useState("warpwarp")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    console.log("Admin login page loaded")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log('Attempting to sign in with:', { email, password: '***' })

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        console.log('Sign in error:', result.error)
        setError("Invalid email or password")
      } else {
        console.log('Sign in successful, redirecting...')
        // Force a page reload to ensure session is properly set
        window.location.href = "/admin"
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lowther Listening Circle Admin Portal
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Default credentials:</strong><br />
              Email: peter@lowtherloudspeakers.com<br />
              Password: warpwarp
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
