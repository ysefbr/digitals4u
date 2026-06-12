"use client"

import * as React from "react"
import { useCartStore } from "@/lib/cart"
import { formatCurrency } from "@/lib/data"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ShoppingCart, Plus, Minus, Trash2, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function CartDrawer() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  const { items, updateQuantity, removeItem, getCartTotal, getItemCount } = useCartStore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        className={buttonVariants({ variant: "ghost", size: "icon", className: "relative border border-border/50" })}
      >
        <ShoppingCart className="size-5 text-muted-foreground" />
      </button>
    )
  }

  const total = getCartTotal()
  const count = getItemCount()

  const handleCheckoutClick = () => {
    setOpen(false)
    router.push("/checkout")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "relative border border-border/50 bg-background/50 backdrop-blur-sm cursor-pointer select-none",
            })}
          />
        }
      >
        <ShoppingCart className="size-5 text-white" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in duration-200">
            {count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md bg-card/95 border-l border-border backdrop-blur-md flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b border-border/50">
          <SheetTitle className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" /> Your Cart
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Review your digital subscriptions before checking out.
          </SheetDescription>
        </SheetHeader>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="size-16 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Your cart is empty</h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Explore our catalog to add digital subscriptions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "border-border" })}
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl border border-border bg-background/40 hover:border-border/80 transition-colors relative"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest block">
                      {item.categoryName}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate pr-6">{item.title}</h4>
                    <div className="text-sm font-semibold text-white">{formatCurrency(item.price)}</div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="size-6 rounded-md bg-muted border border-border/60 hover:bg-muted/80 text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-xs font-semibold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_count}
                        className="size-6 rounded-md bg-muted border border-border/60 hover:bg-muted/80 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Plus className="size-3" />
                      </button>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        Max: {item.stock_count}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-card/70 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-2xl font-extrabold text-white">{formatCurrency(total)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>Manual activation via WhatsApp after order checkout.</span>
            </div>

            <button
              type="button"
              onClick={handleCheckoutClick}
              className={buttonVariants({ className: "w-full justify-center gap-2 cursor-pointer font-medium h-11" })}
            >
              Proceed to Checkout <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
