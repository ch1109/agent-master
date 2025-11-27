/**
 * AI 消息内的选项卡片组件
 * 用于 AI 提供选项让用户选择
 */
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface OptionCardProps {
  /** 图标 */
  icon?: ReactNode
  /** 选项标题 */
  title: string
  /** 选项描述 */
  description?: string
  /** 是否选中 */
  selected?: boolean
  /** 是否推荐 */
  recommended?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 禁用状态 */
  disabled?: boolean
  /** 额外的类名 */
  className?: string
}

/**
 * AI 选项卡片
 * - 左侧图标 + 右侧内容
 * - hover 和 selected 状态
 * - 支持推荐标签
 */
export function OptionCard({
  icon,
  title,
  description,
  selected = false,
  recommended = false,
  onClick,
  disabled = false,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // 基础样式
        'w-full flex items-start gap-3 p-3',
        'bg-[var(--bg-overlay)] border rounded-lg',
        'text-left cursor-pointer',
        'transition-all duration-150',
        // 边框和背景状态
        selected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)]'
          : 'border-[var(--border-default)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-muted)]',
        // 禁用状态
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* 图标 */}
      {icon && (
        <div className="w-5 h-5 flex-shrink-0 text-[var(--color-primary)]">
          {icon}
        </div>
      )}

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-[var(--text-primary)]">
            {title}
          </span>
          {recommended && (
            <span className="text-xs px-1.5 py-0.5 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded">
              推荐
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* 选中指示 */}
      {selected && (
        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}

/**
 * 选项卡片组容器
 */
export interface OptionCardGroupProps {
  children: ReactNode
  className?: string
}

export function OptionCardGroup({ children, className }: OptionCardGroupProps) {
  return (
    <div className={cn('flex flex-col gap-2 mt-3', className)}>
      {children}
    </div>
  )
}

export default OptionCard

