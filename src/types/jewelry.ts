export type JewelryCategory =
  | 'rings'
  | 'necklaces'
  | 'bracelets'
  | 'bangles'
  | 'earrings'
  | 'watches'
  | 'sets'
  | 'custom'

export type GoldPurity = '14K' | '18K' | '21K' | '925 Silver'

export interface ProductVariant {
  id: string
  label: string
  purity: GoldPurity
  weightGrams: number
  pricePhp: number
  stockCount: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category: JewelryCategory
  description: string
  featured: boolean
  images: string[]
  variants: ProductVariant[]
  careInstructions: string[]
}

export interface CartItem {
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  purity: GoldPurity
  weightGrams: number
  unitPricePhp: number
  image: string
  quantity: number
}

export interface Order {
  id: string
  userId?: string
  customerEmail: string
  customerName: string
  customerPhone: string
  fulfillmentMethod: 'delivery' | 'pickup'
  deliveryAddress?: string
  paymentMethod: 'gcash' | 'bank_transfer' | 'cod'
  paymentReference?: string
  paymentProofName?: string
  paymentProofPreview?: string
  items: CartItem[]
  totalPhp: number
  status: 'pending' | 'verified' | 'shipped' | 'completed'
  createdAt: string
}
