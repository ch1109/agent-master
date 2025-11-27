import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Play, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface TestResult {
  id: string
  input: string
  expected: string
  actual?: string
  status: 'passed' | 'failed' | 'pending' | 'running'
  duration?: number
  error?: string
}

export interface TestResultListProps {
  results: TestResult[]
  title?: string
  showProgress?: boolean
  progress?: number
  onRunTest?: (id: string) => void
  onRunAll?: () => void
  className?: string
}

/**
 * 测试结果列表组件
 * 用于显示测试用例的执行结果
 */
export function TestResultList({
  results,
  title = '测试结果',
  showProgress = false,
  progress = 0,
  onRunTest,
  onRunAll,
  className,
}: TestResultListProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([])

  // 统计数据
  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    pending: results.filter(r => r.status === 'pending').length,
    running: results.filter(r => r.status === 'running').length,
  }

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0

  // 切换展开
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
      case 'failed': return <XCircle className="w-4 h-4 text-[var(--color-error)]" />
      case 'running': return <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      default: return <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge variant="success">通过</Badge>
      case 'failed': return <Badge variant="error">失败</Badge>
      case 'running': return <Badge variant="default">运行中</Badge>
      default: return <Badge variant="secondary">待测</Badge>
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-success)]">{stats.passed} 通过</span>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--color-error)]">{stats.failed} 失败</span>
            <span className="text-[var(--text-tertiary)]">/</span>
            <span className="text-[var(--text-tertiary)]">{stats.pending + stats.running} 待测</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm font-medium",
            passRate >= 90 ? "text-[var(--color-success)]" : 
            passRate >= 70 ? "text-[var(--color-warning)]" : "text-[var(--color-error)]"
          )}>
            通过率: {passRate}%
          </span>
          {onRunAll && (
            <Button variant="outline" size="sm" onClick={onRunAll}>
              <Play className="w-4 h-4 mr-1" />
              运行全部
            </Button>
          )}
        </div>
      </div>

      {/* 进度条 */}
      {showProgress && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-[var(--text-tertiary)] text-right">{progress}%</p>
        </div>
      )}

      {/* 结果列表 */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={result.id}
            className={cn(
              "rounded-lg border transition-all animate-in fade-in slide-in-from-bottom-1",
              result.status === 'failed' 
                ? "border-[var(--color-error)]/30 bg-[var(--color-error-muted)]"
                : "border-[var(--border-default)] bg-[var(--bg-surface)]"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div 
              className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => toggleExpand(result.id)}
            >
              {getStatusIcon(result.status)}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[var(--text-primary)] truncate">{result.input}</div>
              </div>
              {result.duration && (
                <span className="text-xs text-[var(--text-tertiary)]">{result.duration}ms</span>
              )}
              {getStatusBadge(result.status)}
              {expandedIds.includes(result.id) ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
              )}
            </div>
            
            {/* 展开详情 */}
            {expandedIds.includes(result.id) && (
              <div className="px-3 pb-3 pt-0 space-y-2 border-t border-[var(--border-subtle)]">
                <div className="pt-3">
                  <span className="text-xs text-[var(--text-tertiary)]">期望结果：</span>
                  <p className="text-sm text-[var(--color-success)]">{result.expected}</p>
                </div>
                {result.actual && (
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)]">实际结果：</span>
                    <p className={cn(
                      "text-sm",
                      result.status === 'passed' ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                    )}>{result.actual}</p>
                  </div>
                )}
                {result.error && (
                  <div className="flex items-start gap-2 p-2 rounded bg-[var(--color-error-muted)]">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--color-error)]">{result.error}</p>
                  </div>
                )}
                {onRunTest && (
                  <div className="flex justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => onRunTest(result.id)}>
                      <Play className="w-3 h-3 mr-1" />
                      重新运行
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestResultList

