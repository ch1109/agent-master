import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Save, GitCompare, CheckCircle, XCircle, Sparkles, Loader2, Edit3, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { CodeEditor } from '@/components/ui/code-editor'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { useAgentStore } from '@/stores/agentStore'
import { mockPrompts, mockBadcases, mockTestCases, promptDiff } from '@/data/promptMockData'

/**
 * 提示词优化详情页
 * 集成 CodeEditor 和 DiffViewer 组件
 */
export function PromptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { debugOptions } = useAgentStore()

  const [prompt, setPrompt] = useState<typeof mockPrompts[0] | null>(null)
  const [activeTab, setActiveTab] = useState('current')
  const [showDiff, setShowDiff] = useState(false)
  const [testRunning, setTestRunning] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState(promptDiff.oldPrompt)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState('')

  useEffect(() => {
    if (id) {
      const found = mockPrompts.find(p => p.id === id)
      setPrompt(found || null)
    }
  }, [id])

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // 模拟测试运行
  const runTest = useCallback(async () => {
    setTestRunning(true)
    setTestProgress(0)

    const mockDelay = debugOptions.mockDelay || 300

    for (let i = 0; i <= 100; i += 10) {
      setTestProgress(i)
      await delay(mockDelay)
    }

    setTestRunning(false)
  }, [debugOptions.mockDelay])

  // AI 优化提示词
  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true)
    const mockDelay = debugOptions.mockDelay || 1500

    await delay(mockDelay)

    setOptimizedPrompt(promptDiff.newPrompt)
    setShowDiff(true)
    setIsOptimizing(false)
  }, [debugOptions.mockDelay])

  // 应用优化结果
  const handleApplyOptimization = () => {
    setEditedPrompt(optimizedPrompt)
    setShowDiff(false)
    setOptimizedPrompt('')
  }

  if (!prompt) {
    return <div className="p-6">加载中...</div>
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/playground/prompt')} className="p-2 rounded-md hover:bg-[var(--bg-hover)]">
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">{prompt.name}</h1>
                <Badge variant="secondary">{prompt.version}</Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">关联意图：{prompt.intent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="text-[var(--color-primary)]"
            >
              {isOptimizing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              {isOptimizing ? 'AI 优化中...' : 'AI 优化'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDiff(!showDiff)}>
              <GitCompare className="w-4 h-4 mr-1" />
              {showDiff ? '隐藏对比' : '查看 Diff'}
            </Button>
            <Button variant="outline" size="sm" onClick={runTest} disabled={testRunning}>
              <Play className="w-4 h-4 mr-1" />
              {testRunning ? `测试中 ${testProgress}%` : '运行测试'}
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-1" />
              发布
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-[var(--text-secondary)]">测试通过率</div>
              <div className="text-2xl font-semibold text-[var(--color-success)] mt-1">{prompt.passRate}%</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-[var(--text-secondary)]">Badcase 数量</div>
              <div className="text-2xl font-semibold text-[var(--color-error)] mt-1">{prompt.badcaseCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-[var(--text-secondary)]">版本号</div>
              <div className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{prompt.version}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-[var(--text-secondary)]">更新时间</div>
              <div className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{prompt.updatedAt}</div>
            </Card>
          </div>

          {/* 测试进度 */}
          {testRunning && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">正在运行测试用例...</span>
                    <span className="text-sm font-medium">{testProgress}%</span>
                  </div>
                  <Progress value={testProgress} className="h-2" />
                </div>
              </div>
            </Card>
          )}

          {/* Diff 对比视图 */}
          {showDiff && optimizedPrompt && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>AI 优化对比</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDiff(false)}>
                    放弃
                  </Button>
                  <Button size="sm" onClick={handleApplyOptimization}>
                    应用优化
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DiffViewer
                  oldCode={editedPrompt}
                  newCode={optimizedPrompt}
                  oldTitle="当前版本"
                  newTitle="AI 优化版本"
                  splitView={true}
                />
              </CardContent>
            </Card>
          )}

          {/* 主内容区 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="current">当前提示词</TabsTrigger>
              <TabsTrigger value="badcases">Badcase ({prompt.badcaseCount})</TabsTrigger>
              <TabsTrigger value="tests">测试用例</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>提示词内容</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-1" />
                        编辑
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <CodeEditor
                    code={editedPrompt}
                    onChange={setEditedPrompt}
                    language="markdown"
                    readOnly={!isEditing}
                    maxHeight="400px"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badcases" className="mt-4">
              <div className="space-y-3">
                {mockBadcases.map((bc) => (
                  <Card key={bc.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={bc.severity === 'high' ? 'error' : bc.severity === 'medium' ? 'warning' : 'secondary'}>
                            {bc.severity === 'high' ? '严重' : bc.severity === 'medium' ? '中等' : '轻微'}
                          </Badge>
                          <span className="text-sm text-[var(--text-secondary)]">{bc.category}</span>
                        </div>
                        <div className="space-y-2">
                          <div><span className="text-xs text-[var(--text-tertiary)]">用户输入：</span><span className="text-sm">{bc.userInput}</span></div>
                          <div><span className="text-xs text-[var(--text-tertiary)]">期望输出：</span><span className="text-sm text-[var(--color-success)]">{bc.expectedOutput}</span></div>
                          <div><span className="text-xs text-[var(--text-tertiary)]">实际输出：</span><span className="text-sm text-[var(--color-error)]">{bc.actualOutput}</span></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tests" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {mockTestCases.map((tc) => (
                      <div key={tc.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                        <div className="flex items-center gap-3">
                          {tc.status === 'passed' 
                            ? <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                            : <XCircle className="w-5 h-5 text-[var(--color-error)]" />
                          }
                          <div>
                            <div className="text-sm text-[var(--text-primary)]">{tc.input}</div>
                            <div className="text-xs text-[var(--text-tertiary)]">{tc.expected}</div>
                          </div>
                        </div>
                        <Badge variant={tc.status === 'passed' ? 'success' : 'error'}>
                          {tc.status === 'passed' ? '通过' : '失败'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default PromptDetailPage

