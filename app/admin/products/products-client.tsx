"use client"

import * as React from "react"
import {
  createProductAction,
  updateProductAction,
  toggleProductActiveAction,
} from "@/actions/admin-products"
import { formatCurrency, ProductType } from "@/lib/data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProductsClientProps {
  initialProducts: any[]
  categories: any[]
}

export function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [products, setProducts] = React.useState<any[]>(initialProducts)
  const [loading, setLoading] = React.useState(false)
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  
  // Form Drawer/Modal state
  const [isOpen, setIsOpen] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)

  // Form Fields
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [stock, setStock] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imageUrl, setImageUrl] = React.useState("")
  const [uploadingImage, setUploadingImage] = React.useState(false)

  React.useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const openCreateForm = () => {
    setEditId(null)
    setTitle("")
    setDescription("")
    setPrice("")
    setStock("")
    setCategoryId(categories[0]?.id || "")
    setIsActive(true)
    setImageFile(null)
    setImageUrl("")
    setError(null)
    setIsOpen(true)
  }

  const openEditForm = (product: any) => {
    setEditId(product.id)
    setTitle(product.title)
    setDescription(product.description)
    setPrice(product.price.toString())
    setStock(product.stock_count.toString())
    setCategoryId(product.category_id || categories[0]?.id || "")
    setIsActive(product.is_active)
    setImageFile(null)
    setImageUrl(product.image || "")
    setError(null)
    setIsOpen(true)
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    setActionLoadingId(productId)
    try {
      const res = await toggleProductActiveAction(productId, !currentStatus)
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_active: !currentStatus } : p))
        )
      } else {
        alert(res.error || "Failed to update product status.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const numPrice = parseFloat(price)
    const numStock = parseInt(stock)

    if (!title || !description || isNaN(numPrice) || isNaN(numStock)) {
      setError("Please fill in all fields with valid data.")
      setLoading(false)
      return
    }

    if (numPrice < 0 || numStock < 0) {
      setError("Price and Stock Count cannot be negative.")
      setLoading(false)
      return
    }

    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        setUploadingImage(true)
        const supabase = createClient()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile)

        if (uploadError) {
          setError("Failed to upload image: " + uploadError.message)
          setLoading(false)
          setUploadingImage(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath)
          
        finalImageUrl = publicUrlData.publicUrl
        setUploadingImage(false)
      }

      if (editId) {
        // Edit Action
        const res = await updateProductAction(editId, {
          title,
          description,
          price: numPrice,
          stock_count: numStock,
          category_id: categoryId || undefined,
          is_active: isActive,
          image: finalImageUrl,
        })

        if (res.success) {
          // Update local state directly for responsive feedback
          const updatedCategoryName = categories.find((c) => c.id === categoryId)?.name || "Uncategorized"
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editId
                ? {
                    ...p,
                    title,
                    description,
                    price: numPrice,
                    stock_count: numStock,
                    category_id: categoryId,
                    category: { name: updatedCategoryName },
                    is_active: isActive,
                    image: finalImageUrl,
                  }
                : p
            )
          )
          setIsOpen(false)
        } else {
          setError(res.error || "Failed to update product.")
        }
      } else {
        // Create Action
        const res = await createProductAction({
          title,
          description,
          price: numPrice,
          stock_count: numStock,
          category_id: categoryId || undefined,
          is_active: isActive,
          image: finalImageUrl,
        })

        if (res.success) {
          // Reload page or insert a simulated row
          window.location.reload()
        } else {
          setError(res.error || "Failed to create product.")
        }
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Products Catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage listed digital subscriptions, prices, and stock inventory.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className={buttonVariants({
            className: "gap-2 w-full sm:w-auto font-semibold cursor-pointer",
          })}
        >
          <Plus className="size-4" /> Add Product
        </button>
      </div>

      {/* Editor Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in duration-150 text-left relative"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {editId ? "Edit Product Subscription" : "Add New Subscription"}
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-white text-xs font-semibold">
                Product Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Netflix Premium 4K"
                required
                className="bg-background border-border text-sm h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-white text-xs font-semibold">
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Write a clear account subscription summary..."
                required
                className="w-full bg-background border border-border text-sm rounded-xl p-3 outline-none focus:border-ring focus:ring-1 focus:ring-ring text-white resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">
                Product Image (JPEG, PNG, GIF)
              </Label>
              <div className="flex items-center gap-3">
                {imageUrl && !imageFile && (
                  <div className="relative group">
                    <img src={imageUrl} alt="Preview" className="size-10 rounded-md object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      title="Remove image"
                      className="absolute -top-1.5 -right-1.5 size-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                )}
                {imageFile && (
                  <div className="relative group">
                    <div className="size-10 rounded-md bg-primary/20 border border-primary flex items-center justify-center">
                      <ImageIcon className="size-5 text-primary" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      title="Remove selected file"
                      className="absolute -top-1.5 -right-1.5 size-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                  className="bg-background border-border text-sm h-10 rounded-xl cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:cursor-pointer hover:file:bg-primary/20 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-white text-xs font-semibold">
                  Price (TND)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="65.000"
                  required
                  className="bg-background border-border text-sm h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-white text-xs font-semibold">
                  Stock Inventory
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="15"
                  required
                  className="bg-background border-border text-sm h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-white text-xs font-semibold">
                  Category
                </Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-background border border-border text-sm rounded-xl h-10 px-3 outline-none focus:border-ring text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  id="active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded-md accent-primary"
                />
                <Label htmlFor="active" className="text-white text-xs font-semibold cursor-pointer">
                  Listed & Active
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className={buttonVariants({
                  className: "flex-1 justify-center gap-2 cursor-pointer",
                })}
              >
                {loading || uploadingImage ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> {uploadingImage ? "Uploading Image..." : "Saving..."}
                  </>
                ) : (
                  "Save Product"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={buttonVariants({
                  variant: "outline",
                  className: "border-border flex-1 justify-center cursor-pointer",
                })}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listing Table */}
      <div className="rounded-2xl border border-border bg-card/15 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                <th className="p-4">Subscription Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-slate-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-bold text-white">{product.title}</td>
                  <td className="p-4">{product.category?.name || "Uncategorized"}</td>
                  <td className="p-4 font-bold text-white">{formatCurrency(product.price)}</td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "font-semibold",
                        product.stock_count <= 0
                          ? "text-rose-400"
                          : product.stock_count <= 5
                          ? "text-amber-400"
                          : "text-emerald-400"
                      )}
                    >
                      {product.stock_count}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      disabled={actionLoadingId === product.id}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer select-none",
                        product.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}
                    >
                      {actionLoadingId === product.id ? (
                        <Loader2 className="size-2.5 animate-spin" />
                      ) : product.is_active ? (
                        <>
                          <Eye className="size-3" /> Listed
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-3" /> Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEditForm(product)}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon-sm",
                        className: "text-slate-400 hover:text-white cursor-pointer",
                      })}
                    >
                      <Edit className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
