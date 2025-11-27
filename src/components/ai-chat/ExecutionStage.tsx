/**
 * AI 执行阶段组件
 * 显示 AI 正在执行的任务进度
 */
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Check, Loader2, Circle } from 'lucide-react'

export type TaskStatus = 'pending' | 'active' | 'completed'

export interface StageTask {
  id: string
  name: string
  status: TaskStatus
  description?: string
}

export interface ExecutionStageProps {
  /** 阶段标题 */
  title: string
  /** 进度百分比 (0-100) */
  progress: number
  /** 任务列表 */
  tasks: StageTask[]
  /** 阶段图标 */
  icon?: ReactNode
  /** 额外的类名 */
  className?: string
}

/**
 * 执行阶段卡片
 * - 阶段标题和进度百分比
 * - 进度条动画
 * - 任务列表（待完成/进行中/已完成）
 */
export function ExecutionStage({
  title,
  progress,
  tasks,
  icon,
  className,
}: ExecutionStageProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border-default)]',
        'rounded-lg p-4 mt-3',
        className
      )}
    >
      {/* 阶段标题 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-base font-medium text-[var(--text-primary)]">
          {icon && <span className="text-lg">{icon}</span>}
          <span>{title}</span>
        </div>
        <span className="text-sm text-[var(--text-secondary)]">
          {Math.round(progress)}%
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-ai-thinking))',
          }}
        />
      </div>

      {/* 任务列表 */}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <StageTaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

/**
 * 单个任务项
 */
interface StageTaskItemProps {
  task: StageTask
}

function StageTaskItem({ task }: StageTaskItemProps) {
  const statusConfig = {
    pending: {
      icon: <Circle className="w-3.5 h-3.5" />,
      className: 'text-[var(--text-tertiary)]',
    },
    active: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      className: 'text-[var(--color-primary)]',
    },
    completed: {
      icon: <Check className="w-3.5 h-3.5" />,
      className: 'text-[var(--color-success)]',
    },
  }

  const config = statusConfig[task.status]

  return (
    <div className={cn('flex items-center gap-2 text-sm', config.className)}>
      {config.icon}
      <span>{task.name}</span>
      {task.description && (
        <span className="text-[var(--text-placeholder)] ml-1">
          - {task.description}
        </span>
      )}
    </div>
  )
}

export default ExecutionStage

