// 1. Check if Supabase credentials are set
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    url &&
    url !== "https://your-project-id.supabase.co" &&
    url.includes(".supabase.co") &&
    key &&
    key !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." &&
    (key.startsWith("eyJ") || key.startsWith("sb_publishable_"))
  )
}

// Helper to format currency dynamically in Tunisian Dinars (TND)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
  }).format(amount)
}

// 2. High-Fidelity Mock Data
export const MOCK_CATEGORIES = [
  { id: "c1000000-0000-0000-0000-000000000001", name: "AI Tools", slug: "ai-tools", image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&q=80" },
  { id: "c2000000-0000-0000-0000-000000000002", name: "Streaming", slug: "streaming", image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80" },
  { id: "c3000000-0000-0000-0000-000000000003", name: "Software & Dev", slug: "software-dev", image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&q=80" }
]

export interface ProductType {
  id: string
  title: string
  description: string
  price: number
  stock_count: number
  category_id: string
  category: { name: string; slug: string }
  is_active: boolean
  features: string[]
  badge?: string
}

export const MOCK_PRODUCTS: ProductType[] = [
  {
    id: "11000000-0000-0000-0000-000000000001",
    title: "ChatGPT Plus Premium",
    description: "Access GPT-4, DALL-E, and advanced data analysis tools. Direct delivery with shared or private options.",
    price: 65.000,
    stock_count: 15,
    category_id: "c1000000-0000-0000-0000-000000000001",
    category: { name: "AI Tools", slug: "ai-tools" },
    is_active: true,
    features: [
      "Access to GPT-4o & GPT-4",
      "DALL-E Image Generation",
      "Advanced Data Analysis",
      "Custom GPT Builders",
      "Instant setup & delivery"
    ],
    badge: "Most Popular"
  },
  {
    id: "22000000-0000-0000-0000-000000000002",
    title: "Midjourney Pro Plan",
    description: "Generate breathtaking images with the world's leading AI art creator. Unlimited relaxed GPU hours.",
    price: 95.000,
    stock_count: 3,
    category_id: "c1000000-0000-0000-0000-000000000001",
    category: { name: "AI Tools", slug: "ai-tools" },
    is_active: true,
    features: [
      "Unlimited relaxed generations",
      "15 hours of Fast GPU generations",
      "Commercial licensing rights",
      "Private stealth image mode",
      "Personal user gallery"
    ]
  },
  {
    id: "33000000-0000-0000-0000-000000000003",
    title: "Netflix Premium 4K",
    description: "Stream unlimited movies and TV shows in 4K Ultra HD. 4 concurrent screens supported.",
    price: 15.000,
    stock_count: 8,
    category_id: "c2000000-0000-0000-0000-000000000002",
    category: { name: "Streaming", slug: "streaming" },
    is_active: true,
    features: [
      "4K Ultra HD resolution",
      "Watch on 4 screens concurrently",
      "Ad-free streaming experience",
      "Download on up to 6 devices",
      "Private locked profile options"
    ],
    badge: "Best Value"
  },
  {
    id: "44000000-0000-0000-0000-000000000004",
    title: "Spotify Premium Individual",
    description: "Listen to music without ad interruptions, download tracks for offline playing, and high quality audio.",
    price: 8.500,
    stock_count: 22,
    category_id: "c2000000-0000-0000-0000-000000000002",
    category: { name: "Streaming", slug: "streaming" },
    is_active: true,
    features: [
      "Completely ad-free music",
      "Download tracks for offline mode",
      "Individual accounts",
      "High-Fidelity audio quality",
      "Unlimited skip buttons"
    ]
  },
  {
    id: "55000000-0000-0000-0000-000000000005",
    title: "Canva Pro Annual",
    description: "Design anything like a professional. Millions of premium templates, photos, and fonts.",
    price: 45.000,
    stock_count: 12,
    category_id: "c3000000-0000-0000-0000-000000000003",
    category: { name: "Software & Dev", slug: "software-dev" },
    is_active: true,
    features: [
      "100+ million premium stock photos",
      "610,000+ premium templates",
      "One-click Magic Resizer tool",
      "Brand Kit management",
      "1TB of cloud storage space"
    ]
  },
  {
    id: "66000000-0000-0000-0000-000000000006",
    title: "YouTube Premium 1-Month",
    description: "Watch YouTube without ads, play video in background, and download videos to play offline.",
    price: 9.000,
    stock_count: 19,
    category_id: "c2000000-0000-0000-0000-000000000002",
    category: { name: "Streaming", slug: "streaming" },
    is_active: true,
    features: [
      "Ad-free video playback",
      "Background audio play",
      "YouTube Music Premium free",
      "Offline downloads supported"
    ]
  }
]

export const MOCK_FAQS = [
  {
    question: "How does the manual WhatsApp payment work?",
    answer: "Add items to your cart, fill in your details, and submit. You will receive an Order ID and a button to contact us on WhatsApp. Simply send us the pre-filled checkout text, and we will send you manual payment instructions (e.g. Sobflous, D17, RunPay, or Bank Transfer). Once paid, we activate and send the details immediately."
  },
  {
    question: "How long does delivery take after payment?",
    answer: "Typically, digital credentials and streaming profiles are delivered within 15 minutes to 2 hours of payment confirmation. All details are securely delivered to your platform's customer portal under the Secure Delivery Vault."
  },
  {
    question: "Are these subscriptions shared or private?",
    answer: "It depends on the plan. Netflix is typically shared (you receive a private profile with a custom PIN code). ChatGPT Plus and Canva are private accounts unless explicitly labeled. Each product detail page details its account type."
  },
  {
    question: "Do you offer warranty or guarantees?",
    answer: "Yes, we guarantee active status for the full duration of your purchase (e.g. 1 Month, 6 Months, or 1 Year). If you run into any access issues, reach out to our WhatsApp support, and we will replace or repair the credentials immediately."
  }
]
