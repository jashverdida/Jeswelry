import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { TrackOrderDrawer } from './TrackOrderDrawer'
import { BrandLogo } from '../ui/BrandLogo'
import { BRAND_CONFIG } from '../../config/brand.config'

export function Footer() {
  const [trackingOpen, setTrackingOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-stone-200 bg-[#F9F6F0]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8 lg:px-12">
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <p className="font-heading text-2xl tracking-[0.16em] text-[#181615]">{BRAND_CONFIG.name.toUpperCase()}</p>
            </div>
            <p className="mt-3 text-xs text-stone-500">{BRAND_CONFIG.city} • Monday–Saturday, 9 AM–6 PM</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-stone-600" aria-label="Footer navigation">
            <Link to="/catalog" className="hover:text-[#181615]">Shop All</Link>
            <Link to="/catalog?category=watches" className="hover:text-[#181615]">Watches</Link>
            <Link to="/catalog?category=custom" className="hover:text-[#181615]">Custom</Link>
            <button type="button" onClick={() => setTrackingOpen(true)} className="hover:text-[#181615]">Track Order</button>
          </nav>
          <div className="flex gap-4" aria-label="Direct concierge and inquiries">
            {BRAND_CONFIG.contacts.facebookUrl && <a
              href={BRAND_CONFIG.contacts.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Message ${BRAND_CONFIG.contacts.owners} on Facebook`}
              title={`Facebook: ${BRAND_CONFIG.contacts.owners}`}
              className="grid size-11 place-items-center rounded-full border border-[#181615]/20 text-[#181615] transition-colors hover:border-[#A68246] hover:text-[#A68246]"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06z" />
              </svg>
            </a>}
            {BRAND_CONFIG.contacts.email && <a
              href={`mailto:${BRAND_CONFIG.contacts.email}`}
              aria-label={`Email ${BRAND_CONFIG.contacts.email}`}
              title={BRAND_CONFIG.contacts.email}
              className="grid size-11 place-items-center rounded-full border border-[#181615]/20 text-[#181615] transition-colors hover:border-[#A68246] hover:text-[#A68246]"
            >
              <Mail size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>}
          </div>
        </div>
        <div className="border-t border-stone-200/80">
          <p className="mx-auto max-w-[1440px] px-5 py-5 text-[11px] text-stone-500 md:px-8 lg:px-12">
            © {new Date().getFullYear()} {BRAND_CONFIG.name}
          </p>
        </div>
      </footer>
      <TrackOrderDrawer open={trackingOpen} onClose={() => setTrackingOpen(false)} />
    </>
  )
}
