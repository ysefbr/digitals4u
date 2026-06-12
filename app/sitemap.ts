import { MetadataRoute } from "next"
import { getProducts } from "@/lib/data.server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digitalservices4u.com"

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/catalog",
    "/terms",
    "/refund",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }))

  // 2. Dynamic Product Routes
  try {
    const products = await getProducts()
    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...productRoutes]
  } catch (err) {
    console.error("Sitemap compilation failed, returning static routes:", err)
    return staticRoutes
  }
}
