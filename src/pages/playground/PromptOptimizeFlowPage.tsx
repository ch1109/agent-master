import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, AlertTriangle, Play, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfigTextarea } from '@/components/config'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { mockPrompts, promptDiff, mockTestCases } from '@/data/promptMockData'
import { cn } from '@/lib/utils'

const optimizeSuggestions = [
  { id: 'role', title: '补充角色定位', description: '添加身份、风格等角色设定', recommended: true },
  { id: 'intent', title: '扩展意图识别', description: '支持更多表达方式', recommended: true },
  { id: 'special', title: '添加特殊处理', description: '处理边界情况和异常场景', recommended: false },
  { id: 'template', title: '优化回复模板', description: '根据不同情况给出针对性回复', recommended: false },
]

const diagnosisTimeline = [
  { title: '意图识别', detail: '对话第3轮未正确识别“忘记密码”业务场景', severity: 'high' },
  { title: '提示词版本', detail: '使用旧版本 v2.2，缺少密码重试分支', severity: 'medium' },
  { title: '推理过程', detail: '缺少风险澄清步骤，未进行身份二次确认', severity: 'medium' },
  { title: '工具调用', detail: '未命中验证码发送服务，调用日志为空', severity: 'high' },
]

const testPlan = [
  { title: '测试准备', description: '选择 Badcase + 推荐用例，模型 gpt-4o，温度 0.3' },
  { title: '基准测试', description: '当前版本通过率 78%，失败用例 5 个' },
  { title: '回归测试', description: '优化后预计通过率 92%，重点关注密码找回分支' },
]

const modeLabel: Record<string, string> = {
  badcase: 'Badcase 修复',
  diagnose: '智能诊断',
  enhance: '需求优化',
}

export function PromptOptimizeFlowPage() {
  const { mode = '' } = useParams<{ mode: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const promptId = searchParams.get('prompt') || mockPrompts[0]?.id
  const prompt = useMemo(() => mockPrompts.find(p => p.id === promptId) || mockPrompts[0] || null, [promptId])

  const [stage, setStage] = useState<'idle' | 'baseline' | 'baseline-done' | 'regression' | 'done'>('idle')
  const [selectedBadcases, setSelectedBadcases] = useState(['0127'])
  const [releaseForm, setReleaseForm] = useState({
    version: 'v2.4',
    name: prompt ? `${prompt.name} 优化` : '',
    type: 'Bug修复',
    changelog: '修复密码业务歧义识别问题',
  })

  const baselinePassRate = prompt?.passRate || 0
  const regressionPassRate = Math.min(100, baselinePassRate + 10)
  const passedCount = mockTestCases.filter(t => t.status === 'passed').length
  const baselineResult = { total: 24, pass: 16, fail: 8, time: '1分58秒', passRate: 66.7 }
  const regressionResult = { total: 24, pass: 22, fail: 2, time: '2分03秒', passRate: 91.7 }

  const toggleBadcase = (id: string) => {
    setSelectedBadcases(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  const handleStartBaseline = () => setStage('baseline-done')
  const handleStartRegression = () => setStage('done')

  if (!prompt) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/playground/prompt/optimize')}>
          返回列表
        </Button>
        <p className="mt-4 text-[var(--text-secondary)]">暂无提示词数据</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/playground/prompt/optimize')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回列表
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">提示词优化流程</h1>
                <Badge variant="secondary">{prompt.version}</Badge>
                <Badge variant="secondary">{prompt.intent}</Badge>
                {mode && <Badge>{modeLabel[mode] || '优化模式'}</Badge>}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                针对 “{prompt.name}” 的完整优化旅程，覆盖诊断、方案、测试与发布。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[var(--text-secondary)] text-right">
              <div>基准通过率：<span className="font-medium text-[var(--text-primary)]">{baselinePassRate}%</span></div>
              <div>预期回归：<span className="font-medium text-[var(--color-success)]">{regressionPassRate}%</span></div>
            </div>
            <Badge variant="secondary">{mockTestCases.length} 测试</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* 7天 Badcase 概览 + 选择 */}
        {mode === 'badcase' && (
          <Card>
            <CardHeader>
              <CardTitle>Badcase 修复模式</CardTitle>
              <CardDescription>最近 7 天统计与修复目标选择</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">最近 7 天 Badcase</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">23 个</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">高优 8 · 中优 12 · 低优 3</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">问题类型</p>
                <p className="text-sm text-[var(--text-primary)] mt-1">业务歧义识别失败: 8</p>
                <p className="text-sm text-[var(--text-primary)]">上下文理解错误: 5</p>
                <p className="text-sm text-[var(--text-primary)]">意图匹配不准确: 6</p>
                <p className="text-sm text-[var(--text-primary)]">输出格式错误: 4</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">已选择 Badcase</p>
                <p className="text-2xl font-semibold text-[var(--color-primary)] mt-1">{selectedBadcases.length} 个</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">确认后进入深度诊断</p>
              </div>
              <div className="col-span-3 space-y-3">
                {[
                  { id: '0127', label: 'Badcase #0127 - 用户说“修改密码”', desc: '问题：未二次确认，直接跳转错误页面', priority: '高优' },
                  { id: '0129', label: 'Badcase #0129 - 用户说“查积分”', desc: '问题：未列出积分服务子选项', priority: '高优' },
                  { id: '0131', label: 'Badcase #0131 - 用户说“帮你”', desc: '问题：识别错误未容错', priority: '高优' },
                  { id: '0133', label: 'Badcase #0133 - “我要转账还要查询”', desc: '问题：未拦截多需求', priority: '中优' },
                ].map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-lg border flex items-start justify-between gap-3",
                      selectedBadcases.includes(item.id)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                        : "border-[var(--border-default)]"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.priority === '高优' ? 'destructive' : 'default'}>{item.priority}</Badge>
                        <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBadcases.includes(item.id)}
                      onChange={() => toggleBadcase(item.id)}
                      className="mt-1 w-4 h-4"
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setStage('idle')} disabled={selectedBadcases.length === 0}>
                    确认选择
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 问题诊断区（仅 Badcase 模式） */}
        {mode === 'badcase' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />
                问题诊断区
              </CardTitle>
              <CardDescription>对话上下文、推理过程和根因分析</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {diagnosisTimeline.map(item => (
                  <div key={item.title} className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={item.severity === 'high' ? 'destructive' : 'default'}>{item.title}</Badge>
                      <span className="text-xs text-[var(--text-tertiary)]">严重度: {item.severity}</span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">诊断报告</p>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• 问题类型：业务歧义识别失败</li>
                  <li>• 影响范围：密码重置流程 / 高优先</li>
                  <li>• 根因分析：缺少澄清与工具调用校验</li>
                  <li>• 推荐修复：补充身份确认、增加验证码重试</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 优化方案生成区 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              优化方案生成区
            </CardTitle>
            <CardDescription>AI 优化建议，多选后可生成优化后提示词</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {optimizeSuggestions.map(item => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  item.recommended ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]" : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-[var(--text-primary)]">{item.title}</p>
                  {item.recommended && <Badge variant="secondary">推荐</Badge>}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
              </div>
            ))}
            <div className="col-span-2 flex justify-end mt-2">
              <Button size="sm">
                <Sparkles className="w-4 h-4 mr-1" />
                AI 一键生成优化提示词
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 测试与验证区 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              测试与验证区
            </CardTitle>
            <CardDescription>测试准备 → 基准测试 → 回归测试</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {testPlan.map((phase, idx) => (
                <div key={phase.title} className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                  <p className="text-xs text-[var(--text-tertiary)]">阶段 {idx + 1}</p>
                  <p className="font-medium text-[var(--text-primary)] mt-1">{phase.title}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{phase.description}</p>
                </div>
              ))}
            </div>

            <Card className="border-[var(--border-default)]">
              <CardHeader>
                <CardTitle className="text-sm">测试准备与参数</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 text-sm text-[var(--text-secondary)]">
                <div>
                  <p className="font-medium text-[var(--text-primary)] mb-1">测试用例集</p>
                  <ul className="space-y-1">
                    <li>☑ Badcase #0127 + 相关 8 个场景</li>
                    <li>☑ 密码业务标准用例 15 个</li>
                    <li>☐ 完整回归测试集 (200)</li>
                    <li>☐ 核心业务场景集 (50)</li>
                    <li>☐ 边缘场景测试集 (30)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)] mb-1">测试参数</p>
                  <ul className="space-y-1">
                    <li>◉ 模型: claude-sonnet-4-20250514</li>
                    <li>◉ 温度: 0.3 (稳定)</li>
                    <li>◉ 策略: 严格匹配 (action 必须一致)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)] mb-1">流程预览</p>
                  <p>阶段1: 基准测试 (v2.3) 约2分钟</p>
                  <p>阶段2: 回归测试 (v2.4) 约2分钟</p>
                  <p>阶段3: 对比分析 (通过率/修复/预警)</p>
                  <p className="text-[var(--text-tertiary)] mt-1">测试在模拟环境，不影响生产</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleStartBaseline}>
                确认开始测试
              </Button>
              <Button size="sm" onClick={handleStartRegression} disabled={stage === 'idle' || stage === 'baseline'}>
                <Play className="w-3 h-3 mr-1" />
                继续回归测试
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-[var(--border-default)]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    阶段1: 基准测试
                    {stage === 'baseline-done' || stage === 'regression' || stage === 'done'
                      ? <Badge variant="secondary">完成</Badge>
                      : stage === 'baseline'
                        ? <Badge variant="outline">进行中</Badge>
                        : <Badge variant="secondary">待开始</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>版本: v2.3 (优化前)</p>
                  {stage === 'baseline' && <p>进度: 45% · 正在执行用例 #12</p>}
                  {(stage === 'baseline-done' || stage === 'regression' || stage === 'done') && (
                    <>
                      <p>结果: 通过 {baselineResult.pass}/{baselineResult.total} （{baselineResult.passRate}%）</p>
                      <p>失败分类: 歧义识别失败 5 · 上下文错误 2 · 其他 1</p>
                      <p>耗时: {baselineResult.time}</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[var(--border-default)]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    阶段2: 回归测试
                    {stage === 'done'
                      ? <Badge variant="secondary">完成</Badge>
                      : stage === 'regression'
                        ? <Badge variant="outline">进行中</Badge>
                        : <Badge variant="secondary">待开始</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>版本: v2.4 (优化后)</p>
                  {stage === 'regression' && <p>进度: 58% · 正在执行用例 #15</p>}
                  {stage === 'done' && (
                    <>
                      <p>结果: 通过 {regressionResult.pass}/{regressionResult.total} （{regressionResult.passRate}%）</p>
                      <p>关键改善: 用例#07 已修复</p>
                      <p>耗时: {regressionResult.time}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 对比分析与发布区 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              对比分析与发布
            </CardTitle>
            <CardDescription>Diff 对比、测试对比与版本发布信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DiffViewer
              oldCode={promptDiff.oldPrompt}
              newCode={promptDiff.newPrompt}
              oldTitle="当前版本"
              newTitle="优化后"
              splitView
            />
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">基准通过率</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{baselinePassRate}%</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">回归通过率</p>
                <p className="text-2xl font-semibold text-[var(--color-success)] mt-1">{regressionPassRate}%</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm text-[var(--text-secondary)]">用例修复</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{passedCount}/{mockTestCases.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">版本号</p>
                  <Input value={releaseForm.version} onChange={(e) => setReleaseForm(prev => ({ ...prev, version: e.target.value }))} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">版本名称</p>
                  <Input placeholder="请输入版本名称" value={releaseForm.name} onChange={(e) => setReleaseForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">版本类型</p>
                  <Input value={releaseForm.type} onChange={(e) => setReleaseForm(prev => ({ ...prev, type: e.target.value }))} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">变更日志 / 发布说明</p>
                <ConfigTextarea
                  value={releaseForm.changelog}
                  onChange={(e) => setReleaseForm(prev => ({ ...prev, changelog: e.target.value }))}
                  rows={7}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/playground/prompt/optimize')}>保存草稿</Button>
              <Button>保存并发布</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PromptOptimizeFlowPage
