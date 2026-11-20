import { useState } from 'react'
import { ChevronDown, PackageCheck } from 'lucide-react'
import type { Product } from '../../types/jewelry'

interface TrustBadgesProps {
  product: Product
  weightGrams: number
}

export function TrustBadges({ product, weightGrams }: TrustBadgesProps) {
  const [careOpen, setCareOpen] = useState(false)

  return (
    <div className="border-y border-stone-200 py-5">
      <details className="border-b border-[#181615]/10 pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">
          Craftsmanship & Hallmarks
          <ChevronDown size={16} />
        </summary>
        <p className="mt-3 text-xs leading-6 text-stone-600">Verified purity and exact gram weight of {weightGrams}g, with individual hallmark inspection.</p>
      </details>
      <div className="flex items-center gap-3 border-b border-[#181615]/10 py-4">
        <PackageCheck size={18} className="text-[#A68246]" />
        <p className="text-xs font-semibold text-charcoal">Insured Delivery</p>
      </div>

      <button
        type="button"
        onClick={() => setCareOpen((open) => !open)}
        className="mt-5 flex w-full items-center justify-between border-t border-stone-200 pt-4 text-left"
        aria-expanded={careOpen}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal">Jewelry Care Instructions</span>
        <ChevronDown className={`text-champagne transition ${careOpen ? 'rotate-180' : ''}`} size={16} />
      </button>
      {careOpen && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-6 text-stone-600">
          {product.careInstructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
