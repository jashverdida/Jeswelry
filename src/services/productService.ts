import { mockProducts } from '../data/mockProducts'
import type { Product } from '../types/jewelry'
import { BRAND_CONFIG } from '../config/brand.config'

const PRODUCTS_KEY = 'atelier-aurelia-products'

function canUseStorage(): boolean {
  return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
}

function cloneProducts(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    images: [...product.images],
    variants: product.variants.map((variant) => ({ ...variant })),
    careInstructions: [...product.careInstructions],
  }))
}

function getStoredProducts(): Product[] {
  if (!canUseStorage()) return cloneProducts(mockProducts)
  try {
    const stored = globalThis.localStorage.getItem(PRODUCTS_KEY)
    if (!stored) {
      globalThis.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts))
      return cloneProducts(mockProducts)
    }
    return cloneProducts(JSON.parse(stored) as Product[])
  } catch {
    return cloneProducts(mockProducts)
  }
}

function persistProducts(products: Product[]): void {
  if (canUseStorage()) {
    globalThis.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  }
}

export async function getProducts(): Promise<Product[]> {
  return cloneProducts(getStoredProducts())
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return cloneProducts(
    getStoredProducts().filter((product) => product.featured),
  )
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const product = getStoredProducts().find((item) => item.slug === slug)
  return product ? { ...product } : undefined
}

export async function createProduct(product: Product): Promise<Product> {
  const products = getStoredProducts()
  const created = cloneProducts([product])[0]
  persistProducts([...products, created])
  return created
}

export async function updateProduct(product: Product): Promise<Product> {
  const products = getStoredProducts()
  const updated = cloneProducts([product])[0]
  persistProducts(
    products.map((item) => (item.id === updated.id ? updated : item)),
  )
  return updated
}

export async function deleteProduct(productId: string): Promise<void> {
  persistProducts(
    getStoredProducts().filter((product) => product.id !== productId),
  )
}

export function resetDemoData(): void {
  persistProducts(cloneProducts(mockProducts))
}

export function formatPhp(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: BRAND_CONFIG.currency.code,
    minimumFractionDigits: 2,
  }).format(amount)
}
