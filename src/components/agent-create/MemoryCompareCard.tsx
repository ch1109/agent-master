import { MessageCircle, Bot } from 'lucide-react'

interface MemoryCompareCardProps {
  withoutMemory: { user: string; agent: string }
  withMemory: { user: string; agent: string }
}

/**
 * 记忆功能对比卡片
 * 展示开启/关闭记忆功能时的对话效果差异
 */
export function MemoryCompareCard({ withoutMemory, withMemory }: MemoryCompareCardProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* 未开启记忆 */}
      <div className="rounded-xl border border-[#fecaca]/50 bg-gradient-to-br from-red-50/80 to-orange-50/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm">
            💭
          </span>
          <span className="text-xs font-medium text-red-600">未开启记忆</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 mt-0.5 text-[#64748b]" />
            <p className="text-xs text-[#475569] bg-white/60 rounded-lg px-2 py-1.5">
              {withoutMemory.user}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Bot className="h-4 w-4 mt-0.5 text-red-400" />
            <p className="text-xs text-red-600 bg-white/60 rounded-lg px-2 py-1.5">
              {withoutMemory.agent}
            </p>
          </div>
        </div>
      </div>

      {/* 开启记忆 */}
      <div className="rounded-xl border border-[#bbf7d0]/50 bg-gradient-to-br from-green-50/80 to-emerald-50/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm">
            🧠
          </span>
          <span className="text-xs font-medium text-green-600">开启记忆</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 mt-0.5 text-[#64748b]" />
            <p className="text-xs text-[#475569] bg-white/60 rounded-lg px-2 py-1.5">
              {withMemory.user}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Bot className="h-4 w-4 mt-0.5 text-green-500" />
            <p className="text-xs text-green-700 bg-white/60 rounded-lg px-2 py-1.5">
              {withMemory.agent}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryCompareCard
