"use client"

import * as React from "react"
import { updateSettingsAction } from "@/actions/admin-settings"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react"

interface SettingsFormProps {
  initialSettings: {
    whatsapp_number: string
    site_name: string
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [whatsappNumber, setWhatsappNumber] = React.useState(initialSettings.whatsapp_number)
  const [siteName, setSiteName] = React.useState(initialSettings.site_name)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!whatsappNumber || !siteName) {
      setError("Please fill in all configuration details.")
      setLoading(false)
      return
    }

    try {
      const res = await updateSettingsAction({
        whatsapp_number: whatsappNumber,
        site_name: siteName,
      })

      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || "Failed to update configuration.")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected network error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl rounded-2xl border border-border bg-card/45 p-6 sm:p-8 space-y-6 backdrop-blur-md relative overflow-hidden"
    >
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="space-y-1 relative z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-xs text-muted-foreground">
          Configure the active WhatsApp routing number and client branding.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-3 relative z-10">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3 relative z-10">
          <ShieldCheck className="size-4 shrink-0 mt-0.5" />
          <span>Branding and WhatsApp details updated successfully!</span>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="text-white text-xs font-semibold">
            Master WhatsApp Number (International format without '+')
          </Label>
          <Input
            id="whatsapp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="e.g. 21699000000"
            required
            className="bg-background border-border text-sm h-10 rounded-xl"
          />
          <span className="text-[10px] text-muted-foreground block leading-relaxed">
            Must contain country code, phone code, and no special characters or spaces. (e.g. 216 for Tunisia).
          </span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="siteName" className="text-white text-xs font-semibold">
            Platform Site Name
          </Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="DigitalServices4U"
            required
            className="bg-background border-border text-sm h-10 rounded-xl"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={buttonVariants({
          className: "w-full justify-center gap-2 cursor-pointer font-medium h-11 select-none relative z-10 mt-2",
        })}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Updating...
          </>
        ) : (
          "Save Configuration"
        )}
      </button>
    </form>
  )
}
