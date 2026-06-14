"use client"

import * as React from "react"
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/admin-categories"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface CategoriesClientProps {
  initialCategories: any[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = React.useState<any[]>(initialCategories)
  const [loading, setLoading] = React.useState(false)
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  // Form Drawer/Modal state
  const [isOpen, setIsOpen] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)
  
  // Form Fields
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")

  React.useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const openCreateForm = () => {
    setEditId(null)
    setName("")
    setSlug("")
    setError(null)
    setIsOpen(true)
  }

  const openEditForm = (cat: any) => {
    setEditId(cat.id)
    setName(cat.name)
    setSlug(cat.slug)
    setError(null)
    setIsOpen(true)
  }

  const handleDelete = async (catId: string) => {
    setActionLoadingId(catId)
    setError(null)
    try {
      const res = await deleteCategoryAction(catId)
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId))
        setDeleteConfirmId(null)
      } else {
        alert(res.error || "Failed to delete category.")
      }
    } catch (err) {
      console.error(err)
      alert("An unexpected error occurred.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!name || !slug) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    try {
      if (editId) {
        const res = await updateCategoryAction(editId, { name, slug })
        if (res.success) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editId ? { ...c, name, slug } : c))
          )
          setIsOpen(false)
        } else {
          setError(res.error || "Failed to update category.")
        }
      } else {
        const res = await createCategoryAction({ name, slug })
        if (res.success) {
          window.location.reload()
        } else {
          setError(res.error || "Failed to create category.")
        }
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val)
    if (!editId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Categories</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage product categories for your catalog.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className={buttonVariants({
            className: "gap-2 w-full sm:w-auto font-semibold cursor-pointer",
          })}
        >
          <Plus className="size-4" /> Add Category
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in duration-150 text-left relative"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {editId ? "Edit Category" : "Add New Category"}
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-white text-xs font-semibold">
                Category Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Streaming"
                required
                className="bg-background border-border text-sm h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-white text-xs font-semibold">
                URL Slug
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. streaming"
                required
                className="bg-background border-border text-sm h-10 rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className={buttonVariants({
                  className: "flex-1 justify-center gap-2 cursor-pointer",
                })}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Save"}
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

      <div className="rounded-2xl border border-border bg-card/15 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-slate-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground text-xs">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-bold text-white">{cat.name}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                    <td className="p-4 text-right">
                      {deleteConfirmId === cat.id ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-[10px] text-rose-400 font-semibold">Delete?</span>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={actionLoadingId === cat.id}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                              className: "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer",
                            })}
                          >
                            {actionLoadingId === cat.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Check className="size-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                              className: "text-slate-400 hover:text-white cursor-pointer",
                            })}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditForm(cat)}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                              className: "text-slate-400 hover:text-white cursor-pointer",
                            })}
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cat.id)}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                              className: "text-slate-400 hover:text-rose-400 cursor-pointer",
                            })}
                          >
                            <Trash className="size-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
