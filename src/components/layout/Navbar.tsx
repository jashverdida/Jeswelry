import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useWishlistStore } from '../../store/useWishlistStore'
import { getProducts, formatPhp } from '../../services/productService'
import type { Product } from '../../types/jewelry'
import { BrandLogo } from '../ui/BrandLogo'
import { BRAND_CONFIG } from '../../config/brand.config'

interface NavbarProps {
  onCartOpen: () => void
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Bespoke', to: '/catalog?category=custom' },
]

export function Navbar({ onCartOpen }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const wishlistCount = useWishlistStore((state) => state.productIds.length)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => { getProducts().then(setProducts) }, [])

  const matches = searchQuery.trim()
    ? products.filter((product) =>
        `${product.name} ${product.category} ${product.variants.map((variant) => `${variant.purity} ${variant.label}`).join(' ')}`
          .toLowerCase().includes(searchQuery.trim().toLowerCase())
      ).slice(0, 5)
    : []

  const isNavItemActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    if (to.startsWith('/catalog?')) {
      return location.pathname === '/catalog' && new URLSearchParams(location.search).get('category') === 'custom'
    }
    return location.pathname === '/catalog' && new URLSearchParams(location.search).get('category') !== 'custom'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-3 md:px-8 lg:px-12">
        <Link
          to="/"
          className="font-heading text-xl tracking-[0.18em] text-charcoal md:text-2xl"
          onClick={closeMenu}
        >
          <span className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span>{BRAND_CONFIG.name.toUpperCase()}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={() =>
                `navbar-nav-link inline-flex min-h-11 items-center justify-center px-5 text-sm ${
                  isNavItemActive(item.to) ? 'navbar-nav-link-active' : 'text-charcoal'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSearchOpen((open) => !open)} className="grid size-11 place-items-center text-charcoal" aria-label={`Search ${BRAND_CONFIG.name}`}>
            <Search size={19} strokeWidth={1.5} />
          </button>
          {!currentUser && (
            <>
              <Link to="/login" className="hidden min-h-[44px] min-w-[44px] place-items-center rounded-full border border-stone-300 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition-all duration-200 hover:border-[#A68246] hover:bg-[#A68246] hover:text-white active:scale-[0.97] sm:grid">
                Log In
              </Link>
              <Link to="/login" className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full text-charcoal transition-all duration-200 hover:bg-[#A68246]/12 hover:text-[#A68246] active:scale-[0.97] sm:hidden" aria-label="Log In">
                <UserRound size={20} strokeWidth={1.5} />
              </Link>
            </>
          )}
          {currentUser?.role === 'customer' && (
            <>
            <Link to="/account?tab=purchases" className="grid min-h-[44px] min-w-[44px] place-items-center text-charcoal sm:hidden" aria-label="My account">
              <UserRound size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/account?tab=wishlist" aria-label={`Wishlist with ${wishlistCount} saved pieces`} className="relative hidden size-11 place-items-center text-charcoal hover:text-[#B4925A] sm:grid">
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && <span className="absolute right-0 top-1 grid size-5 place-items-center rounded-full bg-[#B4925A] text-[10px] text-white">{wishlistCount}</span>}
            </Link>
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="grid size-11 place-items-center text-charcoal hover:text-champagne"
                aria-label="Open account menu"
                aria-expanded={accountMenuOpen}
              >
                <UserRound size={20} strokeWidth={1.5} />
              </button>
              {accountMenuOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-[55] cursor-default" onClick={() => setAccountMenuOpen(false)} aria-label="Close account menu" />
                  <div className="absolute right-0 top-12 z-[60] w-52 border border-stone-200 bg-ivory p-2 shadow-xl">
                              {[
                                ['My Purchases', '/account?tab=purchases'],
                                ['Saved Wishlist', '/account?tab=wishlist'],
                                ['My Profile', '/account?tab=profile'],
                              ].map(([label, to]) => (
                      <Link key={to} to={to} onClick={() => setAccountMenuOpen(false)} className="block px-4 py-3 text-xs text-charcoal hover:bg-[#F4EFE7]">
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => { logout(); setAccountMenuOpen(false) }}
                      className="mt-1 w-full border-t border-stone-200 px-4 py-3 text-left text-xs text-stone-500 hover:text-charcoal"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
            </>
          )}
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="hidden rounded-full border border-[#A68246]/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal sm:block">
              Admin Portal
            </Link>
          )}
          {currentUser?.role === 'customer' && (
            <button
              type="button"
              onClick={onCartOpen}
              className="relative grid size-11 place-items-center text-charcoal transition-colors hover:text-champagne"
              aria-label={`Open bag with ${totalItems} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute right-0 top-1 grid size-5 place-items-center rounded-full bg-champagne text-[10px] font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-11 place-items-center text-charcoal lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-stone-200/70 bg-[#F9F6F0] px-3 py-3 sm:px-5">
          <div className="relative mx-auto w-full max-w-[1440px]">
            <div className="flex items-center border-b border-[#A68246]/60">
              <Search size={17} className="mr-3 text-[#A68246]" />
              <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search jewelry, watches, gold..." className="w-full bg-transparent py-3 font-sans text-sm outline-none placeholder:text-stone-400" />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="text-xs text-stone-500">Clear</button>}
            </div>
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-[70] border border-stone-200 bg-[#F9F6F0] shadow-xl">
                {matches.map((product) => (
                  <button key={product.id} type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate(`/product/${product.slug}`) }} className="grid w-full grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-stone-100 px-4 py-3 text-left">
                    <img src={product.images[0]} alt="" className="aspect-square w-12 object-cover" />
                    <div><p className="font-heading text-base text-charcoal">{product.name}</p><p className="text-[9px] uppercase tracking-[0.12em] text-stone-500">{product.category} • {product.variants[0]?.purity} • {product.variants[0]?.weightGrams}g</p></div>
                    <p className="text-xs text-charcoal">{formatPhp(Math.min(...product.variants.map((variant) => variant.pricePhp)))}</p>
                  </button>
                ))}
                {matches.length === 0 && <p className="px-4 py-5 text-sm text-stone-500">No pieces found.</p>}
                <button type="button" onClick={() => { setSearchOpen(false); navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`) }} className="w-full px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#A68246]">
                  View all results in Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-stone-200/70 bg-ivory px-5 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={closeMenu}
                className={() =>
                  `navbar-nav-link self-start px-4 py-3 font-heading text-2xl ${
                    isNavItemActive(item.to) ? 'navbar-nav-link-active' : 'text-charcoal'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!currentUser && (
              <Link to="/login" onClick={closeMenu} className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal">
                Log In
              </Link>
            )}
            {currentUser?.role === 'customer' && (
              <>
                <Link to="/account?tab=purchases" onClick={closeMenu} className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal">My Purchases</Link>
                <Link to="/account?tab=wishlist" onClick={closeMenu} className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal">Saved Wishlist ({wishlistCount})</Link>
                <Link to="/account?tab=profile" onClick={closeMenu} className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal">My Profile</Link>
                <button type="button" onClick={() => { logout(); closeMenu() }} className="self-start text-xs uppercase tracking-[0.16em] text-stone-500">Log Out</button>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <>
                <Link to="/admin" onClick={closeMenu} className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal">
                  Dashboard
                </Link>
                <button type="button" onClick={() => { logout(); closeMenu() }} className="self-start text-xs uppercase tracking-[0.16em] text-stone-500">
                  Log Out
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
