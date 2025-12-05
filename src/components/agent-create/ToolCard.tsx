import { cn } from '@/lib/utils'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface ToolCardProps {
  icon?: string
  label: string
  description?: string
  selected?: boolean
  highlight?: boolean
  recommended?: boolean
  onClick?: () => void
}

/**
 * 工具卡片 - 用于能力装配页面的工具选择
 * 游戏化装备风格，带有图标、推荐标识
 */
export function ToolCard({
  icon,
  label,
  description,
  selected,
  highlight,
  recommended,
  onClick,
}: ToolCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl border transition-all',
        'px-4 py-3.5 text-left backdrop-blur',
        'shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-[1px]',
        selected
          ? 'border-[var(--color-primary)]/60 bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] ring-1 ring-[var(--color-primary)]/30'
          : 'border-[#e3eaf7] bg-white/80',
        highlight && 'ring-2 ring-[var(--color-primary)]/50'
      )}
    >
      {recommended && (
        <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          <Sparkles className="h-3 w-3" /> 推荐
        </span>
      )}
      <div className={cn(
        'flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-colors',
        selected
          ? 'bg-gradient-to-br from-[#2563eb]/20 to-[#7c3aed]/20'
          : 'bg-gradient-to-br from-[#f0f4ff] to-[#e8edff]'
      )}>
        {icon || '🔧'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-semibold truncate',
          selected ? 'text-[var(--color-primary)]' : 'text-[#0f172a]'
        )}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#64748b] mt-0.5 truncate">{description}</p>
        )}
      </div>
      {selected && (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
      )}
    </button>
  )
}

export default ToolCard
