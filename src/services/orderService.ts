import type { Order } from '../types/jewelry'
import { mockProducts } from '../data/mockProducts'
import { BRAND_CONFIG } from '../config/brand.config'

const ORDERS_KEY = 'atelier-aurelia-orders'
const DEMO_ORDERS_KEY = 'jeswelry-demo-orders-seeded'

export function getDemoOrders(): Order[] {
  const product = (slug: string) => mockProducts.find((item) => item.slug === slug) ?? mockProducts[0]
  const itemFrom = (slug: string, quantity = 1) => {
    const p = product(slug)
    const v = p.variants[0]
    return { productId:p.id, variantId:v.id, productName:p.name, variantLabel:v.label, purity:v.purity, weightGrams:v.weightGrams, unitPricePhp:v.pricePhp, image:p.images[0], quantity }
  }
  const now = Date.now()
  const order = (id:string, name:string, phone:string,email:string,address:string,paymentMethod:Order['paymentMethod'],status:Order['status'],slug:string,total:number,days:number): Order => ({
    id, userId: `demo-${id}`, customerName:name, customerPhone:phone, customerEmail:email,
    fulfillmentMethod:'delivery', deliveryAddress:address, paymentMethod,
    paymentReference: paymentMethod === 'cod' ? undefined : `REF-${id.slice(-4)}-2026`,
    paymentProofName: paymentMethod === 'cod' ? undefined : 'gcash-payment-proof.jpg',
    items:[itemFrom(slug)], totalPhp:total, status, createdAt:new Date(now-days*86400000).toISOString(),
  })
  return [
    order(`${BRAND_CONFIG.shortCode}-2026-1842`,'Mariel Santos','0917 482 0193','mariel.santos@gmail.com','Lahug, Cebu City, Cebu','gcash','pending','maharlica-automatic-watch',214900,0),
    order(`${BRAND_CONFIG.shortCode}-2026-1837`,'Gabriel Tan','0918 337 5521','gabriel.tan@yahoo.com','Bonifacio Global City, Taguig, Metro Manila','bank_transfer','verified','sampaguita-diamond-ring',28900,1),
    order(`${BRAND_CONFIG.shortCode}-2026-1831`,'Alyssa Reyes','0995 221 7408','alyssa.reyes@gmail.com','Mandaue City, Cebu','gcash','shipped','intramuros-tennis-bracelet',68500,2),
    order(`${BRAND_CONFIG.shortCode}-2026-1826`,'Kristine Lim','0917 659 0834','kristine.lim@gmail.com','Davao City, Davao del Sur','cod','completed','palawan-pearl-pendant',36500,4),
    order(`${BRAND_CONFIG.shortCode}-2026-1819`,'Miguel Villanueva','0927 410 6632','miguel.villanueva@gmail.com','Ayala, Makati, Metro Manila','bank_transfer','completed','solid-hinged-saudi-bangle',124900,6),
  ]
}

function canUseLocalStorage(): boolean {
  return typeof globalThis !== 'undefined' && 'localStorage' in globalThis
}

export function generateOrderReference(): string {
  const year = new Date().getFullYear()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${BRAND_CONFIG.shortCode}-${year}-${suffix}`
}

export function saveOrder(order: Order): void {
  if (!canUseLocalStorage()) return
  const existing = getOrders()
  globalThis.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...existing]))
}

export function getOrders(): Order[] {
  if (!canUseLocalStorage()) return []
  try {
    const stored = globalThis.localStorage.getItem(ORDERS_KEY)
    if (stored) return JSON.parse(stored) as Order[]
    if (!globalThis.localStorage.getItem(DEMO_ORDERS_KEY)) {
      const demo = getDemoOrders()
      globalThis.localStorage.setItem(ORDERS_KEY, JSON.stringify(demo))
      globalThis.localStorage.setItem(DEMO_ORDERS_KEY, '1')
      return demo
    }
    return []
  } catch {
    return []
  }
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order[] {
  if (!canUseLocalStorage()) return []
  const updated = getOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order,
  )
  globalThis.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
  return updated
}

export function resetDemoOrders(): void {
  if (!canUseLocalStorage()) return
  globalThis.localStorage.setItem(ORDERS_KEY, JSON.stringify(getDemoOrders()))
  globalThis.localStorage.setItem(DEMO_ORDERS_KEY, '1')
}
