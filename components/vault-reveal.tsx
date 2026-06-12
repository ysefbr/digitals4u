"use client"

import * as React from "react"
import { getVaultCredentialsAction } from "@/actions/vault"
import { Button } from "@/components/ui/button"
import { Key, Eye, Copy, Check, Lock, Unlock, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VaultRevealProps {
  orderId: string
}

export function VaultReveal({ orderId }: VaultRevealProps) {
  const [revealed, setRevealed] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [credentials, setCredentials] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleReveal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getVaultCredentialsAction(orderId)
      if (res.success && res.credentials) {
        setCredentials(res.credentials)
        setRevealed(true)
      } else {
        setError(res.error || "Failed to reveal credentials.")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to query the secure vault.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!credentials) return
    navigator.clipboard.writeText(credentials)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Locked State */}
      {!revealed && (
        <div className="p-5 rounded-xl border border-border bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Credentials Vault</h4>
              <p className="font-mono text-xs text-muted-foreground mt-1 tracking-widest">
                ••••••••••••••••••••••••••••
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleReveal}
            disabled={loading}
            size="sm"
            className="gap-2 w-full sm:w-auto cursor-pointer select-none"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Unlocking...
              </>
            ) : (
              <>
                <Eye className="size-3.5" /> Reveal Credentials
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Vault Locked: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Unlocked Credentials Box */}
      {revealed && credentials && (
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Unlock className="size-4" /> Credentials Unlocked
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/80 hover:bg-muted/80 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy Details
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-background/80 border border-border/60 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
            {credentials}
          </pre>

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs">
            ⚠️ <strong>Security Notice:</strong> Do not share these credentials with anyone. For shared accounts (e.g. Netflix), please use only your designated profile. Do not attempt to modify billing or security settings.
          </div>
        </div>
      )}
    </div>
  )
}
