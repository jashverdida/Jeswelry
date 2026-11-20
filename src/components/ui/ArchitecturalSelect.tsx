import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export interface ArchitecturalSelectOption<T extends string> {
  label: string
  value: T
}

interface ArchitecturalSelectProps<T extends string> {
  ariaLabel: string
  value: T
  options: ArchitecturalSelectOption<T>[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange?: (value: T) => void
  triggerLabel?: ReactNode
  className?: string
  multiple?: boolean
  selectedValues?: T[]
  onToggle?: (value: T) => void
}

export function ArchitecturalSelect<T extends string>({
  ariaLabel,
  value,
  options,
  open,
  onOpenChange,
  onChange,
  triggerLabel,
  className = '',
  multiple = false,
  selectedValues = [],
  onToggle,
}: ArchitecturalSelectProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex min-h-[40px] items-center justify-between gap-3 border-b border-stone-300 px-3 text-sm font-medium text-[#141312]"
      >
        <span>{triggerLabel ?? selectedOption?.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role={multiple ? 'group' : 'listbox'}
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-40 min-w-[200px] divide-y divide-[#141312]/[0.08] border border-[#141312]/20 bg-[#FAF8F5] py-1"
        >
          {options.map((option) => {
            const selected = multiple
              ? selectedValues.includes(option.value)
              : option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role={multiple ? 'checkbox' : 'option'}
                aria-checked={multiple ? selected : undefined}
                aria-selected={!multiple ? selected : undefined}
                onClick={() => {
                  if (multiple) onToggle?.(option.value)
                  else {
                    onChange?.(option.value)
                    onOpenChange(false)
                  }
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#141312]/5 ${
                  selected ? 'font-medium text-[#A68246]' : 'text-[#141312]'
                }`}
              >
                <span>{option.label}</span>
                {multiple ? (
                  <span
                    aria-hidden="true"
                    className={`grid size-4 place-items-center border ${
                      selected ? 'border-[#A68246] bg-[#A68246]' : 'border-[#141312]/40 bg-transparent'
                    }`}
                  >
                    {selected && <span className="size-1.5 bg-[#FAF8F5]" />}
                  </span>
                ) : (
                  selected && <span className="size-1.5 rounded-full bg-[#A68246]" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
