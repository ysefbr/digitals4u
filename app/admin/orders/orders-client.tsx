"use client"

import * as React from "react"
import { updateOrderStatusAction, deliverCredentialsAction, deleteOrderAction } from "@/actions/admin-orders"
import { formatCurrency } from "@/lib/data"
import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Trash,
  Search,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface OrdersClientProps {
  initialOrders: any[]
  currentPage: number
  totalPages: number
  initialSearch: string
  initialStatus: string
}

export function OrdersClient({
  initialOrders,
  currentPage,
  totalPages,
  initialSearch,
  initialStatus,
}: OrdersClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [search, setSearch] = React.useState(initialSearch)
  const [filterStatus, setFilterStatus] = React.useState(initialStatus)

  const [orders, setProducts] = React.useState<any[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(initialOrders[0] || null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  
  // Delivery form state
  const [showDeliveryForm, setShowDeliveryForm] = React.useState(false)
  const [credentialsText, setCredentialsText] = React.useState("")

  React.useEffect(() => {
    setProducts(initialOrders)
    if (initialOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(initialOrders[0])
    }
  }, [initialOrders])

  // Update URL on search/filter change with simple debounce
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (filterStatus) params.set("status", filterStatus)
      // Reset to page 1 on new search/filter
      if (search !== initialSearch || filterStatus !== initialStatus) {
        params.set("page", "1")
      } else {
        params.set("page", currentPage.toString())
      }
      
      router.push(`${pathname}?${params.toString()}`)
    }, 400)

    return () => clearTimeout(handler)
  }, [search, filterStatus, router, pathname])

  const handleStatusChange = async (orderId: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await updateOrderStatusAction(orderId, status)
      if (res.success) {
        setProducts((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
        setSelectedOrder((prev: any) => (prev && prev.id === orderId ? { ...prev, status } : prev))
      } else {
        setError(res.error || "Failed to update order status.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !credentialsText) return

    setLoading(true)
    setError(null)
    try {
      const res = await deliverCredentialsAction(selectedOrder.id, credentialsText)
      if (res.success) {
        setProducts((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "Delivered" } : o))
        )
        setSelectedOrder((prev: any) =>
          prev ? { ...prev, status: "Delivered" } : null
        )
        setCredentialsText("")
        setShowDeliveryForm(false)
      } else {
        setError(res.error || "Failed to deliver credentials.")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return

    setLoading(true)
    setError(null)
    try {
      const res = await deleteOrderAction(selectedOrder.id)
      if (res.success) {
        setProducts((prev) => prev.filter((o) => o.id !== selectedOrder.id))
        setSelectedOrder(null)
        setDeleteConfirmId(null)
      } else {
        setError(res.error || "Failed to delete order.")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Confirmation":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Waiting for Payment":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Paid":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "Processing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "Cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  // Format phone number for WhatsApp message
  const getWhatsAppContactUrl = (phone: string, fullName: string) => {
    const formattedPhone = phone.replace(/[\s+]/g, "")
    const message = `Bonjour ${fullName}, je vous contacte concernant votre commande sur DigitalServices4U!`
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Orders log table list (Left - Occupies 2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Orders Log</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review checkout submissions and manage credentials delivery.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/15 p-4 rounded-2xl border border-border backdrop-blur-md">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, or email..."
              className="pl-9 bg-background/50 border-border h-10 rounded-xl w-full text-sm"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-background/50 border border-border text-sm rounded-xl h-10 px-3 outline-none focus:border-ring text-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending Confirmation">Pending Confirmation</option>
              <option value="Waiting for Payment">Waiting for Payment</option>
              <option value="Paid">Paid</option>
              <option value="Processing">Processing</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-border bg-card/10 text-xs text-muted-foreground">
            No orders found matching your criteria.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/15 overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                    <th className="p-4">ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-slate-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDeliveryForm(false)
                        setError(null)
                      }}
                      className={cn(
                        "hover:bg-muted/10 transition-colors cursor-pointer",
                        selectedOrder?.id === order.id && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                    >
                      <td className="p-4 font-mono text-xs font-semibold text-white truncate max-w-[100px]">
                        {order.id}
                      </td>
                      <td className="p-4 space-y-0.5">
                        <span className="font-bold text-slate-200 block truncate max-w-[120px]">
                          {order.customer_details.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[120px]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">{formatCurrency(order.total_price)}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            getStatusBadge(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ChevronRight className="size-4 text-slate-500 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.set("page", (currentPage - 1).toString())
                  router.push(`${pathname}?${params.toString()}`)
                }}
                disabled={currentPage <= 1}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "border-border cursor-pointer disabled:opacity-50",
                })}
              >
                <ChevronLeft className="size-4 mr-1" /> Previous
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  params.set("page", (currentPage + 1).toString())
                  router.push(`${pathname}?${params.toString()}`)
                }}
                disabled={currentPage >= totalPages}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "border-border cursor-pointer disabled:opacity-50",
                })}
              >
                Next <ChevronRight className="size-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Order Detail Sidebar Panel (Right - Occupies 1 col) */}
      <div className="lg:col-span-1">
        {selectedOrder ? (
          <div className="rounded-2xl border border-border bg-card/45 p-6 space-y-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="size-4 text-primary" /> Customer Details
              </h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div>
                  <span className="text-muted-foreground block">Name</span>
                  <span className="font-bold text-white">{selectedOrder.customer_details.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email</span>
                  <span>{selectedOrder.customer_details.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Country</span>
                  <span>{selectedOrder.customer_details.country}</span>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-border/50 mt-2">
                  <div>
                    <span className="text-muted-foreground block">Phone</span>
                    <span className="font-bold">{selectedOrder.customer_details.phone}</span>
                  </div>
                  <a
                    href={getWhatsAppContactUrl(
                      selectedOrder.customer_details.phone,
                      selectedOrder.customer_details.fullName
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "xs",
                      className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 gap-1",
                    })}
                  >
                    <MessageSquare className="size-3" /> WhatsApp
                  </a>
                </div>
                {selectedOrder.customer_details.notes && (
                  <div className="pt-2 border-t border-border/50 mt-2">
                    <span className="text-muted-foreground block">Notes</span>
                    <p className="italic text-slate-400 text-[11px] leading-relaxed bg-background/30 p-2.5 rounded-lg border border-border/40 mt-1">
                      "{selectedOrder.customer_details.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-3 pt-4 border-t border-border/50 relative z-10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ordered Items</h3>
              <div className="divide-y divide-border/30 max-h-40 overflow-y-auto pr-1">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex justify-between text-xs first:pt-0">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-200 block">{item.title}</span>
                      <span className="text-muted-foreground">Quantity: {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-white">
                      {formatCurrency(item.price_at_purchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and actions */}
            <div className="pt-4 border-t border-border/50 space-y-4 relative z-10">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Order Total</span>
                <span className="text-xl font-extrabold text-white">
                  {formatCurrency(selectedOrder.total_price)}
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Status progression triggers */}
              {!showDeliveryForm && (
                <div className="space-y-2">
                  {selectedOrder.status === "Pending Confirmation" && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, "Waiting for Payment")}
                      disabled={loading}
                      className={buttonVariants({ className: "w-full justify-center text-xs" })}
                    >
                      Acknowledge & Set Waiting for Payment
                    </button>
                  )}

                  {(selectedOrder.status === "Pending Confirmation" ||
                    selectedOrder.status === "Waiting for Payment") && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, "Paid")}
                      disabled={loading}
                      className={buttonVariants({
                        className: "w-full justify-center bg-blue-600 hover:bg-blue-500 text-xs",
                      })}
                    >
                      Confirm Payment (Mark Paid)
                    </button>
                  )}

                  {selectedOrder.status === "Paid" && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, "Processing")}
                      disabled={loading}
                      className={buttonVariants({
                        className: "w-full justify-center bg-purple-600 hover:bg-purple-500 text-xs",
                      })}
                    >
                      Start Processing (Mark Processing)
                    </button>
                  )}

                  {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                    <button
                      onClick={() => {
                        setCredentialsText("")
                        setShowDeliveryForm(true)
                      }}
                      disabled={loading}
                      className={buttonVariants({
                        className: "w-full justify-center bg-emerald-600 hover:bg-emerald-500 text-xs gap-1.5",
                      })}
                    >
                      <Unlock className="size-3.5" /> Deliver Credentials
                    </button>
                  )}

                  {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Delivered" && (
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, "Cancelled")}
                      disabled={loading}
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full justify-center border-border hover:bg-rose-500/10 hover:text-rose-400 text-xs",
                      })}
                    >
                      Cancel Order
                    </button>
                  )}

                  {selectedOrder.status === "Delivered" && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center gap-1.5 font-bold">
                      <CheckCircle className="size-4" /> Order Successfully Delivered
                    </div>
                  )}

                  {selectedOrder.status === "Cancelled" && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-1.5 font-bold">
                      <XCircle className="size-4" /> Order Cancelled
                    </div>
                  )}

                  {deleteConfirmId === selectedOrder.id ? (
                    <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 space-y-3 mt-4">
                      <span className="text-destructive text-xs font-bold block text-center">
                        Are you sure you want to permanently delete this order?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteOrder}
                          disabled={loading}
                          className={buttonVariants({
                            variant: "destructive",
                            className: "flex-1 justify-center text-xs h-8 cursor-pointer",
                          })}
                        >
                          {loading ? <Loader2 className="size-3 animate-spin" /> : "Yes, Delete"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={loading}
                          className={buttonVariants({
                            variant: "outline",
                            className: "flex-1 justify-center text-xs h-8 border-border text-foreground hover:bg-muted cursor-pointer",
                          })}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(selectedOrder.id)}
                      disabled={loading}
                      className={buttonVariants({
                        variant: "ghost",
                        className: "w-full justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 mt-4 text-xs cursor-pointer",
                      })}
                    >
                      <Trash className="size-3.5 mr-1.5" /> Delete Order Permanently
                    </button>
                  )}
                </div>
              )}

              {/* Delivery Form */}
              {showDeliveryForm && (
                <form onSubmit={handleDeliver} className="space-y-4 pt-2 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label htmlFor="vaultText" className="text-white text-xs font-semibold">
                      Digital Account Credentials
                    </Label>
                    <textarea
                      id="vaultText"
                      required
                      value={credentialsText}
                      onChange={(e) => setCredentialsText(e.target.value)}
                      rows={4}
                      placeholder="e.g.&#13;Email: netflix@service.com&#13;Password: NetPass123!&#13;Profile: Profile 3 (PIN: 1234)"
                      className="w-full bg-background border border-border text-xs rounded-xl p-3 outline-none focus:border-ring focus:ring-1 focus:ring-ring text-white font-mono resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={buttonVariants({
                        className: "flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 text-xs gap-1 cursor-pointer",
                      })}
                    >
                      {loading ? <Loader2 className="size-3 animate-spin" /> : "Submit to Vault"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeliveryForm(false)}
                      className={buttonVariants({
                        variant: "outline",
                        className: "border-border flex-1 justify-center text-xs cursor-pointer",
                      })}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/10 p-6 text-center text-xs text-muted-foreground">
            Select an order to view customer profiles and status controls.
          </div>
        )}
      </div>
    </div>
  )
}
