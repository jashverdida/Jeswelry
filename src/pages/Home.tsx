import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { getFeaturedProducts } from '../services/productService'
import type { JewelryCategory, Product } from '../types/jewelry'
import { BRAND_CONFIG } from '../config/brand.config'

const categoryImages: Partial<Record<JewelryCategory, string>> = {
  watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=90',
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=90',
  necklaces: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=90',
  bangles: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=90',
  bracelets: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=90',
  earrings: 'https://images.unsplash.com/photo-1535633302704-d6f5dfdc857e?auto=format&fit=crop&w=900&q=90',
  sets: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=900&q=90',
  custom: 'https://images.unsplash.com/photo-1459921225171-1fdc64619f0e?auto=format&fit=crop&w=900&q=90',
}

const categories = BRAND_CONFIG.categories
  .filter((category) => category.id !== 'all')
  .map((category) => ({
    label: category.label,
    category: category.id as JewelryCategory,
    image: categoryImages[category.id as JewelryCategory] ?? '',
  }))

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])

  useEffect(() => {
    let active = true
    getFeaturedProducts().then((products) => {
      if (active) setFeatured(products.slice(0, 4))
    })
    return () => { active = false }
  }, [])

  return (
    <main className="bg-[#FBF9F5]">
      <section className="grid min-h-[84vh] lg:grid-cols-[60%_40%]">
        <div className="relative min-h-[52vh] overflow-hidden bg-[#141312] lg:min-h-[84vh]">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=92"
            alt={`${BRAND_CONFIG.name} fine jewelry campaign`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141312]/20 via-transparent to-[#141312]/25" />
        </div>
        <div className="flex items-center border-l border-[#181615]/12 bg-[#FBF9F5] px-7 py-16 md:px-12 lg:px-16">
          <div className="max-w-xl">
            <h1 className="text-4xl leading-[1.02] text-[#141312] sm:text-5xl lg:text-6xl">
              Crafted in pure gold.<br />Made for every day.
            </h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-stone-600">
              Hallmarked gold jewelry, fine watches, and bespoke heirlooms for life in the Philippines.
            </p>
            <div className="mt-10 flex flex-col items-start gap-5">
              <Link to="/catalog" className="min-h-[52px] bg-[#141312] px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#FBF9F5] transition hover:bg-[#A68246] hover:text-[#141312]">
                Explore the Collection
              </Link>
              <Link to="/catalog?category=custom" className="border-b border-[#141312] pb-1 text-xs font-semibold text-[#141312]">
                Commission a Bespoke Piece →
              </Link>
            </div>
            <p className="mt-8 max-w-lg text-[11px] font-medium uppercase leading-5 tracking-[0.2em] text-[#141312]/70">
              {BRAND_CONFIG.heroProvenance}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#141312]/12 bg-[#FFFFFF]">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-[#141312]/12 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              number: '01',
              title: 'Authentic Authorized Reseller',
              copy: 'Sourced exclusively through accredited gold houses and authorized timepiece distributors with verified provenance.',
            },
            {
              number: '02',
              title: 'Hallmarked Karat Purity',
              copy: `Every ${BRAND_CONFIG.attributeFilter.options.filter((option) => option !== 'Automatic').join(', ')} piece is assayed, weighed, and accompanied by a signed ${BRAND_CONFIG.name} authenticity certificate.`,
            },
            {
              number: '03',
              title: 'Insured Nationwide Dispatch',
              copy: 'Tamper-evident boutique packaging with insured door-to-door courier delivery across the Philippines.',
            },
          ].map((item) => (
            <article key={item.number} className="px-6 py-8 md:px-8 lg:px-10">
              <p className="font-mono text-[10px] text-[#A68246]">{item.number}</p>
              <h2 className="mt-3 font-heading text-2xl text-[#141312]">{item.title}</h2>
              <p className="mt-3 max-w-md text-xs leading-6 text-stone-600">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 lg:px-12">
        <h2 className="text-5xl text-[#141312] md:text-6xl">The Collection</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {categories.map((item, index) => (
            <Link
              key={item.category}
              to={`/catalog?category=${item.category}`}
              className={`group ${index === 1 || index === 5 ? 'md:mt-12' : index === 3 || index === 7 ? 'md:-mt-6' : ''}`}
            >
              <div className="aspect-[3/4] overflow-hidden bg-[#EFECE6]">
                <img src={item.image} alt={item.label} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              </div>
              <h3 className="mt-4 font-heading text-2xl text-[#141312]">{item.label}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 lg:px-12">
        <div className="flex items-end justify-between">
          <h2 className="text-5xl text-[#141312] md:text-6xl">Signature Pieces</h2>
          <Link to="/catalog" className="border-b border-[#141312] pb-1 text-xs font-semibold text-[#141312]">View all pieces →</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="border-t border-[#181615]/12 bg-[#EFECE6]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-16 md:grid-cols-[1fr_auto] md:items-center md:px-8 lg:px-12">
          <h2 className="max-w-3xl text-4xl leading-tight text-[#141312] md:text-5xl">A custom ring, bangle, or engagement piece begins with a conversation.</h2>
          <Link to="/catalog?category=custom" className="border-b border-[#141312] pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#141312]">Request Custom Design →</Link>
        </div>
      </section>
    </main>
  )
}
