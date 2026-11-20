import { BRAND_CONFIG } from '../config/brand.config'

export interface PaymentSettings {
  gcash: {
    enabled: boolean
    accountName: string
    mobileNumber: string
    customQrImage?: string
  }
  bank: {
    enabled: boolean
    bankName: string
    accountName: string
    accountNumber: string
    customQrImage?: string
  }
  cod: {
    enabled: boolean
    instructions: string
  }
}

const KEY = 'jeswelry-payment-settings'

export const defaultPaymentSettings: PaymentSettings = {
  gcash: { ...BRAND_CONFIG.defaultPayments.gcash },
  bank: { ...BRAND_CONFIG.defaultPayments.bank },
  cod: { ...BRAND_CONFIG.defaultPayments.cod },
}

function canUseStorage(): boolean {
  return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
}

export function getPaymentSettings(): PaymentSettings {
  if (!canUseStorage()) return defaultPaymentSettings
  try {
    const stored = globalThis.localStorage.getItem(KEY)
    if (!stored) return defaultPaymentSettings
    const parsed = JSON.parse(stored) as Partial<PaymentSettings>
    return {
      gcash: { ...defaultPaymentSettings.gcash, ...parsed.gcash },
      bank: { ...defaultPaymentSettings.bank, ...parsed.bank },
      cod: { ...defaultPaymentSettings.cod, ...parsed.cod },
    }
  } catch {
    return defaultPaymentSettings
  }
}

export function savePaymentSettings(settings: PaymentSettings): void {
  if (canUseStorage()) globalThis.localStorage.setItem(KEY, JSON.stringify(settings))
}
