"use client"

import { useEffect, useState } from "react"

const CONSENT_KEY = "llc_cookie_consent_v1"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const existing = localStorage.getItem(CONSENT_KEY)
      if (!existing) setVisible(true)
    } catch {}
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ acceptedAt: Date.now() }))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6">
      <div className="mx-auto max-w-4xl bg-brand-primary/90 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-4 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-brand-grey2">
            We use essential cookies to sign you in and analyze usage. See our {" "}
            <a href="/cookies" className="underline text-brand-light">Cookie Policy</a> and {" "}
            <a href="/privacy" className="underline text-brand-light">Privacy Policy</a>.
          </p>
          <div className="flex items-center gap-3">
            <a href="/cookies" className="text-xs text-brand-grey2 underline">Learn more</a>
            <button onClick={accept} className="btn-lowther btn-lowther--sm">
              I agree
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


