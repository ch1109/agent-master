import { cn } from '@/lib/utils'

interface GrowthStage {
  icon: string
  label: string
  description: string
  active?: boolean
}

interface GrowthTimelineProps {
  stages?: GrowthStage[]
  currentStage?: number
}

const defaultStages: GrowthStage[] = [
  { icon: '🥚', label: '创建', description: '诞生' },
  { icon: '📚', label: '学习', description: '积累经验' },
  { icon: '🌿', label: '成长', description: '形成风格' },
  { icon: '🦋', label: '进化', description: '持续优化' },
]

/**
 * 成长轨迹时间线
 * 可视化展示 Agent 的成长阶段
 */
export function GrowthTimeline({
  stages = defaultStages,
  currentStage = 0
}: GrowthTimelineProps) {
  return (
    <div className="relative rounded-2xl border border-[#e3eaf7] bg-gradient-to-br from-white/90 to-[#f8faff]/90 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between">
        {stages.map((stage, idx) => (
          <div key={idx} className="relative flex flex-col items-center">
            {/* 连接线 */}
            {idx < stages.length - 1 && (
              <div
                className={cn(
                  'absolute top-5 left-1/2 h-0.5 w-[calc(100%+2rem)]',
                  idx < currentStage
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#7c3aed]'
                    : 'bg-[#e3eaf7]'
                )}
                style={{ transform: 'translateX(50%)' }}
              />
            )}
            {/* 节点 */}
            <div
              className={cn(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all',
                idx <= currentStage
                  ? 'bg-gradient-to-br from-[#2563eb] to-[#7c3aed] shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
                  : 'bg-[#f1f5f9] shadow-sm'
              )}
            >
              {stage.icon}
            </div>
            {/* 标签 */}
            <p className={cn(
              'mt-2 text-sm font-medium',
              idx <= currentStage ? 'text-[#0f172a]' : 'text-[#94a3b8]'
            )}>
              {stage.label}
            </p>
            <p className={cn(
              'text-xs',
              idx <= currentStage ? 'text-[#64748b]' : 'text-[#cbd5e1]'
            )}>
              {stage.description}
            </p>
            {/* 当前阶段指示 */}
            {idx === currentStage && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                当前阶段
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GrowthTimeline
