interface Capability {
  icon: string
  text: string
}

interface OptimizationCapabilitiesProps {
  capabilities: Capability[]
}

/**
 * 自优化能力展示组件
 * 展示 Agent 的自动学习和优化能力列表
 */
export function OptimizationCapabilities({ capabilities }: OptimizationCapabilitiesProps) {
  return (
    <div className="rounded-xl border border-[#e3eaf7] bg-gradient-to-br from-white/90 to-[#f8faff]/90 p-4">
      <p className="text-xs font-medium text-[#64748b] mb-3">开启后，Agent 将具备以下能力：</p>
      <div className="space-y-2">
        {capabilities.map((capability, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-[#475569]"
          >
            <span className="text-base">{capability.icon}</span>
            <span>{capability.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OptimizationCapabilities
