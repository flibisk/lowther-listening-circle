"use client"

import { useState } from "react"

interface TierBadgeProps {
  tier: "ADVOCATE" | "AMBASSADOR"
  className?: string
}

export function TierBadge({ tier, className = "" }: TierBadgeProps) {
  const [open, setOpen] = useState(false)

  const tooltipContent = {
    ADVOCATE: "As an Advocate, you introduce others to Lowther within your own circles. You may prefer more support and resources from us, and you receive the 10% reward rate.",
    AMBASSADOR: "As an Ambassador, you share your Lowther system with others, host listening sessions or events, and help guide new enthusiasts. You receive a higher reward rate in recognition of your role."
  }

  return (
    <>
      <button
        type="button"
        className={`badge-tier cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`tier-modal-${tier}`}
      >
        {tier}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          id={`tier-modal-${tier}`}
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-brand-primary/95 border border-brand-gold/30 rounded-2xl shadow-2xl w-[92vw] max-w-[640px] p-6 text-brand-light text-left">
            <h3 className="font-heading text-xl mb-3 text-brand-gold break-words">{tier}</h3>
            <div className="max-h-[70vh] overflow-y-auto">
              <p className="text-sm leading-relaxed text-brand-light/90 break-words whitespace-pre-wrap">{tooltipContent[tier]}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn-lowther" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
