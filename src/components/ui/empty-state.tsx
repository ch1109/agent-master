import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Inbox, Search, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * 空状态组件
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6 text-[var(--text-tertiary)]" />}
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// 预设的空状态
export function NoDataState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-6 h-6 text-[var(--text-tertiary)]" />}
      title="暂无数据"
      description="还没有创建任何内容"
      action={onAction ? { label: '立即创建', onClick: onAction } : undefined}
    />
  )
}

export function NoSearchResultState({ keyword }: { keyword: string }) {
  return (
    <EmptyState
      icon={<Search className="w-6 h-6 text-[var(--text-tertiary)]" />}
      title="未找到结果"
      description={`没有找到与"${keyword}"相关的内容`}
    />
  )
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-6 h-6 text-[var(--color-error)]" />}
      title="加载失败"
      description="数据加载出现问题，请稍后重试"
      action={onRetry ? { label: '重试', onClick: onRetry } : undefined}
    />
  )
}

export default EmptyState

