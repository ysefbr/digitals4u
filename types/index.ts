// Type definitions for DigitalServices4U

export interface User {
  id: string
  email: string
  role: "admin" | "customer"
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number // in TND
  stock_count: number
  category_id: string
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id?: string
  total_price: number
  status: "Pending Confirmation" | "Waiting for Payment" | "Paid" | "Processing" | "Delivered" | "Cancelled"
  customer_details: {
    fullName: string
    email: string
    phone: string
    country: string
    notes?: string
  }
  created_at: string
}
