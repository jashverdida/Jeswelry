import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Catalog } from './pages/Catalog'
import { ProductDetail } from './pages/ProductDetail'
import { Checkout } from './pages/Checkout'
import { Admin } from './pages/Admin'
import { Login } from './pages/Login'
import { Account } from './pages/Account'
import { SlideOutCart } from './components/layout/SlideOutCart'
import { useCartStore } from './store/useCartStore'
import { Toast } from './components/ui/Toast'

function SharedLayout() {
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar onCartOpen={openCart} />
      <Outlet />
      <Footer />
      <SlideOutCart open={isCartOpen} onClose={closeCart} />
      <Toast />
    </div>
  )
}

function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-24 text-center md:px-8 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">{title}</p>
      <h1 className="mt-3 font-heading text-5xl text-charcoal">Coming Soon</h1>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SharedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
