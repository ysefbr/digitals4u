"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

interface WhatsAppWidgetProps {
  phone: string
  siteName?: string
}

export function WhatsAppWidget({ phone, siteName = "DigitalServices4U" }: WhatsAppWidgetProps) {
  const pathname = usePathname()
  const [showTooltip, setShowTooltip] = React.useState(true)
  const [isDismissed, setIsDismissed] = React.useState(false)

  // Auto-hide tooltip after 8 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  // Hide the widget entirely on admin paths
  if (pathname?.startsWith("/admin") || isDismissed) {
    return null
  }

  // Format the phone number (remove spaces and special chars except '+')
  const formattedPhone = phone.replace(/[\s-]/g, "")
  const message = `Bonjour! J'ai une question concernant vos abonnements sur ${siteName}.`
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 font-sans select-none pointer-events-none">
      {/* Tooltip Dialog */}
      {showTooltip && (
        <div className="pointer-events-auto bg-card/90 border border-border/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[240px] animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-foreground block">Need Help?</span>
            <span className="text-[10px] text-muted-foreground block leading-normal">
              Chat with our team on WhatsApp for support!
            </span>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto relative size-14 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 group cursor-pointer"
        aria-label="Contact support on WhatsApp"
        onClick={() => setShowTooltip(false)}
      >
        {/* Glow Pulses */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping duration-1000 opacity-75" />
        <span className="absolute -inset-1 rounded-full border border-[#25D366]/20 scale-95 group-hover:scale-105 transition-transform duration-300" />

        {/* Official WhatsApp Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="size-14 drop-shadow-lg transition-transform duration-300 group-hover:rotate-12"
          width={56}
          height={56}
        />
      </a>
    </div>
  )
}
