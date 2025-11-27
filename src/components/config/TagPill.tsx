/**
 * Pill 形标签按钮组件
 * ChatGPT 风格的特性标签
 */
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Check } from 'lucide-react'

export interface TagPillProps {
  /** 标签文本 */
  label: string
  /** 是否激活状态 */
  active?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 自定义图标（替代默认的+/✓） */
  icon?: ReactNode
  /** 禁用状态 */
  disabled?: boolean
  /** 额外的类名 */
  className?: string
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Pill 形标签按钮
 * - 完全圆角
 * - 极淡边框
 * - 带+号和✓号状态切换
 */
export function TagPill({
  label,
  active = false,
  onClick,
  icon,
  disabled = false,
  className,
  size = 'md',
}: TagPillProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  // 默认图标
  const defaultIcon = active ? (
    <Check className={cn(iconSizes[size], 'text-[var(--color-primary)]')} />
  ) : (
    <Plus className={cn(iconSizes[size], 'text-[var(--text-secondary)]')} />
  )

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // 基础样式
        'inline-flex items-center font-normal',
        'border rounded-full cursor-pointer',
        'transition-all duration-150',
        // 尺寸
        sizeClasses[size],
        // 状态样式
        active
          ? [
              'bg-[var(--color-primary-muted)]',
              'text-[var(--color-primary)]',
              'border-[var(--color-primary-border)]',
            ]
          : [
              'bg-[var(--bg-secondary)]',
              'text-[var(--text-primary)]',
              'border-[var(--border-subtle)]',
              'hover:bg-[var(--bg-hover)]',
              'hover:border-[var(--border-default)]',
            ],
        // 禁用状态
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {icon || defaultIcon}
      <span>{label}</span>
    </button>
  )
}

/**
 * 标签组容器
 */
export interface TagPillGroupProps {
  children: ReactNode
  className?: string
}

export function TagPillGroup({ children, className }: TagPillGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  )
}

export default TagPill

