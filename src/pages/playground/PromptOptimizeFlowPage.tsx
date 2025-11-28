import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, AlertTriangle, Play, FileText, GitBranch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfigTextarea } from '@/components/config'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { mockPrompts, promptDiff, mockTestCases } from '@/data/promptMockData'
import { cn } from '@/lib/utils'

type DiagnosisNode = {
  id: string
  label: string
  description: string
  type?: 'user' | 'assistant' | 'warning'
  children?: DiagnosisNode[]
}

const optimizeSuggestions = [
  { id: 'role', title: '补充角色定位', description: '添加身份、风格等角色设定', recommended: true },
  { id: 'intent', title: '扩展意图识别', description: '支持更多表达方式', recommended: true },
  { id: 'special', title: '添加特殊处理', description: '处理边界情况和异常场景', recommended: false },
  { id: 'template', title: '优化回复模板', description: '根据不同情况给出针对性回复', recommended: false },
]

const diagnosisContextTree: DiagnosisNode[] = [
  {
    id: 'dialogue',
    label: '对话轨迹',
    description: '3 轮对话 · 发生在密码找回流程',
    children: [
      { id: 'u1', label: '用户 @T0', description: '“我忘记密码了，想改一下”', type: 'user' },
      { id: 'bot1', label: '助手 @T1', description: '直接给出密码修改入口，未确认身份', type: 'assistant' },
      { id: 'u2', label: '用户 @T2', description: '“好的，改登录密码”', type: 'user' },
      { id: 'tool', label: '工具调用缺失', description: '验证码发送服务未触发，调用日志为空', type: 'warning' },
    ],
  },
  {
    id: 'prompt',
    label: '提示词决策链',
    description: '版本 v2.3 · 密码重置分支',
    children: [
      { id: 'intent', label: '意图识别', description: '误判为“修改密码”但缺少歧义澄清', type: 'warning' },
      { id: 'context', label: '上下文记忆', description: '上一轮“忘记密码”信息未携带，导致路径错误', type: 'assistant' },
      { id: 'guard', label: '安全校验', description: '未执行身份二次确认/验证码校验', type: 'warning' },
    ],
  },
  {
    id: 'root',
    label: '根因路径',
    description: '触发点 → 动作 → 输出',
    children: [
      { id: 'trigger', label: '触发点', description: '提示词缺少“身份确认”分支', type: 'warning' },
      { id: 'action', label: '动作', description: '工具调用链断裂，验证码服务未触发', type: 'warning' },
      { id: 'output', label: '输出', description: '直接暴露重置入口，未提示风险与回滚', type: 'assistant' },
    ],
  },
]

const badcaseOptions = [
  { id: '0127', label: 'Badcase #0127 - 用户说“修改密码”', desc: '问题：未二次确认，直接跳转错误页面', priority: '高优', context: '密码找回流程', time: '2025-01-14 10:23' },
  { id: '0129', label: 'Badcase #0129 - 用户说“查积分”', desc: '问题：未列出积分服务子选项', priority: '高优', context: '积分查询', time: '2025-01-12 18:02' },
  { id: '0131', label: 'Badcase #0131 - 用户说“帮你”', desc: '问题：识别错误未容错', priority: '高优', context: '闲聊触发业务', time: '2025-01-11 14:10' },
  { id: '0133', label: 'Badcase #0133 - “我要转账还要查询”', desc: '问题：未拦截多需求', priority: '中优', context: '多意图拦截', time: '2025-01-10 20:45' },
]

const testCaseSets = [
  { id: 'recent-badcase', title: '最近 Badcase + 关联用例', size: 12 },
  { id: 'password-standard', title: '密码业务标准用例', size: 15 },
  { id: 'core-business', title: '核心业务场景集', size: 50 },
  { id: 'regression', title: '完整回归测试集', size: 200 },
  { id: 'edge', title: '边缘场景测试集', size: 30 },
]

const modelOptions = [
  { id: 'chatgpt-5', label: 'ChatGPT 5', desc: '推理强化 / 兼容多语言' },
  { id: 'deepseek-v3', label: 'DeepSeekV3', desc: '长文本 + 成本友好' },
  { id: 'qwen3-235b', label: 'Qwen3-235B', desc: '中文增强 / 工具友好' },
]

const metricOptions = ['通过率', '拒答率', '安全合规', '工具命中率']

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
  const [selectedBadcases, setSelectedBadcases] = useState<string[]>([])
  const [releaseForm, setReleaseForm] = useState({
    version: 'v2.4',
    name: prompt ? `${prompt.name} 优化` : '',
    type: 'Bug修复',
    changelog: '修复密码业务歧义识别问题',
  })
  const [hasOptimizedPrompt, setHasOptimizedPrompt] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [caseSource, setCaseSource] = useState<'preset' | 'custom'>('preset')
  const [selectedCaseSets, setSelectedCaseSets] = useState<string[]>([])
  const [customCaseInput, setCustomCaseInput] = useState(
    '1) 用户说“帮我改密码”\n2) 我要看看积分还能干嘛\n3) 如果余额不足怎么提醒？'
  )
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]?.id || 'chatgpt-5')
  const [temperature, setTemperature] = useState(0.3)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [enhanceGoal, setEnhanceGoal] = useState('')
  const [enhanceImageName, setEnhanceImageName] = useState('')

  const sendAssistantCommand = useCallback((text: string) => {
    if (!text) return
    window.dispatchEvent(new CustomEvent('ai-assistant-send', { detail: { text } }))
  }, [])

  useEffect(() => {
    setHasOptimizedPrompt(false)
    setSelectedBadcases([])
    setSelectedSuggestions([])
    setCaseSource('preset')
    setSelectedCaseSets([])
    setSelectedMetrics([])
  }, [promptId, mode])

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

  const selectedBadcaseDetails = useMemo(
    () => badcaseOptions.filter(item => selectedBadcases.includes(item.id)),
    [selectedBadcases]
  )

  const selectedCaseSetTitles = useMemo(
    () => testCaseSets.filter(set => selectedCaseSets.includes(set.id)).map(set => `${set.title} (${set.size})`),
    [selectedCaseSets]
  )

  const selectedPresetCount = useMemo(
    () => testCaseSets.filter(set => selectedCaseSets.includes(set.id)).reduce((sum, set) => sum + set.size, 0),
    [selectedCaseSets]
  )

  const customCaseLines = useMemo(
    () => customCaseInput.split('\n').filter(line => line.trim()).length,
    [customCaseInput]
  )

  const selectedModelInfo = useMemo(
    () => modelOptions.find(model => model.id === selectedModel) || modelOptions[0],
    [selectedModel]
  )

  const getNodeDotClass = (type?: DiagnosisNode['type']) => {
    if (type === 'user') return 'bg-blue-500'
    if (type === 'warning') return 'bg-amber-500'
    return 'bg-[var(--color-primary)]'
  }

  const renderTreeNode = (node: DiagnosisNode, depth = 0) => (
    <div key={node.id} className="relative pl-5">
      {depth > 0 && <span className="absolute left-2 top-4 -bottom-2 w-px bg-[var(--border-subtle)]" />}
      <div className="flex items-start gap-3">
        <span className={cn("mt-1 w-2.5 h-2.5 rounded-full", getNodeDotClass(node.type))} />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--text-primary)]">{node.label}</p>
            {node.type === 'warning' && <Badge variant="destructive" className="text-xs">风险</Badge>}
            {node.type === 'user' && <Badge variant="secondary" className="text-xs">用户语境</Badge>}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{node.description}</p>
        </div>
      </div>
      {node.children?.length ? (
        <div className="ml-4 pl-4 mt-2 space-y-3 border-l border-dashed border-[var(--border-subtle)]">
          {node.children.map(child => renderTreeNode(child, depth + 1))}
        </div>
      ) : null}
    </div>
  )

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const toggleCaseSet = (id: string) => {
    setSelectedCaseSets(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric])
  }

  const handleConfirmBadcases = () => {
    if (!selectedBadcaseDetails.length) return
    const detailText = selectedBadcaseDetails
      .map(item => `${item.label}（${item.desc.replace('问题：', '')}）`)
      .join('；')
    sendAssistantCommand(`帮我修复这个badcase + ${detailText}。请给出上下文诊断、根因路径和需要修改的提示词片段。`)
    setStage('idle')
  }

  const handleConfirmScenario = () => {
    const label = modeLabel[mode] || '提示词优化'
    const summary = `${prompt.name}（${prompt.intent}，版本 ${prompt.version}）`
    const ask = mode === 'diagnose'
      ? '帮我做系统性诊断，给出风险、潜在问题和修复建议'
      : '帮我基于需求方向优化提示词，并列出需要补充的规则'
    sendAssistantCommand(`${label}模式，目标提示词：${summary}。${ask}。`)
  }

  const handleGenerateWithAI = () => {
    const suggestionText = optimizeSuggestions
      .filter(item => selectedSuggestions.includes(item.id))
      .map(item => item.title)
      .join('、') || '默认优化建议'

    const enhanceDetail = mode === 'enhance'
      ? `；自定义优化目标：${enhanceGoal || '未填写'}${enhanceImageName ? `（已上传：${enhanceImageName}）` : ''}`
      : ''

    sendAssistantCommand(`帮我基于这些优化建议优化一下现有的提示词：${suggestionText}。模式：${modeLabel[mode] || '提示词优化'}，当前提示词：${prompt.name}${enhanceDetail}。`)
    setHasOptimizedPrompt(true)
  }

  const handleStartTesting = () => {
    const caseText = caseSource === 'preset'
      ? (selectedCaseSetTitles.join(' / ') || '使用推荐测试集')
      : customCaseInput.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 3).join('；')
    const metricText = selectedMetrics.join('、') || '通过率'

    sendAssistantCommand(`基于这些用例开始测试：${caseText}。模型：${selectedModelInfo.label}，温度：${temperature.toFixed(2)}，测量指标：${metricText}。场景：${modeLabel[mode] || '提示词优化'}。`)
    setStage('baseline')
    setTimeout(() => setStage('baseline-done'), 400)
    setTimeout(() => setStage('regression'), 900)
    setTimeout(() => setStage('done'), 1500)
  }

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
                  <Button size="sm" onClick={handleConfirmBadcases} disabled={selectedBadcases.length === 0}>
                    确认选择
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'diagnose' && (
          <Card>
            <CardHeader>
              <CardTitle>{modeLabel[mode] || '模式确认'}</CardTitle>
              <CardDescription>一键把当前提示词和目标发送给右侧 AI 助手</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <p>目标提示词：{prompt.name} · {prompt.intent}</p>
                <p>动作：自动发起“帮我{mode === 'diagnose' ? '智能诊断' : '基于需求优化'}”指令到右侧 AI</p>
              </div>
              <Button onClick={handleConfirmScenario}>
                确认选择
              </Button>
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
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Badcase 所在的上下文</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {selectedBadcaseDetails[0]?.context || '密码找回流程'} · {selectedBadcaseDetails[0]?.time || '最近 7 天'} · {selectedBadcaseDetails[0]?.label || 'Badcase #0127'}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                    <Badge variant="secondary">{prompt.version}</Badge>
                    <span>触发路径：密码重置 / 身份校验</span>
                    <span>模型：claude-sonnet-4-20250514</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="w-4 h-4 text-[var(--color-primary)]" />
                    <p className="text-sm font-medium text-[var(--text-primary)]">树形视图 · 对话与决策链</p>
                    <span className="text-xs text-[var(--text-tertiary)]">一目了然地看到 Badcase 所在上下文、链路与根因</span>
                  </div>
                  <div className="space-y-3">
                    {diagnosisContextTree.map(section => (
                      <div key={section.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{section.label}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{section.description}</p>
                          </div>
                          <Badge variant="secondary">上下文</Badge>
                        </div>
                        <div className="space-y-3">
                          {section.children?.map(child => renderTreeNode(child))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">Badcase 摘要</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">优先级、上下文、问题点一览</p>
                  <div className="mt-3 space-y-2">
                    {selectedBadcaseDetails.length ? selectedBadcaseDetails.map(item => (
                      <div key={item.id} className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.priority === '高优' ? 'destructive' : 'default'}>{item.priority}</Badge>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">上下文：{item.context} · 发生时间：{item.time}</p>
                      </div>
                    )) : <p className="text-sm text-[var(--text-tertiary)]">请选择 Badcase 查看上下文树。</p>}
                  </div>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">诊断报告</p>
                  <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                    <li>• 问题类型：业务歧义 + 安全校验缺失</li>
                    <li>• 影响范围：密码重置流程 / 高优先</li>
                    <li>• 根因路径：触发点缺分支 → 工具未调用 → 输出暴露入口</li>
                    <li>• 推荐修复：补充身份确认、增加验证码重试、增加歧义澄清</li>
                  </ul>
                </div>
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
                onClick={() => toggleSuggestion(item.id)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedSuggestions.includes(item.id)
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] ring-1 ring-[var(--color-primary)]/30"
                    : "border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-[var(--text-primary)]">{item.title}</p>
                  {item.recommended && <Badge variant="secondary">推荐</Badge>}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2">点击{selectedSuggestions.includes(item.id) ? '已添加' : '添加'}到优化方案</p>
              </div>
            ))}

            {mode === 'enhance' && (
              <div className="col-span-2 p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">自定义优化目标</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">填写需求或上传参考图，和方案建议一起发送给 AI</p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-[var(--border-strong)] cursor-pointer text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        setEnhanceImageName(file ? file.name : '')
                      }}
                    />
                    <span className="text-xs">上传图片</span>
                  </label>
                </div>
                <div className="mt-3">
                  <ConfigTextarea
                    value={enhanceGoal}
                    onChange={(e) => setEnhanceGoal(e.target.value)}
                    rows={4}
                    placeholder="示例：让回复增加品牌语调；补充免责声明；根据上传的截图对齐界面文案风格..."
                  />
                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mt-2">
                    <span>{enhanceImageName ? `已选择：${enhanceImageName}` : '可选：上传参考图片，帮助对齐风格/布局'}</span>
                    <span>{enhanceGoal.length}/500</span>
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-2 flex justify-end mt-2">
              <Button size="sm" onClick={handleGenerateWithAI}>
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
              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-lg border border-[var(--border-default)] overflow-hidden">
                    <button
                      onClick={() => setCaseSource('preset')}
                      className={cn(
                        "px-3 py-2 text-sm transition-colors",
                        caseSource === 'preset'
                          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      现有测试集
                    </button>
                    <button
                      onClick={() => setCaseSource('custom')}
                      className={cn(
                        "px-3 py-2 text-sm transition-colors",
                        caseSource === 'custom'
                          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      自定义组合
                    </button>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">先选测试集，再配置模型和测量指标</span>
                </div>
                {caseSource === 'preset' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {testCaseSets.map(set => (
                      <label
                        key={set.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3",
                          selectedCaseSets.includes(set.id)
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] ring-1 ring-[var(--color-primary)]/20"
                            : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4"
                          checked={selectedCaseSets.includes(set.id)}
                          onChange={() => toggleCaseSet(set.id)}
                        />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{set.title}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{set.size} 条 · 推荐覆盖核心路径</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--text-secondary)]">输入自定义用例（每行一个问题）</p>
                    <ConfigTextarea
                      value={customCaseInput}
                      onChange={(e) => setCustomCaseInput(e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-[var(--text-tertiary)]">示例：我要改支付密码 / 余额不足怎么办 / 帮我查询积分兑换方式</p>
                  </div>
                )}
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">用例摘要</p>
                <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
                  {caseSource === 'preset' ? selectedPresetCount : customCaseLines} 个
                </p>
                <p className="text-xs text-[var(--text-secondary)]">来源：{caseSource === 'preset' ? '现有测试集' : '自定义组合'}</p>
                {caseSource === 'preset' ? (
                  <ul className="mt-2 text-xs text-[var(--text-secondary)] space-y-1">
                    {selectedCaseSetTitles.length
                      ? selectedCaseSetTitles.map(title => <li key={title}>• {title}</li>)
                      : <li>• 请选择至少一个测试集</li>}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">包含 Badcase / 常见 QA / 边界问题</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">测试模式（模型）</p>
                <div className="mt-3 space-y-2">
                  {modelOptions.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selectedModel === model.id
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] shadow-[0_0_0_1px_var(--color-primary)]/20"
                          : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      <p className="font-medium text-[var(--text-primary)]">{model.label}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{model.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">温度参数</p>
                <div className="mt-3 space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                  />
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>稳定</span>
                    <Badge variant="secondary">温度 {temperature.toFixed(2)}</Badge>
                    <span>探索</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">温度越低越稳定，建议 0.2~0.5</p>
              </div>
              <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">测试测量</p>
                <div className="mt-2 space-y-2">
                  {metricOptions.map(metric => (
                    <label key={metric} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selectedMetrics.includes(metric)}
                        onChange={() => toggleMetric(metric)}
                      />
                      <span>{metric}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">用于生成评分、拒答率、安全报告</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">执行摘要</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  用例：{caseSource === 'preset' ? (selectedCaseSetTitles.join(' / ') || '请先选择测试集') : `${customCaseLines} 条自定义`} · 模型：{selectedModelInfo.label} · 温度：{temperature.toFixed(2)} · 指标：{selectedMetrics.join('、') || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStage('idle')}>重置</Button>
                <Button size="sm" onClick={handleStartTesting}>
                  <Play className="w-3 h-3 mr-1" />
                  开始测试
                </Button>
              </div>
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
                  <p>模型: {selectedModelInfo.label} · 温度 {temperature.toFixed(2)}</p>
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
                  <p>模型: {selectedModelInfo.label} · 温度 {temperature.toFixed(2)}</p>
                  {stage === 'regression' && <p>进度: 58% · 正在执行用例 #15</p>}
                  {stage === 'done' && (
                    <>
                      <p>结果: 通过 {regressionResult.pass}/{regressionResult.total} （{regressionResult.passRate}%）</p>
                      <p>关键改善: 用例#07 已修复 · 指标 {selectedMetrics.join('、') || '通过率'}</p>
                      <p>耗时: {regressionResult.time}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 对比分析与发布区：生成优化提示词后才出现 */}
        {hasOptimizedPrompt ? (
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
        ) : (
          <Card className="border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)]">
            <CardHeader>
              <CardTitle className="text-base">生成优化提示词后可查看对比与发布</CardTitle>
              <CardDescription>完成“AI 一键生成优化提示词”后自动显示 Diff、测试对比与发布信息</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[var(--text-secondary)]">
              当前尚未生成优化后的提示词，请先在“优化方案生成区”点击 AI 一键生成。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PromptOptimizeFlowPage
