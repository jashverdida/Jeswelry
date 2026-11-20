import jeswelryLogo from '../../assets/jeswelry-logo.png'
import { BRAND_CONFIG } from '../../config/brand.config'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  dark?: boolean
  className?: string
}

const sizes: Record<BrandLogoSize, string> = {
  sm: 'size-8',
  md: 'size-11',
  lg: 'size-20',
}

export function BrandLogo({ size = 'md', dark = false, className = '' }: BrandLogoProps) {
  return (
    <img
      src={jeswelryLogo}
      alt={BRAND_CONFIG.name}
      className={`object-contain ${sizes[size]} ${dark ? 'rounded-full bg-[#181615]' : ''} ${className}`}
    />
  )
}
