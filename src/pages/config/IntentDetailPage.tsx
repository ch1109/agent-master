import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Play, Sparkles, Loader2, Plus, Trash2, ChevronDown, ChevronRight, GripVertical, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ConfigInput, ConfigTextarea, ConfigField } from '@/components/config'
import { useHighlight } from '@/hooks/useHighlight'
import { useAgentStore } from '@/stores/agentStore'
import { cn } from '@/lib/utils'
import { mockIntents, intentTypes, aiGeneratedIntentConfig } from '@/data/intentMockData'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'

// 参数/槽位类型
interface SlotConfig {
  id: string
  name: string
  type: 'string' | 'number' | 'date' | 'enum' | 'entity'
  required: boolean
  defaultValue: string
  extractMethod: 'llm' | 'regex' | 'keyword'
  validation: string
}

// 触发规则类型
interface TriggerRule {
  id: string
  type: 'keyword' | 'regex' | 'semantic' | 'context'
  value: string
  weight: number
}

/**
 * 意图配置详情页
 * 按照产品需求文档设计，包含：
 * 1. 基础元数据
 * 2. 触发机制配置（动态面板）
 * 3. 参数提取与槽位
 * 4. 执行与响应配置（Tab切换）
 * 5. 高级配置（折叠面板）
 */
export function IntentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const { debugOptions } = useAgentStore()

  // 基础元数据
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    priority: 50,
    status: 'draft' as 'draft' | 'active' | 'disabled',
  })

  // 触发机制配置
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>([])
  const [triggerLogic, setTriggerLogic] = useState<'and' | 'or'>('or')

  // 参数/槽位配置
  const [slots, setSlots] = useState<SlotConfig[]>([])

  // 执行响应配置
  const [responseType, setResponseType] = useState<'static' | 'capability' | 'route'>('capability')
  const [staticResponse, setStaticResponse] = useState('')
  const [prompt, setPrompt] = useState('')
  const [routeTarget, setRouteTarget] = useState('')

  // 高级配置
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedConfig, setAdvancedConfig] = useState({
    requireConfirm: false,
    timeout: 30,
    retryCount: 3,
    fallbackIntent: '',
    contextRequired: false,
    contextKeys: '',
  })

  // AI 辅助状态
  const [isAIFilling, setIsAIFilling] = useState(false)

  // 使用 useHighlight Hook 管理字段高亮
  const { highlight, isHighlighted } = useHighlight({
    defaultDuration: 1500,
  })

  // 加载数据
  useEffect(() => {
    if (!isNew && id) {
      const intent = mockIntents.find(i => i.id === id)
      if (intent) {
        setFormData(prev => ({
          ...prev,
          name: intent.name,
          type: intent.type,
          description: intent.description,
        }))
      }
    }
  }, [id, isNew])

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // 添加触发规则
  const addTriggerRule = () => {
    setTriggerRules(prev => [...prev, {
      id: `rule_${Date.now()}`,
      type: 'keyword',
      value: '',
      weight: 1,
    }])
  }

  // 删除触发规则
  const removeTriggerRule = (id: string) => {
    setTriggerRules(prev => prev.filter(r => r.id !== id))
  }

  // 添加槽位
  const addSlot = () => {
    setSlots(prev => [...prev, {
      id: `slot_${Date.now()}`,
      name: '',
      type: 'string',
      required: false,
      defaultValue: '',
      extractMethod: 'llm',
      validation: '',
    }])
  }

  // 删除槽位
  const removeSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  // AI 辅助填写函数 - 逐步填充所有区块
  const handleAIFill = useCallback(async () => {
    if (isAIFilling) return

    setIsAIFilling(true)
    const config = aiGeneratedIntentConfig
    const mockDelay = debugOptions.mockDelay || 400

    // Step 1: 基础元数据
    highlight('name', 1500)
    await delay(mockDelay / 2)
    setFormData(prev => ({ ...prev, name: config.basicInfo.name }))
    await delay(mockDelay)

    highlight('type', 1500)
    await delay(mockDelay / 2)
    setFormData(prev => ({ ...prev, type: config.basicInfo.type }))
    await delay(mockDelay)

    highlight('description', 1500)
    await delay(mockDelay / 2)
    setFormData(prev => ({ ...prev, description: config.basicInfo.description }))
    await delay(mockDelay)

    // Step 2: 触发规则
    highlight('triggerRules', 2000)
    await delay(mockDelay)
    setTriggerRules([
      { id: 'rule_1', type: 'keyword', value: '查余额,余额查询,账户余额', weight: 1 },
      { id: 'rule_2', type: 'semantic', value: '用户想要查询账户中的余额信息', weight: 0.8 },
    ])
    await delay(mockDelay)

    // Step 3: 参数槽位
    highlight('slots', 2000)
    await delay(mockDelay)
    setSlots([
      { id: 'slot_1', name: 'account_type', type: 'enum', required: false, defaultValue: 'default', extractMethod: 'llm', validation: '' },
      { id: 'slot_2', name: 'currency', type: 'string', required: false, defaultValue: 'CNY', extractMethod: 'keyword', validation: '' },
    ])
    await delay(mockDelay)

    // Step 4: 执行响应 - 提示词
    highlight('prompt', 2500)
    await delay(mockDelay / 2)
    // 打字机效果填充提示词
    const promptText = config.prompt
    const chars = promptText.split('')
    let currentValue = ''
    for (let i = 0; i < chars.length; i += 8) {
      currentValue += chars.slice(i, i + 8).join('')
      setPrompt(currentValue)
      await delay(15)
    }
    await delay(mockDelay)

    // Step 5: 高级配置
    setAdvancedOpen(true)
    await delay(200)
    highlight('advancedConfig', 1500)
    await delay(mockDelay / 2)
    setAdvancedConfig({
      requireConfirm: true,
      timeout: 30,
      retryCount: 3,
      fallbackIntent: 'fallback_default',
      contextRequired: true,
      contextKeys: 'user_id,session_id',
    })
    await delay(mockDelay)

    setIsAIFilling(false)
  }, [isAIFilling, debugOptions.mockDelay, highlight])

  // 监听全局事件触发 AI 填充
  useEffect(() => {
    const handleAIFillEvent = () => handleAIFill()
    window.addEventListener('ai-fill-intent', handleAIFillEvent)
    return () => window.removeEventListener('ai-fill-intent', handleAIFillEvent)
  }, [handleAIFill])

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/config/intent')}
              className="p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                {isNew ? '新建意图' : formData.name || '意图配置'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {isNew ? '创建新的意图配置' : '编辑意图配置'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIFill}
              disabled={isAIFilling}
              className="text-[var(--color-primary)]"
            >
              {isAIFilling ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              {isAIFilling ? 'AI 填写中...' : 'AI 辅助填写'}
            </Button>
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-1" />
              测试
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* 配置表单 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 区块 1: 基础元数据 */}
          <Card className={cn(isHighlighted('name') || isHighlighted('type') || isHighlighted('description') ? 'ring-2 ring-[var(--color-ai-thinking)] ring-opacity-50' : '')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  📋 基础元数据
                  {isAIFilling && (isHighlighted('name') || isHighlighted('type') || isHighlighted('description')) && (
                    <Badge variant="secondary" className="bg-[var(--color-ai-thinking)]/10 text-[var(--color-ai-thinking)]">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      AI 填写中
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>定义意图的基本信息</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ConfigField label="意图名称" required aiFilling={isHighlighted('name')}>
                  <ConfigInput
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：查询账户余额"
                    aiFilling={isHighlighted('name')}
                    disabled={isAIFilling}
                  />
                </ConfigField>
                <ConfigField label="意图类型" required aiFilling={isHighlighted('type')}>
                  <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className={cn(isHighlighted('type') && 'border-[var(--color-ai-thinking)] bg-[var(--color-ai-thinking)]/5')}>
                      <SelectValue placeholder="选择意图类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {intentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ConfigField>
              </div>
              <ConfigField label="意图描述" aiFilling={isHighlighted('description')}>
                <ConfigTextarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述这个意图的用途和场景..."
                  rows={2}
                  aiFilling={isHighlighted('description')}
                  disabled={isAIFilling}
                />
              </ConfigField>
              <div className="grid grid-cols-2 gap-4">
                <ConfigField label="优先级">
                  <ConfigInput
                    type="number"
                    value={formData.priority.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 50 }))}
                    placeholder="0-100"
                    disabled={isAIFilling}
                  />
                </ConfigField>
                <ConfigField label="状态">
                  <Select value={formData.status} onValueChange={(v: 'draft' | 'active' | 'disabled') => setFormData(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="disabled">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </ConfigField>
              </div>
            </CardContent>
          </Card>

          {/* 区块 2: 触发机制配置 */}
          <Card className={cn(isHighlighted('triggerRules') ? 'ring-2 ring-[var(--color-ai-thinking)] ring-opacity-50' : '')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    🎯 触发机制配置
                    {isAIFilling && isHighlighted('triggerRules') && (
                      <Badge variant="secondary" className="bg-[var(--color-ai-thinking)]/10 text-[var(--color-ai-thinking)]">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        AI 填写中
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>配置触发此意图的规则</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addTriggerRule} disabled={isAIFilling}>
                  <Plus className="w-4 h-4 mr-1" /> 添加规则
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 触发逻辑选择 */}
              <div className="flex items-center gap-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <span className="text-sm text-[var(--text-secondary)]">规则逻辑：</span>
                <div className="flex gap-2">
                  <Button size="sm" variant={triggerLogic === 'or' ? 'default' : 'outline'} onClick={() => setTriggerLogic('or')}>
                    任一匹配 (OR)
                  </Button>
                  <Button size="sm" variant={triggerLogic === 'and' ? 'default' : 'outline'} onClick={() => setTriggerLogic('and')}>
                    全部匹配 (AND)
                  </Button>
                </div>
              </div>

              {/* 触发规则列表 */}
              {triggerRules.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[var(--border-default)] rounded-lg">
                  <AlertCircle className="w-8 h-8 mx-auto text-[var(--text-tertiary)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">暂无触发规则</p>
                  <p className="text-xs text-[var(--text-tertiary)]">点击上方"添加规则"按钮创建</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {triggerRules.map((rule) => (
                    <div key={rule.id} className="flex items-start gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg group">
                      <GripVertical className="w-4 h-4 text-[var(--text-tertiary)] mt-2 cursor-grab" />
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <Select value={rule.type} onValueChange={(v) => setTriggerRules(prev => prev.map(r => r.id === rule.id ? {...r, type: v as TriggerRule['type']} : r))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keyword">关键词</SelectItem>
                            <SelectItem value="regex">正则表达式</SelectItem>
                            <SelectItem value="semantic">语义匹配</SelectItem>
                            <SelectItem value="context">上下文条件</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="col-span-2">
                          <ConfigInput
                            value={rule.value}
                            onChange={(e) => setTriggerRules(prev => prev.map(r => r.id === rule.id ? {...r, value: e.target.value} : r))}
                            placeholder={rule.type === 'keyword' ? '关键词,用逗号分隔' : rule.type === 'regex' ? '正则表达式' : '描述语义...'}
                          />
                        </div>
                        <ConfigInput
                          type="number"
                          value={rule.weight.toString()}
                          onChange={(e) => setTriggerRules(prev => prev.map(r => r.id === rule.id ? {...r, weight: parseFloat(e.target.value) || 1} : r))}
                          placeholder="权重"
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeTriggerRule(rule.id)} className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4 text-[var(--color-error)]" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 区块 3: 参数提取与槽位 */}
          <Card className={cn(isHighlighted('slots') ? 'ring-2 ring-[var(--color-ai-thinking)] ring-opacity-50' : '')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    📦 参数提取与槽位
                    {isAIFilling && isHighlighted('slots') && (
                      <Badge variant="secondary" className="bg-[var(--color-ai-thinking)]/10 text-[var(--color-ai-thinking)]">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        AI 填写中
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>定义需要从用户输入中提取的参数</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addSlot} disabled={isAIFilling}>
                  <Plus className="w-4 h-4 mr-1" /> 添加槽位
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[var(--border-default)] rounded-lg">
                  <AlertCircle className="w-8 h-8 mx-auto text-[var(--text-tertiary)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">暂无参数槽位</p>
                  <p className="text-xs text-[var(--text-tertiary)]">点击上方"添加槽位"按钮创建</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div key={slot.id} className="p-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg group">
                      <div className="grid grid-cols-6 gap-3">
                        <ConfigInput
                          value={slot.name}
                          onChange={(e) => setSlots(prev => prev.map(s => s.id === slot.id ? {...s, name: e.target.value} : s))}
                          placeholder="参数名"
                        />
                        <Select value={slot.type} onValueChange={(v) => setSlots(prev => prev.map(s => s.id === slot.id ? {...s, type: v as SlotConfig['type']} : s))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">字符串</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                            <SelectItem value="date">日期</SelectItem>
                            <SelectItem value="enum">枚举</SelectItem>
                            <SelectItem value="entity">实体</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={slot.extractMethod} onValueChange={(v) => setSlots(prev => prev.map(s => s.id === slot.id ? {...s, extractMethod: v as SlotConfig['extractMethod']} : s))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llm">LLM提取</SelectItem>
                            <SelectItem value="regex">正则提取</SelectItem>
                            <SelectItem value="keyword">关键词</SelectItem>
                          </SelectContent>
                        </Select>
                        <ConfigInput
                          value={slot.defaultValue}
                          onChange={(e) => setSlots(prev => prev.map(s => s.id === slot.id ? {...s, defaultValue: e.target.value} : s))}
                          placeholder="默认值"
                        />
                        <div className="flex items-center gap-2">
                          <Switch checked={slot.required} onCheckedChange={(v) => setSlots(prev => prev.map(s => s.id === slot.id ? {...s, required: v} : s))} />
                          <span className="text-xs text-[var(--text-secondary)]">必填</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeSlot(slot.id)} className="opacity-0 group-hover:opacity-100 justify-self-end">
                          <Trash2 className="w-4 h-4 text-[var(--color-error)]" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 区块 4: 执行与响应配置 */}
          <Card className={cn(isHighlighted('prompt') ? 'ring-2 ring-[var(--color-ai-thinking)] ring-opacity-50' : '')}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                ⚡ 执行与响应配置
                {isAIFilling && isHighlighted('prompt') && (
                  <Badge variant="secondary" className="bg-[var(--color-ai-thinking)]/10 text-[var(--color-ai-thinking)]">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    AI 填写中
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>配置意图触发后的响应方式</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={responseType} onValueChange={(v) => setResponseType(v as typeof responseType)}>
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="static">💬 静态回复</TabsTrigger>
                  <TabsTrigger value="capability">🤖 能力调用</TabsTrigger>
                  <TabsTrigger value="route">🔀 路由分发</TabsTrigger>
                </TabsList>
                <TabsContent value="static" className="mt-4">
                  <ConfigField label="静态回复内容">
                    <ConfigTextarea
                      value={staticResponse}
                      onChange={(e) => setStaticResponse(e.target.value)}
                      placeholder="输入固定的回复内容..."
                      rows={6}
                      disabled={isAIFilling}
                    />
                  </ConfigField>
                </TabsContent>
                <TabsContent value="capability" className="mt-4 space-y-4">
                  <ConfigField label="提示词配置" aiFilling={isHighlighted('prompt')}>
                    <ConfigTextarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="配置 AI 的系统提示词，定义其行为和响应方式..."
                      rows={12}
                      className="font-mono text-sm"
                      aiFilling={isHighlighted('prompt')}
                      disabled={isAIFilling}
                    />
                  </ConfigField>
                </TabsContent>
                <TabsContent value="route" className="mt-4">
                  <ConfigField label="路由目标">
                    <Select value={routeTarget} onValueChange={setRouteTarget}>
                      <SelectTrigger><SelectValue placeholder="选择路由目标" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sub_agent_1">子 Agent - 订单处理</SelectItem>
                        <SelectItem value="sub_agent_2">子 Agent - 客服咨询</SelectItem>
                        <SelectItem value="external_api">外部 API 服务</SelectItem>
                      </SelectContent>
                    </Select>
                  </ConfigField>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 区块 5: 高级配置（折叠面板） */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <Card className={cn(isHighlighted('advancedConfig') ? 'ring-2 ring-[var(--color-ai-thinking)] ring-opacity-50' : '')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        ⚙️ 高级配置
                        {isAIFilling && isHighlighted('advancedConfig') && (
                          <Badge variant="secondary" className="bg-[var(--color-ai-thinking)]/10 text-[var(--color-ai-thinking)]">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            AI 填写中
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>超时、重试、回退等高级设置</CardDescription>
                    </div>
                    {advancedOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div>
                        <div className="text-sm font-medium">执行前确认</div>
                        <div className="text-xs text-[var(--text-secondary)]">执行操作前询问用户确认</div>
                      </div>
                      <Switch checked={advancedConfig.requireConfirm} onCheckedChange={(v) => setAdvancedConfig(prev => ({...prev, requireConfirm: v}))} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div>
                        <div className="text-sm font-medium">需要上下文</div>
                        <div className="text-xs text-[var(--text-secondary)]">执行时需要特定上下文信息</div>
                      </div>
                      <Switch checked={advancedConfig.contextRequired} onCheckedChange={(v) => setAdvancedConfig(prev => ({...prev, contextRequired: v}))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <ConfigField label="超时时间 (秒)">
                      <ConfigInput type="number" value={advancedConfig.timeout.toString()} onChange={(e) => setAdvancedConfig(prev => ({...prev, timeout: parseInt(e.target.value) || 30}))} />
                    </ConfigField>
                    <ConfigField label="重试次数">
                      <ConfigInput type="number" value={advancedConfig.retryCount.toString()} onChange={(e) => setAdvancedConfig(prev => ({...prev, retryCount: parseInt(e.target.value) || 3}))} />
                    </ConfigField>
                    <ConfigField label="回退意图">
                      <ConfigInput value={advancedConfig.fallbackIntent} onChange={(e) => setAdvancedConfig(prev => ({...prev, fallbackIntent: e.target.value}))} placeholder="fallback_default" />
                    </ConfigField>
                  </div>
                  {advancedConfig.contextRequired && (
                    <ConfigField label="上下文键">
                      <ConfigInput value={advancedConfig.contextKeys} onChange={(e) => setAdvancedConfig(prev => ({...prev, contextKeys: e.target.value}))} placeholder="user_id,session_id" />
                    </ConfigField>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

export default IntentDetailPage
