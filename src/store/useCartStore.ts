import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types/jewelry'

interface CartState {
  items: CartItem[]
  isCartOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getSubtotalPhp: () => number
}

const persistedValues = new Map<string, string>()

const portableStorage = {
  getItem: (name: string): string | null => persistedValues.get(name) ?? null,
  setItem: (name: string, value: string): void => {
    persistedValues.set(name, value)
  },
  removeItem: (name: string): void => {
    persistedValues.delete(name)
  },
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.variantId === item.variantId,
          )

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.variantId === item.variantId
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem,
              ),
            }
          }

          return { items: [...state.items, { ...item }] }
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId ? { ...item, quantity } : item,
                ),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getSubtotalPhp: () =>
        get().items.reduce(
          (subtotal, item) => subtotal + item.unitPricePhp * item.quantity,
          0,
        ),
    }),
    {
      name: 'jeswelry-cart',
      storage: {
        getItem: (name) => {
          const value = portableStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) =>
          portableStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => portableStorage.removeItem(name),
      },
    },
  ),
)
