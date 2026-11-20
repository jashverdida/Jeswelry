import { create } from 'zustand'

interface ToastState {
  message: string
  visible: boolean
  show: (message: string) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  show: (message) => {
    set({ message, visible: true })
    window.setTimeout(() => set({ visible: false }), 2400)
  },
  hide: () => set({ visible: false }),
}))
