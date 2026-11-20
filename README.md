<<<<<<< HEAD
# Jeswelry
Official digital storefront and boutique order management desk for Jeswelry, an authentic authorized reseller of hallmarked 14K–21K fine gold jewelry, heirloom suites, bespoke commissions, and curated timepieces based in Cebu City, Philippines. 
=======
# Jeswelry — Fine Gold & Horology E-Commerce Platform

Official digital storefront and boutique order management desk for **Jeswelry**, an authentic authorized reseller of hallmarked 14K–21K fine gold jewelry, heirloom suites, bespoke commissions, and curated timepieces based in Cebu City, Philippines.

---

## Key Features

### Client Storefront
- **Editorial Lookbook & Provenance:** Full-bleed architectural hero showcasing verified authorized reseller provenance, karat hallmark guarantees, and insured nationwide dispatch.
- **Dynamic Catalog & Multi-Attribute Filtering:** Single-select category tabs (*Rings, Necklaces, Bracelets, Bangles, Earrings, Watches, Sets, Custom*) with smooth editorial title transitions, multi-select metal/purity filters (`14K`, `18K`, `21K`, `925 Silver`, `Automatic`), and sorting.
- **Zero-Layout-Shift Predictive Search:** Floating glassmorphic search overlay across the storefront header.
- **Streamlined Checkout & Payment Proof:** Supports **GCash QR**, **InstaPay / Bank Transfer QR**, and **Cash on Delivery / Showroom Pickup** with reference number submission and customer purchase tracking.

### Isolated Boutique Admin Portal (`/admin`)
- **Executive Overview:** Real-time gross sales, pending order alerts, active catalog count, and recent order feed.
- **Order Fulfillment Desk:** Filterable order queue (`To Verify`, `To Dispatch`, `In Transit`, `Delivered`) with 1-click stage progression buttons and an on-demand slide-over **Order Dossier** for payment proof inspection and shipping label copying.
- **Catalog & Inventory Desk:** Viewport-locked inventory table with internal scrolling, pagination (`10` items per page), inline stock controls, visibility toggles, and piece creation/editing.
- **Payment & QR Settings:** Manage active GCash and InstaPay QR codes, account names, and payment instructions directly from the admin panel.

---

## Tech Stack
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (`Bodoni Moda` editorial serif & `Jost` geometric sans)
- **Icons:** Lucide React
- **Architecture:** Centralized configuration via `src/config/brand.config.ts`

---

## Local Development

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`
3. Create a production build:
   `npm run build`

---

## Brand & Configuration
All storefront metadata, owner details, category taxonomy, metal filters, and default payment presets are managed in `src/config/brand.config.ts`.

---

*Engineered and designed by **VERPTO**.*
>>>>>>> 537e617 (Initial commit: Jeswelry storefront and admin)
