import { useEffect, useState, type FormEvent } from 'react'
import { Check, Copy, X } from 'lucide-react'
import { getOrders } from '../../services/orderService'
import type { Order } from '../../types/jewelry'
import { BRAND_CONFIG } from '../../config/brand.config'

interface Props {
  open: boolean
  onClose: () => void
  initialOrderId?: string
}

const steps: { key: Order['status']; label: string; description: string }[] = [
  { key: 'pending', label: 'Order Placed', description: 'Your piece and payment selection are recorded.' },
  { key: 'verified', label: 'Gold Authenticity & Payment Verified', description: 'Hallmark check complete. QR payment confirmation received.' },
  { key: 'shipped', label: 'Tamper-Evident Packaging & Insured Dispatch', description: 'Your jewelry is secured and in insured courier transit.' },
  { key: 'completed', label: `Delivered / Ready for ${BRAND_CONFIG.name} Pickup`, description: `Completed delivery or ready at our ${BRAND_CONFIG.contacts.pickupAddress} pickup location.` },
]

export function TrackOrderDrawer({ open, onClose, initialOrderId = '' }: Props) {
  const [orderId, setOrderId] = useState(initialOrderId)
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setOrderId(initialOrderId)
  }, [initialOrderId, open])

  if (!open) return null

  const findOrder = (event: FormEvent) => {
    event.preventDefault()
    const normalized = orderId.trim().toUpperCase()
    const found = getOrders().find((item) => item.id.toUpperCase() === normalized)
    setOrder(found ?? null)
    setError(found ? '' : 'No order found with that reference.')
  }

  const activeIndex = order
    ? steps.findIndex((step) => step.key === order.status)
    : -1

  return (
    <>
      <button type="button" className="fixed inset-0 z-[80] bg-charcoal/35" onClick={onClose} aria-label="Close order tracker" />
      <aside className="fixed bottom-5 right-0 top-5 z-[90] w-full max-w-md overflow-y-auto bg-[#FAF8F5] p-5 shadow-2xl sm:bottom-0 sm:top-0 sm:p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-4xl text-charcoal">Track Order</h2>
          <button type="button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={findOrder} className="mt-7 flex gap-2">
          <input value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder={`${BRAND_CONFIG.shortCode}-2026-XXXX`} className="min-w-0 flex-1 border border-stone-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#B4925A]" />
          <button type="submit" className="bg-charcoal px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white">Track</button>
        </form>
        {error && <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
        {order && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B4925A]">{order.id}</p>
            <p className="mt-2 text-sm text-stone-500">{order.customerName}</p>
            <button type="button" onClick={() => navigator.clipboard?.writeText(order.id)} className="mt-4 flex items-center gap-2 border border-[#A68246]/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#181615]">
              <Copy size={13} /> Copy Order ID
            </button>
            <div className="mt-7 space-y-0">
              {steps.map((step, index) => (
                <div key={step.key} className="grid grid-cols-[32px_1fr]">
                  <div className="flex flex-col items-center">
                    <div className={`grid size-7 place-items-center rounded-full border ${index <= activeIndex ? 'border-[#B4925A] bg-[#B4925A] text-white' : 'border-stone-300 bg-[#FAF8F5] text-stone-400'}`}>
                      {index <= activeIndex ? <Check size={14} /> : <span className="size-1.5 rounded-full bg-stone-300" />}
                    </div>
                    {index < steps.length - 1 && <div className={`h-14 w-px ${index < activeIndex ? 'bg-[#B4925A]' : 'bg-stone-300'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm ${index <= activeIndex ? 'font-semibold text-charcoal' : 'text-stone-500'}`}>{step.label}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
