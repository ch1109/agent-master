import { cn } from '@/lib/utils'
import { CheckCircle2 } from 'lucide-react'

interface ScenarioCardProps {
  icon?: string
  label: string
  description?: string
  platforms?: string[]
  selected?: boolean
  highlight?: boolean
  onClick?: () => void
}

/**
 * 应用场景卡片
 * 展示部署平台和场景信息
 */
export function ScenarioCard({
  icon,
  label,
  description,
  platforms,
  selected,
  highlight,
  onClick,
}: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-2xl border transition-all',
        'p-4 backdrop-blur',
        'shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-[1px]',
        selected
          ? 'border-[var(--color-primary)]/60 bg-gradient-to-br from-[#f4f7ff] to-[#e8edff] ring-1 ring-[var(--color-primary)]/30'
          : 'border-[#e3eaf7] bg-white/80 hover:border-[var(--color-primary)]/40',
        highlight && 'ring-2 ring-[var(--color-primary)]/50'
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-colors',
            selected
              ? 'bg-gradient-to-br from-[#2563eb]/20 to-[#7c3aed]/20'
              : 'bg-gradient-to-br from-[#f0f4ff] to-[#e8edff]'
          )}>
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={cn(
              'text-sm font-semibold truncate',
              selected ? 'text-[var(--color-primary)]' : 'text-[#0f172a]'
            )}>
              {label}
            </p>
            {selected && (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
            )}
          </div>
          {description && (
            <p className="text-xs text-[#64748b] mt-1">{description}</p>
          )}
          {platforms && platforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {platforms.map((platform, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px]',
                    selected
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'bg-[#f1f5f9] text-[#64748b]'
                  )}
                >
                  {platform}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default ScenarioCard
