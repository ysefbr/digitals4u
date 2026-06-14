import { CategoriesClient } from "./categories-client"
import { getCategories } from "@/lib/data.server"

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return <CategoriesClient initialCategories={categories} />
}
