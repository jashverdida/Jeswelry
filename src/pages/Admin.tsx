import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, CreditCard, Search, Plus, Minus, X, Menu } from 'lucide-react'
import type { GoldPurity, JewelryCategory, Order, Product } from '../types/jewelry'
import { createProduct, getProducts, resetDemoData, updateProduct, formatPhp } from '../services/productService'
import { getOrders, resetDemoOrders, updateOrderStatus } from '../services/orderService'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import { BrandLogo } from '../components/ui/BrandLogo'
import { QRCodeSVG } from 'qrcode.react'
import { getPaymentSettings, savePaymentSettings, type PaymentSettings } from '../services/paymentSettingsService'
import { BRAND_CONFIG } from '../config/brand.config'

type Tab = 'overview' | 'orders' | 'products' | 'payments'
type Filter = 'all' | Order['status']

function Status({ status }: { status:Order['status'] }) {
  const styles = { pending:'bg-amber-100 text-amber-800', verified:'bg-emerald-100 text-emerald-800', shipped:'bg-slate-200 text-slate-700', completed:'bg-[#181615] text-[#E6C78E]' }
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${styles[status]}`}>{status}</span>
}

export function Admin() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const showToast = useToastStore((state) => state.show)
  const [tab, setTab] = useState<Tab>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orderFilter, setOrderFilter] = useState<Filter>('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderSort, setOrderSort] = useState<'newest' | 'value'>('newest')
  const [productSearch, setProductSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }
    setOrders(getOrders())
    getProducts().then(setProducts)
  }, [currentUser, navigate])

  if (!currentUser || currentUser.role !== 'admin') return null

  const refreshProducts = () => getProducts().then(setProducts)
  const reset = () => {
    resetDemoData()
    resetDemoOrders()
    setOrders(getOrders())
    refreshProducts()
  }
  const adjustStock = async (product: Product, variantId: string, delta: number) => {
    await updateProduct({ ...product, variants: product.variants.map((variant) => variant.id === variantId ? { ...variant, stockCount: Math.max(0, variant.stockCount + delta) } : variant) })
    await refreshProducts()
  }
  const changeStatus = (id: string, status: Order['status']) => {
    const updated = updateOrderStatus(id, status)
    setOrders(updated)
    setSelectedOrder((current) => current?.id === id ? updated.find((order) => order.id === id) ?? null : current)
    showToast('Order Status Updated')
  }
  const revenueOrders = orders.filter((order) => ['verified', 'shipped', 'completed'].includes(order.status))
  const revenue = revenueOrders.reduce((sum, order) => sum + order.totalPhp, 0)
  const pending = orders.filter((order) => order.status === 'pending').length

  const nav: [Tab, string, typeof LayoutDashboard][] = [
    ['overview', 'Executive Overview', LayoutDashboard],
    ['orders', 'Orders', ShoppingBag],
    ['products', 'Catalog & Inventory', Package],
    ['payments', 'Payment & QR Settings', CreditCard],
  ]

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#181615] px-5 py-6 text-[#FAF8F5]">
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" dark />
          <p className="font-heading text-[19px] tracking-[0.16em]">{BRAND_CONFIG.name.toUpperCase()}</p>
        </div>
        <span className="mt-3 inline-block border border-[#A68246]/60 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[#A68246]">Atelier Admin</span>
      </div>
      <nav className="mt-6 space-y-1">
        {nav.map(([value, label, Icon]) => (
          <button key={value} type="button" onClick={() => { setSelectedOrder(null); setDrawerOpen(false); setMobileOpen(false); setTab(value) }} className={`flex w-54 items-center gap-3 px-3 py-3 text-left text-sm ${tab === value ? 'border-l-2 border-[#A68246] bg-white/5 text-white' : 'text-stone-400 hover:text-white'}`}>
            <Icon size={16} />
            <span>{label}</span>
            {value === 'orders' && pending > 0 && <span className="ml-auto grid size-5 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-[#181615]">{pending}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
        <a href="/" target="_blank" rel="noreferrer" className="block text-xs text-stone-300 hover:text-[#A68246]">View Live Store ↗</a>
        <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }} className="text-xs text-stone-400 hover:text-white">Log Out</button>
      </div>
    </aside>
  )

  const filteredOrders = orders.filter((order) => {
    const status = orderFilter === 'all' || order.status === orderFilter
    const query = orderSearch.toLowerCase()
    return status && (!query ||
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.items.some((item) => item.productName.toLowerCase().includes(query)))
  }).sort((a, b) => orderSort === 'value' ? b.totalPhp - a.totalPhp : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <main className="h-screen overflow-hidden bg-[#F6F4F0] md:flex">
      <div className="hidden md:block">{Sidebar}</div>
      <button type="button" onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 grid size-10 place-items-center bg-[#181615] text-white md:hidden"><Menu size={18} /></button>
      {mobileOpen && <><button type="button" className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} /><div className="fixed bottom-0 left-0 top-0 z-[60]">{Sidebar}</div></>}

      <div className={`min-w-0 flex-1 px-5 md:px-8 lg:px-10 ${
        tab === 'products'
          ? 'h-screen overflow-hidden pt-6 pb-5 flex flex-col'
          : 'overflow-y-auto pt-8 pb-8'
      }`}>
        {tab === 'overview' && (
          <section>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-heading text-4xl text-[#181615] sm:text-5xl">Executive Overview</h1>
              <div className="flex gap-3">
                <button type="button" onClick={reset} className="min-h-[44px] border border-stone-300 bg-white px-4 text-xs font-semibold text-stone-600">Reset Demo Data</button>
                <button type="button" onClick={() => { setTab('products'); setEditing(null); setDrawerOpen(true) }} className="flex min-h-[44px] items-center gap-2 bg-[#181615] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[#FAF8F5]"><Plus size={15} /> New Piece</button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 divide-y border border-[#141312]/12 bg-white divide-[#141312]/12 md:grid-cols-3 md:divide-x md:divide-y-0">
              <article className="px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Gross Sales</p>
                <p className="mt-4 font-heading text-4xl text-[#181615]">{formatPhp(revenue)}</p>
              </article>
              <article className="px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Pending Orders</p>
                <p className="mt-4 font-heading text-4xl text-[#181615]">{pending}</p>
                <button type="button" onClick={() => setTab('orders')} className="mt-3 border-b border-[#141312] pb-1 text-xs font-semibold text-[#141312]">View Orders →</button>
              </article>
              <article className="px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Active Catalog</p>
                <p className="mt-4 font-heading text-4xl text-[#181615]">{products.length}</p>
                <button type="button" onClick={() => setTab('products')} className="mt-3 border-b border-[#141312] pb-1 text-xs font-semibold text-[#141312]">Manage Inventory →</button>
              </article>
            </div>

            <article className="mt-6 border border-[#141312]/12 bg-white">
              <div className="flex items-center justify-between border-b border-[#141312]/12 px-5 py-4">
                <h2 className="font-heading text-2xl text-[#181615]">Recent Orders</h2>
                <button type="button" onClick={() => setTab('orders')} className="border-b border-[#141312] pb-1 text-xs font-semibold text-[#141312]">View All Orders →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="border-b border-stone-100 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                    <tr><th className="px-5 py-3">Order ID</th><th>Client</th><th>Piece(s)</th><th>Payment</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0,5).map((order) => (
                      <tr key={order.id} className="border-b border-stone-100 last:border-0">
                        <td className="px-5 py-4 font-mono text-[11px] font-semibold text-[#A68246]">{order.id}</td>
                        <td className="py-4 font-medium text-[#181615]">{order.customerName}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            {order.items.slice(0,2).map((item) => <img key={item.variantId} src={item.image} alt="" className="size-9 rounded object-cover" />)}
                            <span className="max-w-[160px] truncate text-stone-600">{order.items.map((item) => item.productName).join(', ')}</span>
                          </div>
                        </td>
                        <td className="py-4 text-stone-600">{order.paymentMethod === 'gcash' ? 'GCash QR' : order.paymentMethod === 'bank_transfer' ? 'InstaPay QR' : 'COD'}</td>
                        <td className="py-4 font-semibold text-[#181615]">{formatPhp(order.totalPhp)}</td>
                        <td className="py-4"><Status status={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}
        {tab === 'orders' && <OrdersView orders={filteredOrders} allOrders={orders} orderFilter={orderFilter} setOrderFilter={setOrderFilter} orderSearch={orderSearch} setOrderSearch={setOrderSearch} orderSort={orderSort} setOrderSort={setOrderSort} selectedOrder={selectedOrder} onSelect={setSelectedOrder} onStatus={changeStatus} />}
        {tab === 'products' && <ProductsView products={products} productSearch={productSearch} setProductSearch={setProductSearch} adjustStock={adjustStock} toggleFeatured={async (product) => { await updateProduct({...product,featured:!product.featured}); refreshProducts() }} openDrawer={(product) => { setEditing(product ?? null); setDrawerOpen(true) }} />}
        {tab === 'payments' && <PaymentSettings />}
      </div>
      {drawerOpen && <ProductDrawer product={editing} onClose={() => setDrawerOpen(false)} onSaved={async () => { await refreshProducts(); setDrawerOpen(false); showToast(editing ? 'Product Updated' : 'Product Added') }} />}
    </main>
  )
}

function OrdersView({ orders, allOrders, orderFilter, setOrderFilter, orderSearch, setOrderSearch, orderSort, setOrderSort, selectedOrder, onSelect, onStatus }: {
  orders:Order[]; allOrders:Order[]; orderFilter:Filter; setOrderFilter:(value:Filter)=>void; orderSearch:string; setOrderSearch:(value:string)=>void; orderSort:'newest'|'value'; setOrderSort:(value:'newest'|'value')=>void; selectedOrder:Order|null; onSelect:(order:Order)=>void; onStatus:(id:string,status:Order['status'])=>void
}) {
  const [mobileDossier, setMobileDossier] = useState(false)
  const counts: Record<Filter, number> = {
    all:allOrders.length,
    pending:allOrders.filter((order)=>order.status==='pending').length,
    verified:allOrders.filter((order)=>order.status==='verified').length,
    shipped:allOrders.filter((order)=>order.status==='shipped').length,
    completed:allOrders.filter((order)=>order.status==='completed').length,
  }
  const tabs:[Filter,string][]=[['all','All'],['pending','To Verify'],['verified','To Dispatch'],['shipped','In Transit'],['completed','Delivered']]

  const advance = (order:Order) => {
    if (order.status==='pending') onStatus(order.id,'verified')
    else if (order.status==='verified') onStatus(order.id,'shipped')
    else if (order.status==='shipped') onStatus(order.id,'completed')
  }

  return (
    <section>
      <h1 className="font-heading text-4xl text-[#181615]">Orders</h1>
      <div className="mt-5 flex flex-col gap-3 border-b border-[#141312]/12 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(([filter,label]) => (
            <button key={filter} type="button" onClick={()=>setOrderFilter(filter)} className={`min-h-[52px] shrink-0 border-b-2 px-4 text-sm font-medium ${orderFilter===filter?'border-[#141312] text-[#141312]':'border-transparent text-stone-500'}`}>
              {label} ({counts[filter]})
            </button>
          ))}
        </div>
        <div className="mb-2 flex gap-3">
          <select value={orderSort} onChange={(event)=>setOrderSort(event.target.value as 'newest'|'value')} className="min-h-[44px] border-b border-[#141312]/20 bg-transparent px-2 text-xs text-[#141312]" aria-label="Sort orders"><option value="newest">Newest First</option><option value="value">Highest Value</option></select>
          <label className="flex min-h-[44px] items-center border-b border-[#141312]/20 px-1 lg:w-72"><input value={orderSearch} onChange={(event)=>setOrderSearch(event.target.value)} placeholder="Search order ID, client, or piece..." className="w-full bg-transparent text-xs outline-none"/></label>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-8 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {orders.map((order) => {
            const item=order.items[0]
            const city=order.deliveryAddress?.split(',').slice(-2).join(', ').trim() || BRAND_CONFIG.contacts.pickupAddress
            const actionLabel=order.status==='pending'?'Verify Payment':order.status==='verified'?'Mark Dispatched':order.status==='shipped'?'Mark Delivered':''
            return (
              <button key={order.id} type="button" onClick={()=>{onSelect(order);setMobileDossier(true)}} className={`grid w-full grid-cols-[56px_1fr] gap-4 border-b border-[#141312]/12 px-2 py-5 text-left sm:grid-cols-[56px_1fr_130px] ${selectedOrder?.id===order.id?'border-l-2 border-l-[#A68246] bg-white':'border-l-2 border-l-transparent bg-[#FBF9F5]'}`}>
                {item?.image?<img src={item.image} alt="" className="h-[68px] w-14 border border-[#141312]/10 object-cover"/>:<div className="h-[68px] w-14 border border-[#141312]/10 bg-[#EFECE6]"/>}
                <div className="min-w-0">
                  <p className="text-base font-medium text-[#141312]">{item?.productName ?? 'Jewelry piece'}{order.items.length>1?` • +${order.items.length-1} more`:''}</p>
                  <p className="mt-1 text-sm text-[#141312]/70">{order.customerName} · {city}</p>
                  <p className="mt-1 font-mono text-xs tracking-wider text-[#141312]/60">{order.id}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-heading text-xl font-semibold text-[#141312]">{formatPhp(order.totalPhp)}</p>
                  <p className="mt-1 text-xs text-[#141312]/70">{order.paymentMethod==='gcash'?'GCash QR':order.paymentMethod==='bank_transfer'?'InstaPay QR':'COD'}</p>
                  {actionLabel ? <button type="button" onClick={(event)=>{event.preventDefault();event.stopPropagation();advance(order)}} className="mt-3 inline-block border border-[#141312] px-3 py-2 text-xs font-medium text-[#141312]">{actionLabel}</button> : <span className="mt-3 inline-block text-xs text-stone-500">Delivered</span>}
                </div>
              </button>
            )
          })}
          {orders.length===0&&<div className="py-20 text-center font-heading text-3xl">No matching acquisitions</div>}
        </div>
        <CleanDossier order={selectedOrder} onStatus={onStatus}/>
        {mobileDossier&&<CleanDossier order={selectedOrder} onStatus={onStatus} mobile onClose={()=>setMobileDossier(false)}/>}
      </div>
    </section>
  )
}

function CleanDossier({ order, onStatus, mobile=false, onClose }: {order:Order|null;onStatus:(id:string,status:Order['status'])=>void;mobile?:boolean;onClose?:()=>void}) {
  if (!order) return mobile ? null : <aside className="hidden lg:col-span-5 lg:block"><div className="sticky top-8 border border-[#141312]/12 p-8 text-center font-heading text-2xl text-stone-400">Select an order dossier</div></aside>
  const [copiedReference, setCopiedReference] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  useEffect(() => {
    setCopiedReference(false)
    setCopiedAddress(false)
  }, [order.id])
  const stages=['Placed','Verified','Dispatched','Delivered']
  const active=order.status==='pending'?0:order.status==='verified'?1:order.status==='shipped'?2:3
  const advance=()=>{if(order.status==='pending')onStatus(order.id,'verified');else if(order.status==='verified')onStatus(order.id,'shipped');else if(order.status==='shipped')onStatus(order.id,'completed')}
  const action=order.status==='pending'?'Verify Payment':order.status==='verified'?'Dispatch Order':order.status==='shipped'?'Complete Delivery':''
  const content=(
    <div className="divide-y divide-[#141312]/10 border border-[#141312]/12 bg-[#FBF9F5]">
      <header className="p-5">
        <p className="font-mono text-sm text-[#141312]">{order.id}</p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          {stages.map((stage,index)=><span key={stage} className={`pb-1 ${index===active?'border-b-2 border-[#A68246] font-semibold text-[#141312]':'text-stone-400'}`}>{index>0?' — ':''}{stage}</span>)}
        </div>
      </header>
      <section className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Payment Proof</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          {order.paymentProofPreview?<img src={order.paymentProofPreview} alt="Payment proof" className="h-20 w-20 border border-[#141312]/10 object-cover"/>:<p className="text-sm text-stone-500">{order.paymentMethod==='cod'?'Cash on Delivery':`${order.paymentMethod==='gcash'?'GCash QR':'InstaPay QR'} Payment`}</p>}
          <div className="text-right">
            <p className="text-[10px] text-stone-500">Reference</p>
            <p className="mt-1 text-sm">{order.paymentReference||'Not provided'}</p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(order.paymentReference || '')
                setCopiedReference(true)
                window.setTimeout(() => setCopiedReference(false), 1600)
              }}
              className={`mt-2 min-h-[36px] min-w-[64px] border border-[#141312] px-3 text-[10px] font-semibold transition-all duration-200 hover:bg-[#141312] hover:text-white active:scale-[0.96] ${copiedReference ? 'bg-[#141312] text-white' : 'bg-transparent text-[#141312]'}`}
            >
              {copiedReference ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>
      <section className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Item Manifest</p>
        <div className="mt-4 space-y-4">{order.items.map((item)=><div key={item.variantId} className="grid grid-cols-[56px_1fr_auto] gap-3"><img src={item.image} alt="" className="h-[68px] w-14 object-cover"/><div><p className="font-heading text-lg">{item.productName}</p><p className="mt-1 text-[10px] text-stone-500">{item.purity} • {item.weightGrams}g · Qty {item.quantity}</p></div><p className="font-heading text-lg">{formatPhp(item.unitPricePhp*item.quantity)}</p></div>)}</div>
      </section>
      <section className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Client & Address</p>
        <div className="mt-4 space-y-1 text-sm"><p className="font-medium">{order.customerName}</p><p className="text-stone-500">{order.customerPhone}</p><p className="text-stone-500">{order.customerEmail}</p><p className="pt-2 text-stone-600">{order.deliveryAddress||BRAND_CONFIG.contacts.pickupAddress}</p></div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard?.writeText([order.customerName, order.customerPhone, order.deliveryAddress].filter(Boolean).join('\n'))
            setCopiedAddress(true)
            window.setTimeout(() => setCopiedAddress(false), 1600)
          }}
          className={`mt-4 min-h-[44px] border border-[#141312] px-4 text-[10px] font-semibold transition-all duration-200 hover:bg-[#141312] hover:text-white active:scale-[0.98] ${copiedAddress ? 'bg-[#141312] text-white' : 'bg-transparent text-[#141312]'}`}
        >
          {copiedAddress ? 'Address Copied' : 'Copy Address'}
        </button>
        {action&&<button type="button" onClick={(event)=>{event.stopPropagation();advance()}} className="mt-5 min-h-[48px] w-full bg-[#141312] text-xs font-semibold text-white">{action}</button>}
      </section>
    </div>
  )
  return mobile?<><button type="button" onClick={onClose} className="fixed inset-0 z-[80] bg-[#141312]/35 lg:hidden" aria-label="Close dossier"/><aside className="fixed bottom-0 right-0 top-0 z-[90] w-full max-w-md overflow-y-auto bg-[#FBF9F5] p-5 lg:hidden">
    <button type="button" onClick={onClose} className="mb-3 ml-auto block min-h-[44px] min-w-[44px] text-xl text-[#141312]" aria-label="Close dossier">×</button>
    {content}
  </aside></>:<aside className="lg:col-span-5"><div className="sticky top-8 max-h-[calc(100vh-64px)] overflow-y-auto">{content}</div></aside>
}

function ProductsView({ products, productSearch, setProductSearch, adjustStock, toggleFeatured, openDrawer }: {
  products:Product[]; productSearch:string; setProductSearch:(value:string)=>void; adjustStock:(product:Product,variantId:string,delta:number)=>Promise<void>; toggleFeatured:(product:Product)=>Promise<void>; openDrawer:(product?:Product)=>void
}) {
  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const tableRef = useRef<HTMLDivElement>(null)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  useEffect(() => {
    setCurrentPage(1)
    tableRef.current?.scrollTo({ top: 0 })
  }, [productSearch, categoryFilter])

  useEffect(() => {
    tableRef.current?.scrollTo({ top: 0 })
  }, [currentPage])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const changePage = (page: number) => {
    setCurrentPage(page)
    tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)

  const pageNumbers = totalPages <= 4
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : currentPage === 1
      ? [1, 2, '...', totalPages]
      : currentPage === totalPages
        ? [1, '...', totalPages - 1, totalPages]
        : [1, '...', currentPage, '...', totalPages]

  return (
    <section className="h-full flex flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h1 className="font-heading text-3xl text-[#181615] sm:text-4xl">Catalog & Inventory</h1>
        <button type="button" onClick={()=>openDrawer()} className="flex min-h-[44px] shrink-0 items-center gap-2 bg-[#A68246] px-4 py-3 text-xs font-bold text-[#181615]"><Plus size={14}/>Add Piece</button>
      </div>
      <div className="mt-4 flex shrink-0 flex-wrap items-end gap-3">
        <label className="flex min-h-[44px] min-w-0 flex-1 items-center gap-2 border border-stone-300 bg-white px-3 md:max-w-sm">
          <Search size={15}/>
          <input value={productSearch} onChange={(event)=>setProductSearch(event.target.value)} placeholder="Search products" className="w-full py-2 text-xs outline-none"/>
        </label>
        <select value={categoryFilter} onChange={(event)=>setCategoryFilter(event.target.value)} className="min-h-[44px] border border-stone-300 bg-white px-3 text-xs text-[#181615]" aria-label="Filter inventory category">
          <option value="all">All Categories</option>
          {BRAND_CONFIG.categories.filter((category) => category.id !== 'all').map((category) => (
            <option key={category.id} value={category.id}>{category.label}</option>
          ))}
        </select>
      </div>
      <div ref={tableRef} className="mt-4 min-h-0 flex-1 overflow-auto border border-[#141312]/12 bg-white">
        <table className="w-full min-w-[640px] text-left">
          <thead className="sticky top-0 z-10 border-b border-stone-200 bg-[#FAF8F5] text-[10px] uppercase text-stone-500">
            <tr><th className="p-4">Product</th><th>Purity</th><th>Stock</th><th>Featured</th><th/></tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product)=>(
              <tr key={product.id} className="border-b border-stone-100">
                <td className="p-4"><div className="flex items-center gap-3"><img src={product.images[0]} alt="" className="size-12 object-cover"/><div><p className="text-sm font-semibold">{product.name}</p><p className="text-xs capitalize text-stone-500">{product.category}</p></div></div></td>
                <td className="text-xs">{[...new Set(product.variants.map((variant)=>variant.purity))].join(', ')}</td>
                <td>{product.variants.map((variant)=><div key={variant.id} className="flex items-center gap-2 py-1"><button type="button" onClick={()=>adjustStock(product,variant.id,-1)} className="grid size-7 place-items-center border"><Minus size={11}/></button><span className="w-7 text-center text-xs">{variant.stockCount}</span><button type="button" onClick={()=>adjustStock(product,variant.id,1)} className="grid size-7 place-items-center border"><Plus size={11}/></button></div>)}</td>
                <td><button type="button" onClick={()=>toggleFeatured(product)} className={`h-5 w-9 rounded-full p-0.5 ${product.featured?'bg-[#A68246]':'bg-stone-300'}`}><span className={`block size-4 rounded-full bg-white ${product.featured?'translate-x-4':''}`}/></button></td>
                <td className="pr-4"><button type="button" onClick={()=>openDrawer(product)} className="text-xs text-[#A68246]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-[#141312]/12 bg-white px-6 py-4">
        <p className="text-xs text-[#141312]/70">Showing {rangeStart}–{rangeEnd} of {filteredProducts.length} pieces</p>
        <div className="flex items-center gap-1">
          <button type="button" disabled={currentPage===1} onClick={()=>changePage(currentPage-1)} className="min-h-[36px] border border-[#141312]/15 px-3 text-xs disabled:opacity-35">Previous</button>
          {pageNumbers.map((page,index)=>page==='...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-xs text-stone-500">...</span>
          ) : (
            <button key={page} type="button" onClick={()=>changePage(Number(page))} className={`min-h-[36px] min-w-[36px] border text-xs ${currentPage===page?'border-[#141312] bg-[#141312] text-[#FAF8F5]':'border-[#141312]/15 hover:border-[#141312]'}`}>{page}</button>
          ))}
          <button type="button" disabled={currentPage===totalPages} onClick={()=>changePage(currentPage+1)} className="min-h-[36px] border border-[#141312]/15 px-3 text-xs disabled:opacity-35">Next</button>
        </div>
      </div>
    </section>
  )
}

function Switch({ checked, onChange }: { checked:boolean; onChange:(value:boolean)=>void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`h-6 w-11 rounded-full p-0.5 transition ${checked ? 'bg-[#A68246]' : 'bg-stone-300'}`}>
      <span className={`block size-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function QrUploader({ label, image, onUpload, onRemove }: { label:string; image?:string; onUpload:(file:File)=>void; onRemove:()=>void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {image && <img src={image} alt="" className="size-16 rounded border border-stone-200 object-contain" />}
      <label className="flex min-h-[44px] cursor-pointer items-center border border-dashed border-stone-400 px-4 text-xs text-[#181615]">
        {label}
        <input type="file" accept="image/*" className="hidden" onChange={(event) => onUpload(event.target.files?.[0] as File)} />
      </label>
      {image && <button type="button" onClick={onRemove} className="text-xs text-stone-500 underline">Remove / Use auto-generated QR</button>}
    </div>
  )
}

function PaymentSettings() {
  const showToast = useToastStore((state) => state.show)
  const [settings, setSettings] = useState<PaymentSettings>(getPaymentSettings)
  const [preview, setPreview] = useState<'gcash' | 'bank'>('gcash')

  const uploadQr = (channel: 'gcash' | 'bank', file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const image = String(reader.result ?? '')
      setSettings((current) => channel === 'gcash'
        ? { ...current, gcash: { ...current.gcash, customQrImage: image } }
        : { ...current, bank: { ...current.bank, customQrImage: image } })
    }
    reader.readAsDataURL(file)
  }

  const save = () => {
    savePaymentSettings(settings)
    showToast('Payment & QR settings updated')
  }

  const previewSettings = preview === 'gcash'
    ? { title:'GCash', name:settings.gcash.accountName, number:settings.gcash.mobileNumber, image:settings.gcash.customQrImage, payload:`${BRAND_CONFIG.shortCode}-GCASH | Account: ${settings.gcash.accountName} | Mobile: ${settings.gcash.mobileNumber}` }
    : { title:settings.bank.bankName, name:settings.bank.accountName, number:settings.bank.accountNumber, image:settings.bank.customQrImage, payload:`${BRAND_CONFIG.shortCode}-INSTAPAY | Bank: ${settings.bank.bankName} | Account: ${settings.bank.accountName} | Number: ${settings.bank.accountNumber}` }

  return (
    <section>
      <h1 className="font-heading text-4xl text-[#181615]">Payment & QR Settings</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <article className="border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4"><h2 className="font-heading text-2xl text-[#181615]">GCash Express</h2><Switch checked={settings.gcash.enabled} onChange={(enabled) => setSettings({ ...settings, gcash:{...settings.gcash,enabled} })} /></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-stone-600">Account Name<input value={settings.gcash.accountName} onChange={(event)=>setSettings({...settings,gcash:{...settings.gcash,accountName:event.target.value}})} className="mt-2 w-full border border-stone-300 px-3 py-3 text-sm text-[#181615]" /></label>
              <label className="text-xs text-stone-600">Mobile Number<input value={settings.gcash.mobileNumber} onChange={(event)=>setSettings({...settings,gcash:{...settings.gcash,mobileNumber:event.target.value}})} className="mt-2 w-full border border-stone-300 px-3 py-3 text-sm text-[#181615]" /></label>
            </div>
            <QrUploader label="Upload Official GCash QR Image" image={settings.gcash.customQrImage} onUpload={(file)=>uploadQr('gcash',file)} onRemove={()=>setSettings({...settings,gcash:{...settings.gcash,customQrImage:undefined}})} />
          </article>

          <article className="border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4"><h2 className="font-heading text-2xl text-[#181615]">Bank Transfer / InstaPay</h2><Switch checked={settings.bank.enabled} onChange={(enabled)=>setSettings({...settings,bank:{...settings.bank,enabled}})} /></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-stone-600">Bank Name<input value={settings.bank.bankName} onChange={(event)=>setSettings({...settings,bank:{...settings.bank,bankName:event.target.value}})} className="mt-2 w-full border border-stone-300 px-3 py-3 text-sm text-[#181615]" /></label>
              <label className="text-xs text-stone-600">Account Name<input value={settings.bank.accountName} onChange={(event)=>setSettings({...settings,bank:{...settings.bank,accountName:event.target.value}})} className="mt-2 w-full border border-stone-300 px-3 py-3 text-sm text-[#181615]" /></label>
              <label className="text-xs text-stone-600 sm:col-span-2">Account Number<input value={settings.bank.accountNumber} onChange={(event)=>setSettings({...settings,bank:{...settings.bank,accountNumber:event.target.value}})} className="mt-2 w-full border border-stone-300 px-3 py-3 text-sm text-[#181615]" /></label>
            </div>
            <QrUploader label="Upload Bank / InstaPay QR Image" image={settings.bank.customQrImage} onUpload={(file)=>uploadQr('bank',file)} onRemove={()=>setSettings({...settings,bank:{...settings.bank,customQrImage:undefined}})} />
          </article>

          <article className="border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4"><h2 className="font-heading text-2xl text-[#181615]">COD / {BRAND_CONFIG.contacts.pickupAddress}</h2><Switch checked={settings.cod.enabled} onChange={(enabled)=>setSettings({...settings,cod:{...settings.cod,enabled}})} /></div>
            <label className="mt-4 block text-xs text-stone-600">Delivery / Pickup Instructions<textarea value={settings.cod.instructions} onChange={(event)=>setSettings({...settings,cod:{...settings.cod,instructions:event.target.value}})} rows={3} className="mt-2 w-full border border-stone-300 px-3 py-3 text-sm text-[#181615]" /></label>
          </article>
          <button type="button" onClick={save} className="min-h-[44px] w-full bg-[#181615] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#FAF8F5]">Save Payment Settings</button>
        </div>

        <aside className="h-fit border border-stone-200 bg-[#F9F6F0] p-5 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A68246]">Live Checkout Preview</p>
            <div className="flex gap-1"><button type="button" onClick={()=>setPreview('gcash')} className={`px-2 py-1 text-[9px] ${preview==='gcash'?'bg-[#181615] text-white':'border border-stone-300'}`}>GCash</button><button type="button" onClick={()=>setPreview('bank')} className={`px-2 py-1 text-[9px] ${preview==='bank'?'bg-[#181615] text-white':'border border-stone-300'}`}>Bank QR</button></div>
          </div>
          <div className="mt-5 border border-[#181615] bg-white p-4">
            <p className="font-heading text-2xl text-[#181615]">{previewSettings.name}</p>
            <p className="mt-1 text-xs text-stone-500">{previewSettings.title}</p>
            <div className="mt-4 flex justify-center">{previewSettings.image ? <img src={previewSettings.image} alt={`${previewSettings.title} QR`} className="aspect-square w-48 object-contain" /> : <QRCodeSVG value={previewSettings.payload} size={192} level="M" bgColor="#FFFFFF" fgColor="#181615" />}</div>
            <p className="mt-3 text-center text-sm font-semibold text-[#181615]">{previewSettings.number}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function ProductDrawer({ product,onClose,onSaved }: {product:Product|null;onClose:()=>void;onSaved:()=>void}) {
  const first=product?.variants[0]
  const submit=async (event:FormEvent)=>{event.preventDefault();const form=new FormData(event.currentTarget as HTMLFormElement);const name=String(form.get('name')??'').trim();if(!name)return;const category=String(form.get('category')??'rings') as JewelryCategory;const purity=String(form.get('purity')??'18K') as GoldPurity;const weight=Number(form.get('weight'));const price=Number(form.get('price'));const stock=Number(form.get('stock'));const image=String(form.get('image')??'').trim();if(product){await updateProduct({...product,name,category,featured:form.get('featured')==='on',images:image?[image]:product.images,variants:product.variants.map((variant,index)=>index===0?{...variant,purity,weightGrams:weight,pricePhp:price,stockCount:stock,label:`${purity} • ${weight}g`}:variant)})}else{const id=`prod-${Date.now()}`;await createProduct({id,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name,category,description:String(form.get('description')??''),featured:form.get('featured')==='on',images:[image||'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85'],variants:[{id:`var-${Date.now()}`,label:`${purity} • ${weight}g`,purity,weightGrams:weight,pricePhp:price,stockCount:stock}],careInstructions:['Store in a soft jewelry pouch.','Clean with a mild jewelry cloth.']})}onSaved()}
  return (
    <>
      <button type="button" className="fixed inset-0 z-[80] bg-black/35" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[90] h-full w-full max-w-lg overflow-y-auto bg-[#F9F6F0] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-4xl">{product ? 'Edit Piece' : 'Add New Piece'}</h2>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs">Product Name
            <input name="name" defaultValue={product?.name ?? ''} required className="mt-2 w-full border border-stone-300 px-4 py-3" />
          </label>
          <label className="block text-xs">Category
            <select name="category" defaultValue={product?.category ?? 'rings'} className="mt-2 w-full border border-stone-300 px-4 py-3">
              {BRAND_CONFIG.categories.filter((category) => category.id !== 'all').map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs">Description
            <textarea name="description" defaultValue={product?.description ?? ''} rows={3} className="mt-2 w-full border border-stone-300 px-4 py-3" />
          </label>
          <label className="block text-xs">Image URL
            <input name="image" defaultValue={product?.images[0] ?? ''} className="mt-2 w-full border border-stone-300 px-4 py-3" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">{BRAND_CONFIG.attributeFilter.label}
              <select name="purity" defaultValue={first?.purity ?? '18K'} className="mt-2 w-full border border-stone-300 px-3 py-3">
                {BRAND_CONFIG.attributeFilter.options.filter((option) => option !== 'Automatic').map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">Weight (g)
              <input name="weight" type="number" step="0.1" defaultValue={first?.weightGrams ?? 1} className="mt-2 w-full border border-stone-300 px-3 py-3" />
            </label>
            <label className="text-xs">Price ({BRAND_CONFIG.currency.code})
              <input name="price" type="number" defaultValue={first?.pricePhp ?? 1000} className="mt-2 w-full border border-stone-300 px-3 py-3" />
            </label>
            <label className="text-xs">Stock
              <input name="stock" type="number" defaultValue={first?.stockCount ?? 1} className="mt-2 w-full border border-stone-300 px-3 py-3" />
            </label>
          </div>
          <label className="flex gap-2 text-xs"><input name="featured" type="checkbox" defaultChecked={product?.featured} />Featured</label>
          <button type="submit" className="w-full bg-[#181615] px-6 py-4 text-xs font-bold text-white">{product ? 'Save Changes' : 'Add Product'}</button>
        </form>
      </aside>
    </>
  )
}
