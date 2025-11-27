import { useState, useCallback } from 'react'
import {
  Search, Plus, Play, CheckCircle, XCircle, Clock,
  Trash2, Edit3, Copy, Loader2, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentStore } from '@/stores/agentStore'
import { cn } from '@/lib/utils'
import { mockTestCases } from '@/data/promptMockData'

// 扩展测试用例数据
const extendedTestCases = [
  ...mockTestCases,
  { id: 't6', input: '看看我的账户', expected: '触发余额查询意图', status: 'passed' as const, promptId: '1' },
  { id: 't7', input: '转账给张三100元', expected: '触发转账意图', status: 'passed' as const, promptId: '2' },
  { id: 't8', input: '我想贷款买房', expected: '触发贷款咨询意图', status: 'failed' as const, promptId: '3' },
  { id: 't9', input: '投诉客服态度差', expected: '触发投诉意图', status: 'passed' as const, promptId: '4' },
  { id: 't10', input: '怎么开通网银', expected: '触发开户意图', status: 'pending' as const, promptId: '1' },
]

/**
 * 测试用例管理页面
 */
export function TestCasePage() {
  const { debugOptions } = useAgentStore()

  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)

  // 过滤测试用例
  const filteredCases = extendedTestCases.filter(tc => {
    const matchSearch = tc.input.includes(searchValue) || tc.expected.includes(searchValue)
    const matchStatus = statusFilter === 'all' || tc.status === statusFilter
    return matchSearch && matchStatus
  })

  // 统计数据
  const stats = {
    total: extendedTestCases.length,
    passed: extendedTestCases.filter(tc => tc.status === 'passed').length,
    failed: extendedTestCases.filter(tc => tc.status === 'failed').length,
    pending: extendedTestCases.filter(tc => tc.status === 'pending').length,
  }

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // 运行测试
  const handleRunTests = useCallback(async () => {
    const casesToRun = selectedCases.length > 0 ? selectedCases : filteredCases.map(c => c.id)
    if (casesToRun.length === 0) return

    setIsRunning(true)
    setRunProgress(0)

    const mockDelay = debugOptions.mockDelay || 200

    for (let i = 0; i <= 100; i += Math.ceil(100 / casesToRun.length)) {
      setRunProgress(Math.min(i, 100))
      await delay(mockDelay)
    }

    setRunProgress(100)
    await delay(500)
    setIsRunning(false)
    setSelectedCases([])
  }, [selectedCases, filteredCases, debugOptions.mockDelay])

  // 切换选择
  const toggleSelect = (id: string) => {
    setSelectedCases(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedCases.length === filteredCases.length) {
      setSelectedCases([])
    } else {
      setSelectedCases(filteredCases.map(c => c.id))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
      case 'failed': return <XCircle className="w-4 h-4 text-[var(--color-error)]" />
      default: return <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge variant="success">通过</Badge>
      case 'failed': return <Badge variant="error">失败</Badge>
      default: return <Badge variant="secondary">待测</Badge>
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">测试用例管理</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              管理和运行 Agent 的测试用例
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              新建用例
            </Button>
            <Button
              size="sm"
              onClick={handleRunTests}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              {isRunning ? `运行中 ${runProgress}%` : selectedCases.length > 0 ? `运行选中 (${selectedCases.length})` : '运行全部'}
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 cursor-pointer hover:border-[var(--color-primary)]" onClick={() => setStatusFilter('all')}>
              <div className="text-sm text-[var(--text-secondary)]">全部用例</div>
              <div className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats.total}</div>
            </Card>
            <Card className="p-4 cursor-pointer hover:border-[var(--color-success)]" onClick={() => setStatusFilter('passed')}>
              <div className="text-sm text-[var(--text-secondary)]">通过</div>
              <div className="text-2xl font-semibold text-[var(--color-success)] mt-1">{stats.passed}</div>
            </Card>
            <Card className="p-4 cursor-pointer hover:border-[var(--color-error)]" onClick={() => setStatusFilter('failed')}>
              <div className="text-sm text-[var(--text-secondary)]">失败</div>
              <div className="text-2xl font-semibold text-[var(--color-error)] mt-1">{stats.failed}</div>
            </Card>
            <Card className="p-4 cursor-pointer hover:border-[var(--text-tertiary)]" onClick={() => setStatusFilter('pending')}>
              <div className="text-sm text-[var(--text-secondary)]">待测试</div>
              <div className="text-2xl font-semibold text-[var(--text-tertiary)] mt-1">{stats.pending}</div>
            </Card>
          </div>

          {/* 运行进度 */}
          {isRunning && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">正在运行测试用例...</span>
                    <span className="text-sm font-medium">{runProgress}%</span>
                  </div>
                  <Progress value={runProgress} className="h-2" />
                </div>
              </div>
            </Card>
          )}

          {/* 搜索和筛选 */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索测试用例..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="passed">通过</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="pending">待测</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 测试用例列表 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>测试用例列表</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedCases.length === filteredCases.length ? '取消全选' : '全选'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredCases.map((tc, index) => (
                  <div
                    key={tc.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-all",
                      "animate-in fade-in slide-in-from-bottom-2",
                      selectedCases.includes(tc.id)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* 选择框 */}
                    <input
                      type="checkbox"
                      checked={selectedCases.includes(tc.id)}
                      onChange={() => toggleSelect(tc.id)}
                      className="w-4 h-4 rounded border-[var(--border-default)]"
                    />

                    {/* 状态图标 */}
                    {getStatusIcon(tc.status)}

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--text-primary)] truncate">
                        {tc.input}
                      </div>
                      <div className="text-sm text-[var(--text-tertiary)] mt-1">
                        期望: {tc.expected}
                      </div>
                    </div>

                    {/* 状态标签 */}
                    {getStatusBadge(tc.status)}

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-[var(--color-error)]">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredCases.length === 0 && (
                  <div className="py-12 text-center text-[var(--text-tertiary)]">
                    没有找到匹配的测试用例
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TestCasePage

