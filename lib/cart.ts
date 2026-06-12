import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  stock_count: number
  categoryName: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: {
    id: string
    title: string
    price: number
    stock_count: number
    categoryName: string
  }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id)
          
          if (existingItem) {
            // Respect stock limit
            const targetQuantity = existingItem.quantity + 1
            if (targetQuantity > newItem.stock_count) {
              return state // Don't exceed stock
            }
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: targetQuantity }
                  : item
              ),
            }
          }

          // Respect stock limit (if product is out of stock entirely)
          if (newItem.stock_count <= 0) {
            return state
          }

          return {
            items: [
              ...state.items,
              {
                id: newItem.id,
                title: newItem.title,
                price: newItem.price,
                quantity: 1,
                stock_count: newItem.stock_count,
                categoryName: newItem.categoryName,
              },
            ],
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const item = state.items.find((item) => item.id === id)
          if (!item) return state

          // Enforce bounds [1, stock_count]
          const targetQuantity = Math.max(
            1,
            Math.min(quantity, item.stock_count)
          )

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: targetQuantity } : i
            ),
          }
        })
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "digitalservices4u-cart",
    }
  )
)
