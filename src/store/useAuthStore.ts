import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BRAND_CONFIG } from '../config/brand.config'

export type UserRole = 'guest' | 'customer' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  role: Exclude<UserRole, 'guest'>
  deliveryAddress?: string
}

interface AuthState {
  currentUser: AuthUser | null
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (name: string, email: string, phone: string, password: string) => { ok: boolean; error?: string }
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'email' | 'phone' | 'deliveryAddress'>>) => void
  logout: () => void
}

interface StoredAccount extends AuthUser {
  password: string
}

const ACCOUNTS_KEY = 'atelier-aurelia-auth-accounts'

const demoAccounts: StoredAccount[] = [
  {
    id: 'admin-demo',
    name: `${BRAND_CONFIG.name} Administrator`,
    email: 'admin@jeswelry.ph',
    phone: '',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: 'customer-demo',
    name: `${BRAND_CONFIG.name} Client`,
    email: 'client@jeswelry.ph',
    phone: '0917 555 0194',
    role: 'customer',
    password: 'client123',
  },
]

function getStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) return null
  return globalThis.localStorage
}

function getAccounts(): StoredAccount[] {
  const storage = getStorage()
  if (!storage) return [...demoAccounts]
  try {
    const stored = storage.getItem(ACCOUNTS_KEY)
    const accounts = stored ? JSON.parse(stored) as StoredAccount[] : []
    return [...demoAccounts, ...accounts]
  } catch {
    return [...demoAccounts]
  }
}

function saveRegisteredAccount(account: StoredAccount) {
  const storage = getStorage()
  if (!storage) return
  const stored = storage.getItem(ACCOUNTS_KEY)
  const registered = stored ? JSON.parse(stored) as StoredAccount[] : []
  storage.setItem(ACCOUNTS_KEY, JSON.stringify([...registered, account]))
}

const portableStorage = {
  getItem: (name: string) => {
    const storage = getStorage()
    const value = storage?.getItem(name)
    return value ? JSON.parse(value) : null
  },
  setItem: (name: string, value: unknown) => {
    getStorage()?.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string) => getStorage()?.removeItem(name),
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (email, password) => {
        const account = getAccounts().find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
        )
        if (!account) return { ok: false, error: 'Invalid email or password.' }
        const { password: _password, ...user } = account
        set({ currentUser: user })
        return { ok: true }
      },
      register: (name, email, phone, password) => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!name.trim() || !normalizedEmail || !phone.trim() || password.length < 6) {
          return { ok: false, error: 'Complete all fields; password must be at least 6 characters.' }
        }
        if (getAccounts().some((account) => account.email.toLowerCase() === normalizedEmail)) {
          return { ok: false, error: 'An account with this email already exists.' }
        }
        const account: StoredAccount = {
          id: `customer-${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          role: 'customer',
          password,
        }
        saveRegisteredAccount(account)
        const { password: _password, ...user } = account
        set({ currentUser: user })
        return { ok: true }
      },
      updateProfile: (updates) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
        })),
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'atelier-aurelia-auth',
      storage: portableStorage,
    },
  ),
)
