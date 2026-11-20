import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  toggle: (productId: string) => void
  isSaved: (productId: string) => boolean
}

const portableStorage = {
  getItem: (name: string): StorageValue<WishlistState> | null => {
    if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return null
    const value = globalThis.localStorage.getItem(name)
    return value ? JSON.parse(value) : null
  },
  setItem: (name: string, value: StorageValue<WishlistState>): void => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      globalThis.localStorage.setItem(name, JSON.stringify(value))
    }
  },
  removeItem: (name: string): void => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      globalThis.localStorage.removeItem(name)
    }
  },
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      isSaved: (productId) => get().productIds.includes(productId),
    }),
    { name: 'jeswelry-wishlist', storage: portableStorage },
  ),
)
