"use client"

import * as React from "react"
import { useCartStore } from "@/lib/cart"
import { Button } from "@/components/ui/button"

interface AddToCartButtonProps {
  id: string
  title: string
  price: number
  stock_count: number
  categoryName: string
}

export function AddToCartButton({
  id,
  title,
  price,
  stock_count,
  categoryName,
}: AddToCartButtonProps) {
  const { addItem, items } = useCartStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button disabled={stock_count <= 0} size="lg" className="w-full justify-center h-11 font-medium">
        {stock_count <= 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    )
  }

  const cartItem = items.find((item) => item.id === id)
  const currentQuantity = cartItem?.quantity || 0
  const isOutOfStock = stock_count <= 0
  const isLimitReached = currentQuantity >= stock_count

  const handleAddToCart = () => {
    addItem({
      id,
      title,
      price,
      stock_count,
      categoryName,
    })
  }

  return (
    <Button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock || isLimitReached}
      size="lg"
      className="w-full justify-center select-none font-medium h-11 cursor-pointer"
    >
      {isOutOfStock
        ? "Out of Stock"
        : isLimitReached
        ? "Stock Limit Reached"
        : "Add to Cart"}
    </Button>
  )
}
