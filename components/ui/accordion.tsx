"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

const AccordionItemContext = React.createContext<{
  isOpen: boolean
  toggle: () => void
} | null>(null)

export function Accordion({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
  type?: string
  collapsible?: boolean
}) {
  return (
    <div data-slot="accordion" className={cn("flex w-full flex-col gap-4", className)}>
      {children}
    </div>
  )
}

export function AccordionItem({
  className,
  children,
  value,
}: {
  className?: string
  children: React.ReactNode
  value: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <AccordionItemContext.Provider value={{ isOpen, toggle }}>
      <div
        data-slot="accordion-item"
        className={cn(
          "border border-border bg-card/30 rounded-xl px-4 py-2 transition-all duration-200",
          isOpen && "border-primary/30 bg-card/50",
          className
        )}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

export function AccordionTrigger({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const context = React.useContext(AccordionItemContext)
  if (!context) {
    throw new Error("AccordionTrigger must be used inside AccordionItem")
  }

  return (
    <button
      type="button"
      onClick={context.toggle}
      data-slot="accordion-trigger"
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-semibold text-white hover:text-primary transition-colors text-base outline-none cursor-pointer select-none",
        className
      )}
    >
      <span>{children}</span>
      <ChevronDownIcon
        className={cn(
          "size-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-4",
          context.isOpen && "rotate-180 text-primary"
        )}
      />
    </button>
  )
}

export function AccordionContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const context = React.useContext(AccordionItemContext)
  if (!context) {
    throw new Error("AccordionContent must be used inside AccordionItem")
  }

  if (!context.isOpen) return null

  return (
    <div
      data-slot="accordion-content"
      className={cn(
        "text-muted-foreground leading-relaxed pt-2 pb-4 text-sm transition-all animate-in fade-in duration-200",
        className
      )}
    >
      {children}
    </div>
  )
}
