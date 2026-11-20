import { Minus, Plus, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { formatPhp } from '../../services/productService'

interface SlideOutCartProps {
  open: boolean
  onClose: () => void
}

export function SlideOutCart({ open, onClose }: SlideOutCartProps) {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotalPhp())
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-charcoal/30 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close shopping bag"
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping bag"
        aria-hidden={!open}
      >
        <header className="flex h-20 items-center justify-between border-b border-stone-200 px-5 md:px-7">
          <h2 className="font-heading text-3xl text-charcoal">Your Bag</h2>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center" aria-label="Close bag">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="font-heading text-3xl text-charcoal">Your bag is empty</p>
                <Link to="/catalog" onClick={onClose} className="mt-5 inline-block border-b border-champagne pb-1 text-xs uppercase tracking-[0.14em] text-charcoal">
                  Explore Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <article key={item.variantId} className="grid grid-cols-[88px_1fr] gap-4 border-b border-stone-200 pb-6">
                  <img src={item.image} alt={item.productName} className="aspect-[4/5] w-full object-cover" />
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl leading-tight text-charcoal">{item.productName}</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      {item.purity} • {item.weightGrams}g
                    </p>
                    <p className="mt-2 text-sm text-charcoal">{formatPhp(item.unitPricePhp)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-stone-300">
                        <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="grid size-8 place-items-center" aria-label="Decrease quantity">
                          <Minus size={12} />
                        </button>
                        <span className="grid size-8 place-items-center text-xs">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="grid size-8 place-items-center" aria-label="Increase quantity">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.variantId)} className="text-stone-400 hover:text-charcoal" aria-label={`Remove ${item.productName}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-stone-200 px-5 py-5 md:px-7">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-stone-500">Subtotal</span>
              <strong className="font-heading text-2xl text-charcoal">{formatPhp(subtotal)}</strong>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="mt-5 block bg-charcoal px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white"
            >
              Proceed to Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  )
}
