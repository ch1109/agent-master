/**
 * 分隔线组件
 * ChatGPT 极简风格的分隔线
 */
import { cn } from '@/lib/utils'

export interface DividerProps {
  /** 分隔线中间的文字 */
  text?: string
  /** 额外的类名 */
  className?: string
  /** 方向 */
  orientation?: 'horizontal' | 'vertical'
  /** 间距大小 */
  spacing?: 'sm' | 'md' | 'lg'
}

/**
 * 分隔线
 * - 极淡颜色
 * - 可选文字
 */
export function Divider({
  text,
  className,
  orientation = 'horizontal',
  spacing = 'md',
}: DividerProps) {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'my-3' : 'mx-3',
    md: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    lg: orientation === 'horizontal' ? 'my-8' : 'mx-8',
  }

  // 垂直分隔线
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'w-px bg-[var(--border-subtle)] self-stretch',
          spacingClasses[spacing],
          className
        )}
      />
    )
  }

  // 带文字的水平分隔线
  if (text) {
    return (
      <div
        className={cn(
          'flex items-center gap-4',
          spacingClasses[spacing],
          className
        )}
      >
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        <span className="text-sm font-medium text-[var(--text-tertiary)]">
          {text}
        </span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>
    )
  }

  // 普通水平分隔线
  return (
    <hr
      className={cn(
        'border-none h-px bg-[var(--border-subtle)]',
        spacingClasses[spacing],
        className
      )}
    />
  )
}

export default Divider

