"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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
    <div className="mx-auto max-w-md p-8">
      <h1 className="font-heading text-3xl mb-2">Sign up</h1>
      <p className="text-gray-600 mb-6">Enter your email to create an account and receive a magic link</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main Street, City, State, ZIP"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="London, UK"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Create Account & Send Magic Link"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes("Check your email") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <p className="mt-6 text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  )
}

