export type BrandCategoryId =
  | 'all'
  | 'rings'
  | 'necklaces'
  | 'bracelets'
  | 'bangles'
  | 'earrings'
  | 'watches'
  | 'sets'
  | 'custom'

export interface BrandCategory {
  id: BrandCategoryId
  label: string
  editorialTitle: string
}

export interface BrandConfig {
  name: string
  shortCode: string
  city: string
  heroTitle: string
  heroSubtitle: string
  heroProvenance: string
  contacts: {
    owners: string
    phone: string
    email: string
    facebookUrl: string
    instagramUrl: string
    pickupAddress: string
  }
  currency: {
    code: string
    symbol: string
  }
  categories: BrandCategory[]
  attributeFilter: {
    label: string
    allLabel: string
    options: string[]
  }
  defaultPayments: {
    gcash: {
      enabled: boolean
      accountName: string
      mobileNumber: string
    }
    bank: {
      enabled: boolean
      bankName: string
      accountName: string
      accountNumber: string
    }
    cod: {
      enabled: boolean
      instructions: string
    }
  }
}

export const BRAND_CONFIG: BrandConfig = {
  name: 'Jeswelry',
  shortCode: 'JSW',
  city: 'Cebu City, Philippines',
  heroTitle: 'Fine Gold & Horology',
  heroSubtitle: 'Authorized fine jewelry, hallmarked 14K–21K gold, and curated timepieces.',
  heroProvenance: 'OFFICIAL & AUTHENTIC AUTHORIZED RESELLER — VERIFIED FINE GOLD & HOROLOGY',
  contacts: {
    owners: 'Dave Verdida & Jesel Desuyo',
    phone: '',
    email: '',
    facebookUrl: '',
    instagramUrl: '',
    pickupAddress: 'Cebu City, Philippines',
  },
  currency: {
    code: 'PHP',
    symbol: '₱',
  },
  categories: [
    { id: 'all', label: 'All', editorialTitle: 'Fine Gold & Horology' },
    { id: 'rings', label: 'Rings', editorialTitle: 'Rings & Solitaires' },
    { id: 'necklaces', label: 'Necklaces', editorialTitle: 'Necklaces & Pendants' },
    { id: 'bracelets', label: 'Bracelets', editorialTitle: 'Chain & Tennis Bracelets' },
    { id: 'bangles', label: 'Bangles', editorialTitle: 'Gold Bangles' },
    { id: 'earrings', label: 'Earrings', editorialTitle: 'Earrings & Drops' },
    { id: 'watches', label: 'Watches', editorialTitle: 'Timepieces & Horology' },
    { id: 'sets', label: 'Sets', editorialTitle: 'Heirloom Suites' },
    { id: 'custom', label: 'Custom', editorialTitle: 'Bespoke Commissions' },
  ],
  attributeFilter: {
    label: 'Metals',
    allLabel: 'All Metals',
    options: ['14K', '18K', '21K', '925 Silver', 'Automatic'],
  },
  defaultPayments: {
    gcash: {
      enabled: true,
      accountName: 'Jeswelry Fine Jewelry',
      mobileNumber: '0917 555 0194',
    },
    bank: {
      enabled: true,
      bankName: 'BDO / BPI InstaPay',
      accountName: 'Jeswelry Fine Jewelry',
      accountNumber: '1234 5678 9012',
    },
    cod: {
      enabled: true,
      instructions: 'Available for verified Cebu City orders or showroom pickup.',
    },
  },
}
