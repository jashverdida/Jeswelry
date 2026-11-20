import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Check, Copy, Upload } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useCartStore } from '../store/useCartStore'
import { formatPhp } from '../services/productService'
import { generateOrderReference, saveOrder } from '../services/orderService'
import type { Order } from '../types/jewelry'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import { Download } from 'lucide-react'
import { BrandLogo } from '../components/ui/BrandLogo'
import { getPaymentSettings } from '../services/paymentSettingsService'
import { BRAND_CONFIG } from '../config/brand.config'

type Fulfillment = 'delivery' | 'pickup'
type Payment = 'gcash' | 'bank_transfer' | 'cod'

interface PaymentQRProps {
  payload: string
  label: string
  accountName: string
  accountNumber: string
  referenceName: string
  proofName: string
  proofPreview: string
  onProof: (name: string, preview: string) => void
  customQrImage?: string
}

function PaymentQR({
  payload,
  label,
  accountName,
  accountNumber,
  referenceName,
  proofName,
  proofPreview,
  onProof,
  customQrImage,
}: PaymentQRProps) {
  const copyNumber = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(accountNumber)
      useToastStore.getState().show('Copied to Clipboard')
    }
  }

  const downloadQr = () => {
    if (customQrImage) {
      const link = document.createElement('a')
      link.href = customQrImage
      link.download = `${BRAND_CONFIG.name}-${label.replaceAll(' ', '-')}-QR.png`
      link.click()
      return
    }
    const svg = document.querySelector<SVGSVGElement>(`#qr-${referenceName}`)
    if (!svg) return
    const source = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${BRAND_CONFIG.name}-${label.replaceAll(' ', '-')}-QR.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const previewProof = (file: File | undefined) => {
    if (!file) {
      onProof('', '')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onProof(file.name, String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  return (
    <div className="mt-5 grid gap-5 border border-[#1C1917] bg-[#FAF8F5] p-3 md:grid-cols-[220px_1fr] md:p-5">
      <div className="mx-auto w-full max-w-[192px] border border-stone-300 bg-[#FAF8F5] p-3">
        {customQrImage ? (
          <img src={customQrImage} alt={`${label} payment QR`} className="aspect-square h-auto w-full object-contain" />
        ) : (
          <QRCodeSVG id={`qr-${referenceName}`} value={payload} size={192} level="M" bgColor="#FAF8F5" fgColor="#1C1917" className="h-auto w-full" />
        )}
        <p className="mt-2 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-champagne">{label} QR</p>
        <button type="button" onClick={downloadQr} className="mt-3 flex w-full items-center justify-center gap-2 border border-stone-300 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal">
          <Download size={13} /> Download QR
        </button>
      </div>
      <div>
        <p className="font-heading text-2xl text-charcoal">{accountName}</p>
        <button type="button" onClick={copyNumber} className="mt-2 flex min-h-[44px] max-w-full items-center gap-2 break-all text-left text-sm font-semibold text-charcoal">
          {accountNumber}
          <Copy size={14} strokeWidth={1.5} />
        </button>
        <p className="mt-2 text-xs text-stone-500">Use any {label} app or QR scanner.</p>

        <label className="mt-5 block text-xs font-medium text-charcoal">
          Reference Number <span className="font-normal text-stone-500">(optional)</span>
          <input name={referenceName} className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#B4925A]" />
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-3 border border-dashed border-stone-400 px-4 py-3 text-xs text-charcoal">
          <Upload size={16} className="text-[#B4925A]" />
          <span>{proofName || 'Upload payment screenshot'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => previewProof(event.target.files?.[0])}
          />
        </label>
        {proofPreview && (
          <img src={proofPreview} alt="Payment screenshot preview" className="mt-3 max-h-40 rounded border border-stone-200 object-contain" />
        )}
      </div>
    </div>
  )
}

export function Checkout() {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotalPhp)
  const clearCart = useCartStore((state) => state.clearCart)
  const currentUser = useAuthStore((state) => state.currentUser)
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery')
  const [payment, setPayment] = useState<Payment>('gcash')
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<Order | null>(null)
  const [proofName, setProofName] = useState('')
  const [proofPreview, setProofPreview] = useState('')
  const [paymentSettings] = useState(getPaymentSettings)
  const tempRef = useMemo(() => `${BRAND_CONFIG.shortCode}-${Date.now().toString().slice(-8)}`, [])

  useEffect(() => {
    if (payment === 'gcash' && !paymentSettings.gcash.enabled) {
      setPayment(paymentSettings.bank.enabled ? 'bank_transfer' : 'cod')
    } else if (payment === 'bank_transfer' && !paymentSettings.bank.enabled) {
      setPayment(paymentSettings.cod.enabled ? 'cod' : 'gcash')
    } else if (payment === 'cod' && !paymentSettings.cod.enabled) {
      setPayment(paymentSettings.gcash.enabled ? 'gcash' : 'bank_transfer')
    }
  }, [payment, paymentSettings])
  const savedAddress = currentUser?.deliveryAddress?.split(',').map((part) => part.trim()) ?? []

  const shippingFee = fulfillment === 'delivery' ? 150 : 0
  const total = subtotal() + shippingFee
  if (!currentUser || currentUser.role !== 'customer') {
    return <Navigate to="/login?redirect=/checkout" replace />
  }

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (items.length === 0) {
      setError('Your bag is empty.')
      return
    }

    const form = new FormData(event.currentTarget)
    const customerName = String(form.get('customerName') ?? '').trim()
    const customerPhone = String(form.get('customerPhone') ?? '').trim()
    const customerEmail = String(form.get('customerEmail') ?? '').trim()
    if (!customerName || !customerPhone || !customerEmail) {
      setError('Please complete your customer details.')
      return
    }

    let deliveryAddress: string | undefined
    if (fulfillment === 'delivery') {
      const street = String(form.get('street') ?? '').trim()
      const barangay = String(form.get('barangay') ?? '').trim()
      const city = String(form.get('city') ?? '').trim()
      const province = String(form.get('province') ?? '').trim()
      if (!street || !barangay || !city || !province) {
        setError('Please complete the delivery address.')
        return
      }
      deliveryAddress = `${street}, ${barangay}, ${city}, ${province}`
    }

    const order: Order = {
      id: generateOrderReference(),
      userId: currentUser?.id,
      customerName,
      customerPhone,
      customerEmail,
      fulfillmentMethod: fulfillment,
      deliveryAddress,
      paymentMethod: payment,
      paymentReference: payment !== 'cod'
        ? String(form.get('paymentReference') ?? '').trim()
        : undefined,
      paymentProofName: proofName || undefined,
      paymentProofPreview: proofPreview || undefined,
      items: items.map((item) => ({ ...item })),
      totalPhp: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    saveOrder(order)
    clearCart()
    setConfirmation(order)
  }

  if (confirmation) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
        <BrandLogo size="lg" className="mx-auto mb-6" />
        <div className="mx-auto grid size-16 place-items-center rounded-full border border-champagne text-champagne">
          <Check size={28} strokeWidth={1.5} />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-champagne">Order Confirmed</p>
        <h1 className="mt-3 font-heading text-5xl text-charcoal md:text-6xl">Thank you, {confirmation.customerName}</h1>
        <p className="mt-5 text-sm text-stone-600">
          Reference <strong className="text-charcoal">{confirmation.id}</strong>. A confirmation will be sent to {confirmation.customerEmail}.
        </p>

        <div className="mt-10 border-y border-stone-200 py-7 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Fulfillment</span>
            <span className="text-charcoal">{confirmation.fulfillmentMethod === 'delivery' ? 'Insured Nationwide Delivery' : `${BRAND_CONFIG.name} Pickup`}</span>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-stone-500">Payment</span>
            <span className="capitalize text-charcoal">{confirmation.paymentMethod.replace('_', ' ')}</span>
          </div>
          <div className="mt-4 flex justify-between">
            <span className="text-sm text-stone-500">Total</span>
            <strong className="font-heading text-2xl text-charcoal">{formatPhp(confirmation.totalPhp)}</strong>
          </div>
        </div>
        <Link to="/catalog" className="mt-9 inline-block bg-charcoal px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Continue Shopping
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1440px] bg-[#FAF8F5] px-5 py-12 md:px-8 lg:px-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">Secure Checkout</p>
        <h1 className="mt-2 font-heading text-6xl text-charcoal">Your Details</h1>
      </header>

      <form onSubmit={submitOrder} className="mt-9 grid items-start gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-heading text-3xl text-charcoal">Customer</h2>
            {!currentUser ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-stone-200 bg-[#F4EFE7] px-4 py-3">
                <p className="text-xs text-stone-600">Want to track this order? <span className="text-charcoal">Sign in or create an account.</span></p>
                <Link to="/login" className="text-xs font-semibold uppercase tracking-[0.12em] text-champagne">Sign In / Register</Link>
              </div>
            ) : (
              <p className="mt-3 text-xs text-stone-500">Signed in as <strong className="text-charcoal">{currentUser.email}</strong>. Your profile details are ready below.</p>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-medium text-charcoal">
                Full Name *
                <input name="customerName" defaultValue={currentUser?.name ?? ''} required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
              </label>
              <label className="text-xs font-medium text-charcoal">
                Phone Number *
                <input name="customerPhone" defaultValue={currentUser?.phone ?? ''} required type="tel" className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
              </label>
              <label className="text-xs font-medium text-charcoal md:col-span-2">
                Email Address *
                <input name="customerEmail" defaultValue={currentUser?.email ?? ''} required type="email" className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
              </label>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-3xl text-charcoal">Fulfillment</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <button type="button" onClick={() => setFulfillment('delivery')} className={`border p-5 text-left ${fulfillment === 'delivery' ? 'border-champagne bg-[#FBF7EF]' : 'border-stone-300'}`}>
                <p className="text-sm font-semibold text-charcoal">Nationwide Insured Delivery</p>
                <p className="mt-1 text-xs text-stone-500">{BRAND_CONFIG.currency.symbol}150 insured shipping</p>
              </button>
              <button type="button" onClick={() => setFulfillment('pickup')} className={`border p-5 text-left ${fulfillment === 'pickup' ? 'border-champagne bg-[#FBF7EF]' : 'border-stone-300'}`}>
                <p className="text-sm font-semibold text-charcoal">{BRAND_CONFIG.contacts.pickupAddress} / Meetup Pickup</p>
                <p className="mt-1 text-xs text-stone-500">No shipping fee</p>
              </button>
            </div>

            {fulfillment === 'delivery' && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ['street', 'Street / House Address'],
                  ['barangay', 'Barangay'],
                  ['city', 'City'],
                  ['province', 'Province'],
                ].map(([name, label]) => (
                  <label key={name} className="text-xs font-medium text-charcoal">
                    {label} *
                    <input
                      name={name}
                      required
                      defaultValue={
                        name === 'street' ? savedAddress[0] ?? '' :
                        name === 'barangay' ? savedAddress[1] ?? '' :
                        name === 'city' ? savedAddress[2] ?? '' :
                        savedAddress[3] ?? ''
                      }
                      className="mt-2 w-full border border-stone-300 bg-[#FAF8F5] px-4 py-3 text-sm outline-none focus:border-champagne"
                    />
                  </label>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-heading text-3xl text-charcoal">Payment</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {([
                ['gcash', 'GCash', paymentSettings.gcash.enabled],
                ['bank_transfer', 'Bank Transfer', paymentSettings.bank.enabled],
                ['cod', 'Cash on Delivery', paymentSettings.cod.enabled],
              ] as [Payment, string, boolean][]).filter(([, , enabled]) => enabled).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPayment(value as Payment)}
                  className={`border px-4 py-4 text-xs font-semibold ${payment === value ? 'border-champagne bg-[#FBF7EF] text-charcoal' : 'border-stone-300 text-stone-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {payment === 'gcash' && (
              <PaymentQR
                payload={`${BRAND_CONFIG.shortCode}-GCASH | Ref: ${tempRef} | Amount: ${BRAND_CONFIG.currency.code} ${total}`}
                label="GCash"
                accountName={paymentSettings.gcash.accountName}
                accountNumber={paymentSettings.gcash.mobileNumber}
                customQrImage={paymentSettings.gcash.customQrImage}
                referenceName="paymentReference"
                proofName={proofName}
                proofPreview={proofPreview}
                onProof={(name, preview) => { setProofName(name); setProofPreview(preview) }}
              />
            )}

            {payment === 'bank_transfer' && (
              <PaymentQR
                payload={`${BRAND_CONFIG.shortCode}-INSTAPAY | Ref: ${tempRef} | Amount: ${BRAND_CONFIG.currency.code} ${total}`}
                label="BDO / BPI / InstaPay"
                accountName={`${paymentSettings.bank.bankName} • ${paymentSettings.bank.accountName}`}
                accountNumber={paymentSettings.bank.accountNumber}
                customQrImage={paymentSettings.bank.customQrImage}
                referenceName="paymentReference"
                proofName={proofName}
                proofPreview={proofPreview}
                onProof={(name, preview) => { setProofName(name); setProofPreview(preview) }}
              />
            )}

            {payment === 'cod' && (
              <div className="mt-5 border border-stone-300 bg-[#F9F6F0] p-5 text-sm text-stone-600">
                {paymentSettings.cod.instructions}
              </div>
            )}
          </section>

          {error && <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </div>

        <aside className="border border-stone-200 bg-[#F4EFE7] p-5 lg:sticky lg:top-24 md:p-7">
          <h2 className="font-heading text-3xl text-charcoal">Order Summary</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-stone-200 pb-4">
                <img src={item.image} alt="" className="aspect-[4/5] w-full object-cover" />
                <div>
                  <p className="font-heading text-lg leading-tight text-charcoal">{item.productName}</p>
                  <p className="mt-1 text-[11px] text-stone-500">{item.purity} • {item.weightGrams}g</p>
                  <p className="mt-1 text-xs text-stone-500">Qty {item.quantity}</p>
                </div>
                <p className="text-xs text-charcoal">{formatPhp(item.unitPricePhp * item.quantity)}</p>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <p className="py-8 text-sm text-stone-500">Your bag is empty.</p>
          )}

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatPhp(subtotal())}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Insured Shipping</span>
              <span>{formatPhp(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-300 pt-4">
              <strong className="text-charcoal">Total</strong>
              <strong className="font-heading text-2xl text-charcoal">{formatPhp(total)}</strong>
            </div>
          </div>

          <button type="submit" className="mt-6 w-full bg-charcoal px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Place Order
          </button>
        </aside>
      </form>
    </main>
  )
}
