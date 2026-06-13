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
        className="pointer-events-auto relative size-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-110 transition-all duration-300 group cursor-pointer"
        aria-label="Contact support on WhatsApp"
        onClick={() => setShowTooltip(false)}
      >
        {/* Glow Pulses */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping duration-1000 opacity-75" />
        <span className="absolute -inset-1 rounded-full border border-emerald-500/20 scale-95 group-hover:scale-105 transition-transform duration-300" />

        {/* WhatsApp Official SVG */}
        <svg
          className="size-7 fill-white transition-transform duration-300 group-hover:rotate-12"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.48-.002 9.932-4.437 9.935-9.899.001-2.647-1.026-5.132-2.89-6.999-1.864-1.866-4.346-2.893-6.995-2.895-5.485 0-9.94 4.437-9.944 9.899-.001 1.902.502 3.758 1.455 5.356L1.87 21.03l4.777-1.876zm13.16-10.742c-.29-.145-1.716-.848-1.98-.943-.264-.096-.456-.145-.648.145-.192.29-.745.943-.912 1.135-.167.192-.335.216-.625.071-.29-.145-1.226-.452-2.336-1.44-.863-.77-1.446-1.72-1.616-2.011-.17-.29-.018-.447.127-.591.13-.13.29-.338.435-.507.145-.169.192-.29.29-.483.096-.193.048-.361-.024-.507-.072-.145-.648-1.562-.887-2.14-.233-.56-.47-.483-.648-.492-.167-.008-.36-.01-.552-.01s-.504.072-.768.361c-.264.29-1.01.989-1.01 2.412 0 1.423 1.034 2.795 1.178 2.99.145.193 2.035 3.11 4.931 4.364.688.298 1.225.476 1.644.609.692.22 1.321.19 1.819.115.553-.083 1.716-.701 1.956-1.378.24-.677.24-1.258.169-1.378-.071-.12-.264-.193-.554-.338z" />
        </svg>
      </a>
    </div>
  )
}
