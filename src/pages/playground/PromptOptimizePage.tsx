import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, AlertTriangle, Wrench, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { mockPrompts } from '@/data/promptMockData'
import { cn } from '@/lib/utils'

const modeCards = [
  {
    id: 'badcase',
    icon: AlertTriangle,
    title: '🐛 Badcase 修复模式',
    scene: '发现具体问题案例需要修复',
    input: '选择 Badcase 对话记录',
    focus: '针对性修复，避免回归',
  },
  {
    id: 'diagnose',
    icon: ShieldCheck,
    title: '🔍 智能诊断模式',
    scene: '系统性排查潜在问题',
    input: '选择诊断范围',
    focus: '全面优化，提升整体表现',
  },
  {
    id: 'enhance',
    icon: Wrench,
    title: '✏️ 需求优化模式',
    scene: '新增功能或调整策略',
    input: '描述优化需求',
    focus: '功能增强或策略调整',
  },
]

export function PromptOptimizePage() {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(mockPrompts[0]?.id || null)
  const [searchValue, setSearchValue] = useState('')
  const projects = [
    { id: 'bank', name: '重庆银行信用卡导航助手', promptIds: mockPrompts.map(p => p.id) },
    { id: 'insurance', name: '保险智能助手', promptIds: [] },
  ]
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '')

  const filteredPrompts = mockPrompts.filter(p => {
    const inProject = projects.find(proj => proj.id === selectedProject)?.promptIds || mockPrompts.map(mp => mp.id)
    return inProject.includes(p.id) && (p.name.includes(searchValue) || p.intent.includes(searchValue))
  })

  const currentPrompt = useMemo(
    () => mockPrompts.find(p => p.id === selectedPrompt) || mockPrompts[0],
    [selectedPrompt]
  )

  const handleConfirm = () => {
    if (!selectedMode || !selectedPrompt) return
    navigate(`/playground/prompt/optimize/${selectedMode}?prompt=${selectedPrompt}`)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">提示词优化中心</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              请选择优化模式，右侧 AI 助手将驱动诊断与优化，测试结果填充在中间区域。
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleConfirm} disabled={!selectedMode || !selectedPrompt}>
            <ArrowRight className="w-4 h-4 mr-1" />
            进入优化流程
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>选择提示词</CardTitle>
            <CardDescription>切换项目可查看对应提示词列表</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <p className="text-sm text-[var(--text-secondary)] mb-1">项目</p>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg-surface)]"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="搜索提示词..."
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredPrompts.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt.id)}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-all",
                    selectedPrompt === prompt.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                      : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{prompt.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">{prompt.intent}</p>
                    </div>
                    <Badge variant="secondary">{prompt.version}</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">通过率 {prompt.passRate}% · {prompt.badcaseCount} 个 Badcase</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              当前提示词信息
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">当前项目</p>
              <p className="font-semibold text-[var(--text-primary)] mt-1">
                {projects.find(p => p.id === selectedProject)?.name || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">提示词版本</p>
              <p className="font-semibold text-[var(--text-primary)] mt-1">{currentPrompt?.version || 'v1.0'}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">最近更新: {currentPrompt?.updatedAt || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">当前通过率</p>
              <p className="font-semibold text-[var(--text-primary)] mt-1">
                {currentPrompt?.passRate ?? '--'}%
                <Badge variant="secondary" className="ml-2">目标 90%</Badge>
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">关联意图</p>
              <p className="font-semibold text-[var(--text-primary)] mt-1">{currentPrompt?.intent || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>选择优化模式</CardTitle>
            <CardDescription>点击模式后可直接进入对应流程页</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {modeCards.map(mode => {
              const Icon = mode.icon
              const active = selectedMode === mode.id
              return (
                <div
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all h-full",
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] ring-2 ring-[var(--color-primary)] ring-opacity-30"
                      : "border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                    <span className="font-medium text-[var(--text-primary)]">{mode.title}</span>
                    {active && <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] ml-auto" />}
                  </div>
                  <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                    <li>• 适用场景: {mode.scene}</li>
                    <li>• 输入要求: {mode.input}</li>
                    <li>• 优化重点: {mode.focus}</li>
                  </ul>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleConfirm} disabled={!selectedMode || !selectedPrompt}>
            进入 {selectedMode ? modeCards.find(m => m.id === selectedMode)?.title : '优化流程'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PromptOptimizePage
