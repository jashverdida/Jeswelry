import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductCard'
import { ArchitecturalSelect } from '../components/ui/ArchitecturalSelect'
import { getProducts } from '../services/productService'
import type { GoldPurity, JewelryCategory, Product } from '../types/jewelry'
import { BRAND_CONFIG, type BrandCategoryId } from '../config/brand.config'

type CategoryFilter = 'all' | JewelryCategory
type PurityFilter = GoldPurity | 'Automatic'
type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest'

const categoryOptions: { label: string; value: CategoryFilter }[] =
  BRAND_CONFIG.categories.map((category) => ({
    label: category.label,
    value: category.id as CategoryFilter,
  }))

const purityOptions: { label: string; value: PurityFilter }[] =
  BRAND_CONFIG.attributeFilter.options.map((option) => ({
    label: option,
    value: option as PurityFilter,
  }))

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const queryParam = searchParams.get('q') ?? ''
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(
    categoryOptions.some((option) => option.value === categoryParam)
      ? (categoryParam as CategoryFilter)
      : 'all'
  )
  const [selectedMetals, setSelectedMetals] = useState<PurityFilter[]>([])
  const [sort, setSort] = useState<SortOption>('featured')
  const [products, setProducts] = useState<Product[]>([])
  const [openDropdown, setOpenDropdown] = useState<'purity' | 'sort' | null>(null)

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Newest', value: 'newest' },
  ]

  useEffect(() => {
    let active = true
    getProducts().then((items) => {
      if (active) setProducts(items)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setActiveCategory(
      categoryOptions.some((option) => option.value === categoryParam)
        ? (categoryParam as CategoryFilter)
        : 'all'
    )
  }, [categoryParam])

  useEffect(() => setSearchQuery(searchParams.get('q') ?? ''), [searchParams])

  const updateCategory = (nextCategory: CategoryFilter) => {
    setActiveCategory(nextCategory)
    const nextParams = new URLSearchParams(searchParams)
    if (nextCategory === 'all') nextParams.delete('category')
    else nextParams.set('category', nextCategory)
    setSearchParams(nextParams)
  }

  const toggleMetal = (metal: PurityFilter) => {
    setSelectedMetals((current) =>
      current.includes(metal)
        ? current.filter((value) => value !== metal)
        : [...current, metal]
    )
  }

  const metalTriggerLabel =
    selectedMetals.length === 0
      ? BRAND_CONFIG.attributeFilter.allLabel
      : selectedMetals.length === 1
        ? selectedMetals[0]
        : `Metals (${selectedMetals.length})`

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const queryMatch = !searchQuery.trim() ||
        `${product.name} ${product.category} ${product.description} ${product.variants.map((variant) => `${variant.purity} ${variant.label}`).join(' ')}`
          .toLowerCase().includes(searchQuery.trim().toLowerCase())
      const categoryMatches =
        activeCategory === 'all' || product.category === activeCategory
      const purityMatches =
        selectedMetals.length === 0 ||
        selectedMetals.some((metal) =>
          metal === 'Automatic'
            ? product.category === 'watches' && product.variants.some((variant) => /automatic/i.test(variant.label))
            : product.variants.some((variant) => variant.purity === metal)
        )
      return queryMatch && categoryMatches && purityMatches
    })

    const startingPrice = (product: Product) =>
      Math.min(...product.variants.map((variant) => variant.pricePhp))

    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return startingPrice(a) - startingPrice(b)
      if (sort === 'price-high') return startingPrice(b) - startingPrice(a)
      if (sort === 'newest') {
        const newestA = Number(a.id.replace(/\D/g, '')) || 0
        const newestB = Number(b.id.replace(/\D/g, '')) || 0
        return newestB - newestA
      }
      return Number(b.featured) - Number(a.featured)
    })
  }, [activeCategory, selectedMetals, products, sort, searchQuery])

  const resetFilters = () => {
    setSelectedMetals([])
    setSort('featured')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('q')
    setSearchParams(nextParams)
    setSearchQuery('')
  }

  const categoryHeadings = Object.fromEntries(
    BRAND_CONFIG.categories.map((category) => [category.id, category.editorialTitle])
  ) as Record<BrandCategoryId, string>

  const headerTitle = categoryHeadings[activeCategory]

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-12 md:px-8 md:py-16 lg:px-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-h-[88px]">
          <h1 key={headerTitle} className="animate-editorial-reveal font-heading text-5xl leading-none text-charcoal md:text-7xl">{headerTitle}</h1>
          <p className="mt-5 max-w-xl text-sm text-[#141312]/65">
            {BRAND_CONFIG.heroSubtitle}
          </p>
        </div>
        <p className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-[#141312]/70 sm:pb-1">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Creation' : 'Creations'}
        </p>
      </header>

      {searchQuery.trim() && (
        <div className="mt-6 flex items-center gap-3">
          <p className="border-l-2 border-[#A68246] px-3 py-2 text-xs text-[#181615]">
            Showing results for "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.delete('q')
              setSearchParams(next)
            }}
            className="text-[10px] uppercase tracking-[0.12em] text-stone-500 underline underline-offset-4"
          >
            Clear
          </button>
        </div>
      )}

      <section className="sticky top-20 z-30 -mx-5 mt-8 border-b border-[#181615]/15 bg-[#FBF9F5]/95 px-5 py-1 backdrop-blur md:-mx-8 md:px-8 lg:-mx-12 lg:px-12" aria-label="Catalog filters">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateCategory(option.value)}
                  aria-pressed={activeCategory === option.value}
                  className={`catalog-category-tab min-h-[48px] border-b-2 px-4 text-xs transition-colors duration-200 ${
                    activeCategory === option.value
                      ? 'border-[#141312] text-[#141312]'
                      : 'border-transparent text-stone-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative z-30 flex shrink-0 items-center gap-2">
            <ArchitecturalSelect
              ariaLabel={BRAND_CONFIG.attributeFilter.label}
              value={selectedMetals[0] ?? (purityOptions[0]?.value as PurityFilter)}
              options={purityOptions}
              open={openDropdown === 'purity'}
              onOpenChange={(open) => setOpenDropdown(open ? 'purity' : null)}
              multiple
              selectedValues={selectedMetals}
              onToggle={toggleMetal}
              triggerLabel={metalTriggerLabel}
            />
            <ArchitecturalSelect
              ariaLabel="Sort products"
              value={sort}
              options={sortOptions}
              open={openDropdown === 'sort'}
              onOpenChange={(open) => setOpenDropdown(open ? 'sort' : null)}
              onChange={setSort}
            />
          </div>
        </div>
      </section>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-xs text-stone-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
        </p>
        {(selectedMetals.length > 0 || searchQuery.trim().length > 0) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs uppercase tracking-wider text-[#141312] underline underline-offset-4 hover:text-[#A68246]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-10 opacity-100 transition-opacity duration-200 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-5 border border-stone-200 py-20 text-center">
          <h2 className="font-heading text-4xl text-charcoal">No pieces found</h2>
          <p className="mt-3 text-sm text-stone-500">Try removing a filter to discover more of the collection.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-7 bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          >
            Reset Filters
          </button>
        </div>
      )}
    </main>
  )
}
