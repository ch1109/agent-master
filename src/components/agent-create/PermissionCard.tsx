import { cn } from '@/lib/utils'
import { CheckCircle2, Shield, ShieldCheck, Rocket } from 'lucide-react'

interface PermissionCardProps {
  icon?: string
  label: string
  description?: string
  features?: string[]
  selected?: boolean
  highlight?: boolean
  recommended?: boolean
  onClick?: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  '🎓': <Shield className="h-5 w-5" />,
  '👔': <ShieldCheck className="h-5 w-5" />,
  '🚀': <Rocket className="h-5 w-5" />,
}

/**
 * 权限等级卡片 - 用于能力装配页面的权限选择
 * 展示权限等级、功能列表
 */
export function PermissionCard({
  icon,
  label,
  description,
  features,
  selected,
  highlight,
  recommended,
  onClick,
}: PermissionCardProps) {
  const IconComponent = icon ? iconMap[icon] : <Shield className="h-5 w-5" />

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-2xl border transition-all',
        'px-4 py-4 backdrop-blur',
        'shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-[1px]',
        selected
          ? 'border-[var(--color-primary)]/60 bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] ring-1 ring-[var(--color-primary)]/30'
          : 'border-[#e3eaf7] bg-white/80',
        highlight && 'ring-2 ring-[var(--color-primary)]/50'
      )}
    >
      {recommended && (
        <span className="absolute -top-2 right-3 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
          推荐
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          selected
            ? 'bg-gradient-to-br from-[#2563eb]/20 to-[#7c3aed]/20 text-[var(--color-primary)]'
            : 'bg-gradient-to-br from-[#f0f4ff] to-[#e8edff] text-[#64748b]'
        )}>
          {IconComponent}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={cn(
              'text-sm font-semibold',
              selected ? 'text-[var(--color-primary)]' : 'text-[#0f172a]'
            )}>
              {label}
            </p>
            {selected && <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />}
          </div>
          {description && (
            <p className="text-xs text-[#64748b] mt-1">{description}</p>
          )}
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {features.map((feature, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px]',
                    selected
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'bg-[#f1f5f9] text-[#64748b]'
                  )}
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default PermissionCard
