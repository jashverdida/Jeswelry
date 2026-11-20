import { Link } from 'react-router-dom'
import type { Product } from '../../types/jewelry'
import { formatPhp } from '../../services/productService'
import { Heart } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useWishlistStore } from '../../store/useWishlistStore'
import { useToastStore } from '../../store/useToastStore'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const currentUser = useAuthStore((state) => state.currentUser)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isSaved = useWishlistStore((state) => state.isSaved(product.id))
  const showToast = useToastStore((state) => state.show)
  const purities = [...new Set(product.variants.map((variant) => variant.purity))]
  const weights = product.variants.map((variant) => variant.weightGrams)
  const startingPrice = Math.min(...product.variants.map((variant) => variant.pricePhp))
  const minimumWeight = Math.min(...weights)
  const maximumWeight = Math.max(...weights)

  return (
    <article className="group">
      <div className="relative block aspect-[4/5] overflow-hidden bg-[#EFECE6] rounded-none">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025] group-hover:brightness-[.96]"
          loading="lazy"
        />
        </Link>
        {currentUser?.role === 'customer' ? (
          <button
            type="button"
            onClick={(event) => { event.preventDefault(); toggleWishlist(product.id); showToast(isSaved ? 'Removed from Wishlist' : 'Saved to Wishlist') }}
            className={`absolute right-3 top-3 grid size-10 place-items-center border border-[#181615]/15 bg-[#FBF9F5] ${isSaved ? 'text-[#A68246]' : 'text-charcoal'}`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        ) : (
          <>
            <Link to="/login" className="absolute right-3 top-3 grid size-10 place-items-center border border-[#181615]/15 bg-[#FBF9F5] text-charcoal" aria-label="Sign in to save pieces">
              <Heart size={17} strokeWidth={1.5} />
            </Link>
          </>
        )}
      </div>
      <div className="pt-4">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A68246]">
          {purities.join(' • ')} • {minimumWeight === maximumWeight ? `${minimumWeight.toFixed(1)}g` : `${minimumWeight.toFixed(1)}–${maximumWeight.toFixed(1)}g`}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-heading text-2xl leading-tight text-charcoal">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-sm text-charcoal">From {formatPhp(startingPrice)}</p>
          <p className="text-xs text-stone-500">
            {minimumWeight === maximumWeight
              ? `${minimumWeight.toFixed(1)} g`
              : `${minimumWeight.toFixed(1)}–${maximumWeight.toFixed(1)} g`}
          </p>
        </div>
      </div>
    </article>
  )
}
