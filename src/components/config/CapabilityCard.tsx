/**
 * 能力卡片组件
 * ChatGPT capabilities 风格的开关卡片
 */
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CapabilityCardProps {
  /** 图标 */
  icon: ReactNode
  /** 能力名称 */
  name: string
  /** 能力描述 */
  description?: string
  /** 是否启用 */
  enabled: boolean
  /** 切换回调 */
  onToggle: () => void
  /** 禁用交互 */
  disabled?: boolean
  /** 额外的类名 */
  className?: string
}

/**
 * 能力开关卡片
 * - 左侧图标
 * - 中间名称和描述
 * - 右侧勾选框
 */
export function CapabilityCard({
  icon,
  name,
  description,
  enabled,
  onToggle,
  disabled = false,
  className,
}: CapabilityCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        // 基础样式
        'w-full flex items-center gap-3',
        'px-4 py-3',
        'bg-[var(--bg-surface)]',
        'border rounded-lg',
        'cursor-pointer',
        'transition-all duration-150',
        'text-left',
        // 边框颜色
        enabled
          ? 'border-[var(--color-primary)]'
          : 'border-[var(--border-default)]',
        // hover 效果
        !disabled && 'hover:bg-[var(--bg-secondary)]',
        // 禁用状态
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* 图标 */}
      <div className={cn(
        'w-5 h-5 flex-shrink-0',
        enabled ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'
      )}>
        {icon}
      </div>

      {/* 名称和描述 */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'text-base font-medium',
          enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
        )}>
          {name}
        </div>
        {description && (
          <div className="text-sm text-[var(--text-tertiary)] mt-0.5 truncate">
            {description}
          </div>
        )}
      </div>

      {/* 勾选框 */}
      <div className={cn(
        'w-[18px] h-[18px] rounded flex-shrink-0',
        'flex items-center justify-center',
        'transition-all duration-150',
        enabled
          ? 'bg-[var(--color-primary)]'
          : 'bg-transparent border-[1.5px] border-[var(--border-default)]'
      )}>
        {enabled && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  )
}

/**
 * 能力卡片组容器
 */
export interface CapabilityCardGroupProps {
  children: ReactNode
  className?: string
  /** 列数 */
  columns?: 1 | 2 | 3
}

export function CapabilityCardGroup({ 
  children, 
  className,
  columns = 1 
}: CapabilityCardGroupProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('grid gap-3', gridClasses[columns], className)}>
      {children}
    </div>
  )
}

export default CapabilityCard

