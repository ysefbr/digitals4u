import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digitalservices4u.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/portal", "/digitals4uy"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
