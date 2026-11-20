import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { TrustBadges } from '../components/product/TrustBadges'
import { getProductBySlug, getProducts, formatPhp } from '../services/productService'
import { useCartStore } from '../store/useCartStore'
import type { Product } from '../types/jewelry'
import { useToastStore } from '../store/useToastStore'
import { useAuthStore } from '../store/useAuthStore'
import { BRAND_CONFIG } from '../config/brand.config'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | undefined>()
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [related, setRelated] = useState<Product[]>([])
  const openCart = useCartStore((state) => state.openCart)
  const addItem = useCartStore((state) => state.addItem)
  const navigate = useNavigate()
  const showToast = useToastStore((state) => state.show)
  const currentUser = useAuthStore((state) => state.currentUser)

  useEffect(() => {
    let active = true
    if (!slug) return
    getProductBySlug(slug).then((item) => {
      if (!active) return
      setProduct(item)
      if (item) {
        setSelectedVariantId(item.variants[0]?.id ?? '')
        setActiveImage(item.images[0] ?? '')
      }
    })
    getProducts().then((items) => {
      if (active) setRelated(items.filter((item) => item.slug !== slug).slice(0, 3))
    })
    return () => {
      active = false
    }
  }, [slug])

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === selectedVariantId) ?? product?.variants[0],
    [product, selectedVariantId],
  )

  if (!product || !selectedVariant) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-24 text-center md:px-8 lg:px-12">
        <p className="font-heading text-4xl text-charcoal">Piece not found</p>
        <Link to="/catalog" className="mt-5 inline-block text-xs uppercase tracking-[0.14em] text-champagne">
          Return to Collection
        </Link>
      </main>
    )
  }

  const addToBag = () => {
    if (selectedVariant.stockCount <= 0) return
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel: selectedVariant.label,
      purity: selectedVariant.purity,
      weightGrams: selectedVariant.weightGrams,
      unitPricePhp: selectedVariant.pricePhp,
      image: product.images[0] ?? '',
      quantity: 1,
    })
    openCart()
    showToast('Added to Bag')
  }

  const buyNow = () => {
    if (selectedVariant.stockCount <= 0) return
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel: selectedVariant.label,
      purity: selectedVariant.purity,
      weightGrams: selectedVariant.weightGrams,
      unitPricePhp: selectedVariant.pricePhp,
      image: product.images[0] ?? '',
      quantity: 1,
    })
    navigate('/checkout')
  }

  return (
    <main>
      <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 lg:px-12">
        <nav className="mb-7 text-xs text-stone-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-charcoal">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/catalog?category=${product.category}`} className="hover:text-charcoal">{BRAND_CONFIG.categories.find((category) => category.id === product.category)?.label ?? product.category}</Link>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[4/5] overflow-hidden bg-stone-100">
              <img src={activeImage || product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`size-20 overflow-hidden border ${activeImage === image ? 'border-champagne' : 'border-transparent'}`}
                    aria-label="Switch product image"
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:py-4">
            <div className="border-b border-[#181615]/10 pb-6">
              <h1 className="font-heading text-5xl leading-[0.95] text-charcoal md:text-6xl">{product.name}</h1>
              <p className="mt-5 font-heading text-3xl text-charcoal">{formatPhp(selectedVariant.pricePhp)}</p>
            </div>
            <div className="divide-y divide-[#181615]/10 border-b border-[#181615]/10">
              <div className="py-5">
                <p className="text-xs text-stone-500">{selectedVariant.purity} • {selectedVariant.weightGrams}g</p>
                <p className={`mt-2 text-xs ${selectedVariant.stockCount > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {selectedVariant.stockCount > 0 ? `${selectedVariant.stockCount} pieces available` : 'Sold Out'}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Select Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`min-h-[44px] border px-4 py-3 text-xs transition ${
                      selectedVariant.id === variant.id
                        ? 'border-charcoal bg-charcoal text-white'
                        : 'border-stone-300 text-charcoal hover:border-champagne'
                    }`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>

            {currentUser?.role === 'customer' ? (
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" onClick={addToBag} disabled={selectedVariant.stockCount <= 0} className="w-full border border-charcoal bg-charcoal px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:bg-stone-300">
                  {selectedVariant.stockCount > 0 ? 'Add to Bag' : 'Sold Out'}
                </button>
                <button type="button" onClick={buyNow} disabled={selectedVariant.stockCount <= 0} className="w-full border border-[#A68246] bg-[#F9F6F0] px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal disabled:cursor-not-allowed disabled:text-stone-400">
                  Buy Now
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => navigate(`/login?redirect=/product/${slug}`)} className="mt-7 w-full border border-[#A68246] bg-[#181615] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#F9F6F0]">
                Sign In to Order This Piece
              </button>
            )}

            <div className="mt-8">
              <TrustBadges product={product} weightGrams={selectedVariant.weightGrams} />
            </div>
          </section>
        </div>
      </div>

      <section className="border-t border-stone-200 bg-[#F4EFE7]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 lg:px-12">
          <h2 className="mt-2 font-heading text-5xl text-charcoal">You May Also Like</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
