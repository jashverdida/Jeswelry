import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getOrders } from '../services/orderService'
import { formatPhp } from '../services/productService'
import type { Order } from '../types/jewelry'
import { useWishlistStore } from '../store/useWishlistStore'
import { getProducts } from '../services/productService'
import { TrackOrderDrawer } from '../components/layout/TrackOrderDrawer'
import { Link } from 'react-router-dom'
import { BRAND_CONFIG } from '../config/brand.config'

type AccountTab = 'purchases' | 'profile' | 'addresses' | 'wishlist'
type PurchaseFilter = 'all' | Order['status']

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pending',
  verified: 'Verified',
  shipped: 'Shipped',
  completed: 'Completed',
}

export function Account() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const tab: AccountTab =
    requestedTab === 'profile' || requestedTab === 'addresses' || requestedTab === 'wishlist' ? requestedTab : 'purchases'
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseFilter>('all')
  const currentUser = useAuthStore((state) => state.currentUser)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [orders, setOrders] = useState<Order[]>([])
  const [saved, setSaved] = useState(false)
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState('')
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null)
  const [wishlistProducts, setWishlistProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([])
  const wishlistIds = useWishlistStore((state) => state.productIds)
  const toggleWishlist = useWishlistStore((state) => state.toggle)

  useEffect(() => {
    if (!currentUser) return
    setOrders(getOrders().filter((order) =>
      order.userId === currentUser.id ||
      order.customerEmail.toLowerCase() === currentUser.email.toLowerCase(),
    ))
  }, [currentUser])

  useEffect(() => {
    getProducts().then((products) => setWishlistProducts(products.filter((product) => wishlistIds.includes(product.id))))
  }, [wishlistIds])

  if (!currentUser || currentUser.role !== 'customer') return <Navigate to="/login" replace />

  const setTab = (nextTab: AccountTab) => {
    setSearchParams({ tab: nextTab })
  }

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    updateProfile({
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
    })
    setSaved(true)
  }

  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    updateProfile({
      deliveryAddress: [
        String(form.get('street') ?? '').trim(),
        String(form.get('barangay') ?? '').trim(),
        String(form.get('city') ?? '').trim(),
        String(form.get('province') ?? '').trim(),
      ].filter(Boolean).join(', '),
    })
    setSaved(true)
  }

  const filteredOrders = purchaseFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === purchaseFilter)

  const addressParts = currentUser.deliveryAddress?.split(',').map((part) => part.trim()) ?? []

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-10 md:px-8 md:py-12 lg:px-12">
      <header className="border-b border-stone-200 pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">My Account</p>
        <h1 className="mt-2 font-heading text-5xl text-charcoal md:text-6xl">{currentUser.name}</h1>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-stone-200 pr-6 lg:block">
          {([
            ['purchases', 'My Purchases'],
            ['profile', 'My Profile'],
            ['addresses', 'Saved Addresses'],
            ['wishlist', 'Saved Wishlist'],
          ] as [AccountTab, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`block w-full border-l-2 px-4 py-3 text-left text-sm ${
                tab === value ? 'border-champagne bg-[#F4EFE7] text-charcoal' : 'border-transparent text-stone-500 hover:text-charcoal'
              }`}
            >
              {label}
            </button>
          ))}
        </aside>

        <nav className="-mx-5 flex overflow-x-auto border-b border-stone-200 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden" aria-label="Account sections">
          {([
            ['purchases', 'My Purchases'],
            ['profile', 'My Profile'],
            ['addresses', 'Saved Addresses'],
            ['wishlist', 'Saved Wishlist'],
          ] as [AccountTab, string][]).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`shrink-0 border-b-2 px-4 pb-3 text-xs ${tab === value ? 'border-champagne text-charcoal' : 'border-transparent text-stone-500'}`}>
              {label}
            </button>
          ))}
        </nav>

        <section className="min-w-0">
          {tab === 'purchases' && (
            <>
              <nav className="-mx-5 flex overflow-x-auto border-b border-[#141312]/12 px-5 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Purchase status">
                {([
                  ['all', 'All'], ['pending', 'To Verify'], ['verified', 'To Ship'], ['shipped', 'In Transit'], ['completed', 'Completed'],
                ] as [PurchaseFilter, string][]).map(([filter, label]) => {
                  const count = filter === 'all' ? orders.length : orders.filter((order) => order.status === filter).length
                  return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setPurchaseFilter(filter)}
                    className={`min-h-[48px] shrink-0 border-b-2 px-4 text-xs font-medium ${
                      purchaseFilter === filter ? 'border-[#141312] text-[#141312]' : 'border-transparent text-stone-500'
                    }`}
                  >
                    {label}{count > 0 && <span className="ml-2 font-mono text-[9px] text-[#181615]">{String(count).padStart(2, '0')}</span>}
                  </button>
                  )
                })}
              </nav>

              {filteredOrders.length === 0 ? (
                <div className="mt-10 border-y border-[#141312]/12 py-20 text-center">
                  <p className="font-heading text-4xl text-[#141312]">No acquisitions in this collection.</p>
                  <p className="mt-3 text-xs text-stone-500">Discover pieces for your considered wardrobe.</p>
                  <Link to="/catalog" className="mt-7 inline-block min-h-[44px] bg-[#141312] px-7 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#FBF9F5]">
                    Explore the Collection
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {filteredOrders.map((order) => (
                    <article key={order.id} className="border border-[#141312]/12 bg-[#FBF9F5]">
                      <div className="flex items-start justify-between border-b border-[#141312]/12 px-5 py-4">
                        <div>
                          <p className="font-mono text-[11px] text-[#A68246]">{order.id}</p>
                          <p className="mt-1 text-xs text-stone-500">Placed {new Date(order.createdAt).toLocaleDateString('en-PH')}</p>
                        </div>
                        <p className={`text-[10px] uppercase tracking-[0.12em] ${order.status === 'pending' ? 'text-[#B45309]' : order.status === 'verified' ? 'text-[#15803D]' : 'text-[#141312]'}`}>
                          ● {statusLabels[order.status]}
                        </p>
                      </div>
                      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                        {order.items.map((item) => (
                          <div key={item.variantId} className="grid grid-cols-[64px_1fr] gap-4">
                            <img src={item.image} alt="" className="h-20 w-16 object-cover" />
                            <div>
                              <p className="font-heading text-xl leading-tight text-charcoal">{item.productName}</p>
                              <p className="mt-2 text-[10px] text-stone-500">{item.purity} • {item.weightGrams}g · Qty {item.quantity}</p>
                              <p className="mt-2 font-heading text-lg text-[#141312]">{formatPhp(item.unitPricePhp * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-4 border-t border-[#141312]/12 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-stone-500">Total Paid</p>
                          <p className="mt-1 font-heading text-2xl text-[#141312]">{formatPhp(order.totalPhp)}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {order.paymentMethod === 'gcash' ? 'GCash QR' : order.paymentMethod === 'bank_transfer' ? 'InstaPay QR' : 'COD'}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => { setTrackingOrderId(order.id); setTrackingOpen(true) }} className="min-h-[44px] border border-[#141312] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#141312]">Track Delivery</button>
                          <button type="button" onClick={() => setReceiptOrder(order)} className="min-h-[44px] bg-[#141312] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FBF9F5]">View Receipt</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'wishlist' && (
            <>
              <h2 className="font-heading text-4xl text-charcoal">Saved Wishlist</h2>
              {wishlistProducts.length === 0 ? (
                <div className="mt-5 border border-stone-200 py-16 text-center">
                  <p className="font-heading text-3xl text-charcoal">No saved pieces</p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {wishlistProducts.map((product) => (
                    <article key={product.id}>
                      <Link to={`/product/${product.slug}`} className="block aspect-[4/5] overflow-hidden bg-stone-100">
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      </Link>
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <Link to={`/product/${product.slug}`} className="font-heading text-xl text-charcoal">{product.name}</Link>
                        <button type="button" onClick={() => toggleWishlist(product.id)} className="text-xs text-[#B4925A]" aria-label={`Remove ${product.name}`}>Remove</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="max-w-xl">
              <h2 className="font-heading text-4xl text-charcoal">My Profile</h2>
              <div className="mt-5 space-y-4">
                <label className="block text-xs text-charcoal">Full Name
                  <input name="name" defaultValue={currentUser.name} required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
                <label className="block text-xs text-charcoal">Email Address
                  <input name="email" defaultValue={currentUser.email} required type="email" className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
                <label className="block text-xs text-charcoal">Mobile Number
                  <input name="phone" defaultValue={currentUser.phone} required type="tel" className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
                {saved && <p className="text-xs text-green-700">Changes saved.</p>}
                <button type="submit" className="bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Save Profile</button>
              </div>
            </form>
          )}

          {tab === 'addresses' && (
            <form onSubmit={saveAddress} className="max-w-xl">
              <h2 className="font-heading text-4xl text-charcoal">Saved Addresses</h2>
              <p className="mt-2 text-sm text-stone-500">Used as the default {BRAND_CONFIG.city} delivery address.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block text-xs text-charcoal md:col-span-2">Street / House Address
                  <input name="street" defaultValue={addressParts[0] ?? ''} required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
                <label className="block text-xs text-charcoal">Barangay
                  <input name="barangay" defaultValue={addressParts[1] ?? ''} required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
                <label className="block text-xs text-charcoal">City
                  <input name="city" defaultValue={addressParts[2] ?? ''} required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
                <label className="block text-xs text-charcoal md:col-span-2">Province
                  <input name="province" defaultValue={addressParts[3] ?? ''} required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm" />
                </label>
              </div>
              {saved && <p className="mt-4 text-xs text-green-700">Address saved.</p>}
              <button type="submit" className="mt-5 bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Save Address</button>
            </form>
          )}
        </section>
      </div>
      <TrackOrderDrawer open={trackingOpen} onClose={() => setTrackingOpen(false)} initialOrderId={trackingOrderId} />
      {receiptOrder && (
        <>
          <button type="button" className="fixed inset-0 z-[80] bg-[#141312]/35" onClick={() => setReceiptOrder(null)} aria-label="Close receipt" />
          <aside className="fixed bottom-0 right-0 top-0 z-[90] w-full max-w-md overflow-y-auto bg-[#FBF9F5] p-6">
            <div className="flex items-center justify-between border-b border-[#141312]/12 pb-5">
              <div><p className="text-[10px] uppercase tracking-[0.16em] text-[#A68246]">{BRAND_CONFIG.name} Receipt</p><p className="mt-1 font-mono text-sm text-[#141312]">{receiptOrder.id}</p></div>
              <button type="button" onClick={() => setReceiptOrder(null)} className="min-h-[44px] min-w-[44px] text-[#141312]">×</button>
            </div>
            <div className="mt-6 space-y-4">
              {receiptOrder.items.map((item) => (
                <div key={item.variantId} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-[#141312]/12 pb-4">
                  <img src={item.image} alt="" className="h-20 w-16 object-cover" />
                  <div><p className="font-heading text-lg text-[#141312]">{item.productName}</p><p className="mt-1 text-[10px] text-stone-500">{item.purity} • {item.weightGrams}g · Qty {item.quantity}</p></div>
                  <p className="font-heading text-lg">{formatPhp(item.unitPricePhp * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-[#141312]/12 pt-5">
              <div className="flex justify-between text-xs"><span className="text-stone-500">Payment</span><span>{receiptOrder.paymentMethod === 'gcash' ? 'GCash QR' : receiptOrder.paymentMethod === 'bank_transfer' ? 'InstaPay QR' : 'COD'}</span></div>
              <div className="mt-4 flex justify-between"><span className="text-sm text-stone-500">Total Paid</span><strong className="font-heading text-3xl text-[#141312]">{formatPhp(receiptOrder.totalPhp)}</strong></div>
            </div>
          </aside>
        </>
      )}
    </main>
  )
}
