import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  animated?: boolean
}

/**
 * 进度条组件
 * 支持平滑过渡和光泽动画
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, animated = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
          <div
            className={cn(
              "h-full rounded-full bg-[var(--color-primary)] transition-all duration-500 ease-out",
              animated && percentage < 100 && "progress-shine relative overflow-hidden"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-[var(--text-secondary)] text-right">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

interface StepProgressProps {
  steps: {
    id: string
    label: string
    status: 'pending' | 'running' | 'completed' | 'error'
    description?: string
  }[]
  className?: string
}

/**
 * 步骤进度组件
 */
function StepProgress({ steps, className }: StepProgressProps) {
  // currentIndex 可用于高亮当前步骤，保留用于未来扩展
  const _currentIndex = steps.findIndex(s => s.status === 'running')
  void _currentIndex

  const completedCount = steps.filter(s => s.status === 'completed').length
  const percentage = (completedCount / steps.length) * 100

  return (
    <div className={cn("space-y-4", className)}>
      {/* 进度条 */}
      <Progress value={percentage} animated />
      
      {/* 步骤列表 */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            {/* 状态指示器 */}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
              step.status === 'completed' && "bg-[var(--color-success)] text-white",
              step.status === 'running' && "bg-[var(--color-primary)] text-white",
              step.status === 'pending' && "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]",
              step.status === 'error' && "bg-[var(--color-error)] text-white"
            )}>
              {step.status === 'completed' ? '✓' : 
               step.status === 'running' ? (
                 <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
               ) : index + 1}
            </div>
            
            {/* 步骤信息 */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm",
                step.status === 'running' && "text-[var(--color-primary)] font-medium",
                step.status === 'completed' && "text-[var(--text-primary)]",
                step.status === 'pending' && "text-[var(--text-tertiary)]"
              )}>
                {step.label}
              </div>
              {step.description && step.status === 'running' && (
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Progress, StepProgress }

