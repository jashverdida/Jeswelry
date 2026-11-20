import { Check } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

export function Toast() {
  const visible = useToastStore((state) => state.visible)
  const message = useToastStore((state) => state.message)
  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 border border-[#B4925A]/40 bg-[#1C1917] px-5 py-3 text-xs text-[#FAF8F5] shadow-xl">
      <Check size={14} className="text-[#E6C78E]" />
      {message}
    </div>
  )
}
