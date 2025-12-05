import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

interface MemoryOptionCardProps {
  icon?: string
  label: string
  description?: string
  selected?: boolean
  highlight?: boolean
  recommended?: boolean
  onClick?: () => void
}

/**
 * 记忆选项卡片
 * 用于记忆功能和自优化功能的选择
 */
export function MemoryOptionCard({
  icon,
  label,
  description,
  selected,
  highlight,
  recommended,
  onClick,
}: MemoryOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-xl border transition-all',
        'px-3 py-3 backdrop-blur',
        'shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:-translate-y-[1px]',
        selected
          ? 'border-[var(--color-primary)]/50 bg-gradient-to-r from-[#f4f7ff] to-[#e8edff]'
          : 'border-[#e3eaf7] bg-white/80 hover:border-[var(--color-primary)]/40',
        highlight && 'ring-2 ring-[var(--color-primary)]/50'
      )}
    >
      {recommended && (
        <span className="absolute -top-2 right-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          推荐
        </span>
      )}
      <div className="flex items-center gap-3">
        {icon && (
          <span className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-lg',
            selected
              ? 'bg-gradient-to-br from-[#2563eb]/20 to-[#7c3aed]/20'
              : 'bg-gradient-to-br from-[#f0f4ff] to-[#e8edff]'
          )}>
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-medium text-sm truncate',
              selected ? 'text-[var(--color-primary)]' : 'text-[#0f172a]'
            )}>
              {label}
            </span>
            {selected && (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
            )}
          </div>
          {description && (
            <p className="text-xs text-[#94a3b8] mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}

export default MemoryOptionCard
