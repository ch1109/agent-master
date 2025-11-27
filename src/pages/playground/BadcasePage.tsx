import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, AlertTriangle, Sparkles, Loader2,
  ChevronDown, ChevronUp, MessageSquare, Target, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentStore } from '@/stores/agentStore'
import { cn } from '@/lib/utils'
import { mockBadcases } from '@/data/promptMockData'

// 扩展 Badcase 数据
const extendedBadcases = [
  ...mockBadcases,
  {
    id: 'bc4',
    userInput: '贷款利息怎么算',
    expectedOutput: '提供贷款利息计算方式和示例',
    actualOutput: '请问您想了解哪种贷款产品？',
    category: '回复不完整',
    severity: 'medium' as const,
    promptId: '3',
    createdAt: '2024-01-15',
  },
  {
    id: 'bc5',
    userInput: '我要投诉你们的服务',
    expectedOutput: '表示歉意并引导至投诉流程',
    actualOutput: '好的，请问您遇到了什么问题？',
    category: '情绪处理不当',
    severity: 'high' as const,
    promptId: '4',
    createdAt: '2024-01-14',
  },
]

// 分类统计
const categories = [
  { id: 'intent', label: '意图识别错误', count: 2, icon: Target },
  { id: 'param', label: '参数提取遗漏', count: 1, icon: Zap },
  { id: 'incomplete', label: '回复不完整', count: 2, icon: MessageSquare },
  { id: 'emotion', label: '情绪处理不当', count: 1, icon: AlertTriangle },
]

/**
 * Badcase 分析页面
 */
export function BadcasePage() {
  const navigate = useNavigate()
  const { debugOptions } = useAgentStore()

  const [searchValue, setSearchValue] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedBadcases, setSelectedBadcases] = useState<string[]>([])

  // 过滤 Badcase
  const filteredBadcases = extendedBadcases.filter(bc => {
    const matchSearch = bc.userInput.includes(searchValue) ||
                       bc.expectedOutput.includes(searchValue) ||
                       bc.actualOutput.includes(searchValue)
    const matchSeverity = severityFilter === 'all' || bc.severity === severityFilter
    const matchCategory = categoryFilter === 'all' || bc.category.includes(categoryFilter)
    return matchSearch && matchSeverity && matchCategory
  })

  // 统计数据
  const stats = {
    total: extendedBadcases.length,
    high: extendedBadcases.filter(bc => bc.severity === 'high').length,
    medium: extendedBadcases.filter(bc => bc.severity === 'medium').length,
    low: extendedBadcases.filter(bc => bc.severity === 'low').length,
  }

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // AI 分析 Badcase
  const handleAnalyze = useCallback(async () => {
    if (selectedBadcases.length === 0) return

    setIsAnalyzing(true)
    const mockDelay = debugOptions.mockDelay || 2000

    await delay(mockDelay)

    // 跳转到优化页面
    navigate('/playground/prompt')
    setIsAnalyzing(false)
  }, [selectedBadcases, debugOptions.mockDelay, navigate])

  // 切换展开
  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // 切换选择
  const toggleSelect = (id: string) => {
    setSelectedBadcases(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="error">严重</Badge>
      case 'medium': return <Badge variant="warning">中等</Badge>
      default: return <Badge variant="secondary">轻微</Badge>
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Badcase 分析</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              分析失败案例，找出问题根因并优化提示词
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={selectedBadcases.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              {isAnalyzing ? 'AI 分析中...' : `AI 分析修复 ${selectedBadcases.length > 0 ? `(${selectedBadcases.length})` : ''}`}
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 cursor-pointer" onClick={() => setSeverityFilter('all')}>
              <div className="text-sm text-[var(--text-secondary)]">全部 Badcase</div>
              <div className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats.total}</div>
            </Card>
            <Card className="p-4 cursor-pointer" onClick={() => setSeverityFilter('high')}>
              <div className="text-sm text-[var(--text-secondary)]">严重</div>
              <div className="text-2xl font-semibold text-[var(--color-error)] mt-1">{stats.high}</div>
            </Card>
            <Card className="p-4 cursor-pointer" onClick={() => setSeverityFilter('medium')}>
              <div className="text-sm text-[var(--text-secondary)]">中等</div>
              <div className="text-2xl font-semibold text-[var(--color-warning)] mt-1">{stats.medium}</div>
            </Card>
            <Card className="p-4 cursor-pointer" onClick={() => setSeverityFilter('low')}>
              <div className="text-sm text-[var(--text-secondary)]">轻微</div>
              <div className="text-2xl font-semibold text-[var(--text-tertiary)] mt-1">{stats.low}</div>
            </Card>
          </div>

          {/* 分类统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">问题分类</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.label)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      categoryFilter === cat.label
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                        : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <cat.icon className="w-5 h-5 text-[var(--color-primary)] mb-2" />
                    <div className="text-sm font-medium text-[var(--text-primary)]">{cat.label}</div>
                    <div className="text-lg font-semibold text-[var(--text-primary)] mt-1">{cat.count}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 搜索和筛选 */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索 Badcase..."
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="严重程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="high">严重</SelectItem>
                <SelectItem value="medium">中等</SelectItem>
                <SelectItem value="low">轻微</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSeverityFilter('all'); setCategoryFilter('all') }}
            >
              重置筛选
            </Button>
          </div>

          {/* Badcase 列表 */}
          <div className="space-y-3">
            {filteredBadcases.map((bc, index) => (
              <Card
                key={bc.id}
                className={cn(
                  "transition-all animate-in fade-in slide-in-from-bottom-2",
                  selectedBadcases.includes(bc.id) && "border-[var(--color-primary)]"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* 选择框 */}
                    <input
                      type="checkbox"
                      checked={selectedBadcases.includes(bc.id)}
                      onChange={() => toggleSelect(bc.id)}
                      className="mt-1 w-4 h-4 rounded border-[var(--border-default)]"
                    />

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityBadge(bc.severity)}
                        <Badge variant="secondary">{bc.category}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-[var(--text-tertiary)]">用户输入：</span>
                          <span className="text-sm text-[var(--text-primary)]">{bc.userInput}</span>
                        </div>

                        {expandedIds.includes(bc.id) && (
                          <>
                            <div>
                              <span className="text-xs text-[var(--text-tertiary)]">期望输出：</span>
                              <span className="text-sm text-[var(--color-success)]">{bc.expectedOutput}</span>
                            </div>
                            <div>
                              <span className="text-xs text-[var(--text-tertiary)]">实际输出：</span>
                              <span className="text-sm text-[var(--color-error)]">{bc.actualOutput}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 展开按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(bc.id)}
                    >
                      {expandedIds.includes(bc.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredBadcases.length === 0 && (
              <div className="py-12 text-center text-[var(--text-tertiary)]">
                没有找到匹配的 Badcase
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BadcasePage
