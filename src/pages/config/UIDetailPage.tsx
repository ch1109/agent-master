import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload, ZoomIn, X, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfigInput, ConfigTextarea, ConfigField, ConfigLabel } from '@/components/config'
import { ExecutionStage } from '@/components/ai-chat/ExecutionStage'
import { useHighlight } from '@/hooks/useHighlight'
import { useAgentStore } from '@/stores/agentStore'
import { useUIConfigStore } from '@/stores/uiConfigStore'
import { aiGeneratedUIConfig } from '@/data/uiConfigMockData'

/**
 * UI 配置详情页
 * 支持截图预览和 AI 分析功能
 */
export function UIDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { debugOptions } = useAgentStore()
  const { pages, addPage, updatePage } = useUIConfigStore()

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    englishName: '',
    description: '',
    pageId: '',
    screenshot: null as string | null,
    supportedIntents: [] as string[],
    buttons: [] as { label: string; action: string }[],
    aiRules: '',
    aiGoals: '',
    aiNotes: '',
  })

  // 使用 useHighlight Hook
  const { highlight, isHighlighted } = useHighlight({ defaultDuration: 1000 })

  // UI 状态
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [isAIFilling, setIsAIFilling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysisTasks, setAnalysisTasks] = useState<Array<{ id: string; name: string; status: 'pending' | 'active' | 'completed' }>>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // 加载数据
  useEffect(() => {
    if (!isNew && id) {
      const page = pages.find(p => p.id === id)
      if (page) {
        setFormData(prev => ({
          ...prev,
          name: page.name,
          englishName: page.englishName,
          description: page.description,
          pageId: page.pageId || '',
          screenshot: page.screenshot || null,
          supportedIntents: page.supportedIntents || [],
          buttons: page.buttons || [],
          aiRules: page.aiRules || '',
          aiGoals: page.aiGoals || '',
          aiNotes: page.aiNotes || '',
        }))
      }
    }
  }, [id, isNew, pages])

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, screenshot: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // AI 分析截图
  const handleAnalyzeScreenshot = useCallback(async () => {
    if (!formData.screenshot || isAIAnalyzing) return

    setIsAIAnalyzing(true)
    setAnalysisProgress(0)

    const tasks = [
      { id: '1', name: '识别页面布局', status: 'pending' as const },
      { id: '2', name: '提取页面元素', status: 'pending' as const },
      { id: '3', name: '识别可点击区域', status: 'pending' as const },
      { id: '4', name: '生成页面描述', status: 'pending' as const },
    ]
    setAnalysisTasks(tasks)

    const mockDelay = debugOptions.mockDelay || 800
    const config = aiGeneratedUIConfig

    // 模拟分析过程
    for (let i = 0; i < tasks.length; i++) {
      // 更新当前任务为 active
      setAnalysisTasks(prev => prev.map((t, idx) =>
        idx === i ? { ...t, status: 'active' } :
        idx < i ? { ...t, status: 'completed' } : t
      ))
      setAnalysisProgress(((i + 0.5) / tasks.length) * 100)

      await delay(mockDelay)

      // 完成当前任务
      setAnalysisTasks(prev => prev.map((t, idx) =>
        idx === i ? { ...t, status: 'completed' } : t
      ))
      setAnalysisProgress(((i + 1) / tasks.length) * 100)
    }

    // 填充分析结果
    await delay(mockDelay / 2)

    // 使用高亮效果填充表单
    const fieldsConfig = [
      { field: 'name', value: config.basicInfo.name },
      { field: 'englishName', value: config.basicInfo.englishName },
      { field: 'description', value: config.basicInfo.description },
    ]

    for (const { field, value } of fieldsConfig) {
      highlight(field, 1200)
      await delay(300)
      setFormData(prev => ({ ...prev, [field]: value }))
      await delay(400)
    }

    // 填充按钮和意图
    setFormData(prev => ({
      ...prev,
      buttons: config.capabilities.clickableButtons,
      supportedIntents: config.capabilities.supportedIntents,
      aiRules: config.aiContext.rules,
      aiGoals: config.aiContext.goals,
      pageId: config.basicInfo.pageId,
    }))

    setIsAIAnalyzing(false)
    setAnalysisTasks([])
  }, [formData.screenshot, isAIAnalyzing, debugOptions.mockDelay, highlight])

  // AI 辅助填写
  const handleAIFill = useCallback(async () => {
    if (isAIFilling) return

    setIsAIFilling(true)
    const config = aiGeneratedUIConfig
    const mockDelay = debugOptions.mockDelay || 500

    const fieldsConfig = [
      { field: 'name', value: config.basicInfo.name },
      { field: 'englishName', value: config.basicInfo.englishName },
      { field: 'description', value: config.basicInfo.description },
      { field: 'pageId', value: config.basicInfo.pageId || '' },
      { field: 'aiRules', value: config.aiContext.rules },
      { field: 'aiGoals', value: config.aiContext.goals },
    ]

    for (const { field, value } of fieldsConfig) {
      highlight(field, 1200)
      await delay(mockDelay / 2)
      setFormData(prev => ({ ...prev, [field]: value }))
      await delay(mockDelay)
    }

    // 填充按钮和意图
    setFormData(prev => ({
      ...prev,
      buttons: config.capabilities.clickableButtons,
      supportedIntents: config.capabilities.supportedIntents,
    }))

    setIsAIFilling(false)
  }, [isAIFilling, debugOptions.mockDelay, highlight])

  // 监听全局事件
  useEffect(() => {
    const handleAIFillEvent = () => handleAIFill()
    const handleImageUploadEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ imageUrl: string }>
      const { imageUrl } = customEvent.detail
      if (imageUrl) {
        setFormData(prev => ({ ...prev, screenshot: imageUrl }))
      }
    }

    window.addEventListener('ai-fill-ui', handleAIFillEvent)
    window.addEventListener('ai-upload-image', handleImageUploadEvent)

    return () => {
      window.removeEventListener('ai-fill-ui', handleAIFillEvent)
      window.removeEventListener('ai-upload-image', handleImageUploadEvent)
    }
  }, [handleAIFill])

  // 保存配置
  const handleSave = useCallback(async () => {
    if (isSaving) return
    if (!formData.name.trim() || !formData.englishName.trim()) {
      highlight('name', 1200)
      highlight('englishName', 1200)
      return
    }

    setIsSaving(true)
    const payload = {
      name: formData.name.trim(),
      englishName: formData.englishName.trim(),
      description: formData.description.trim(),
      pageId: formData.pageId.trim() || undefined,
      screenshot: formData.screenshot,
      supportedIntents: formData.supportedIntents,
      buttons: formData.buttons,
      aiRules: formData.aiRules,
      aiGoals: formData.aiGoals,
      aiNotes: formData.aiNotes,
      status: 'configured' as const,
    }

    try {
      await delay(Math.min(debugOptions.mockDelay || 500, 1000))

      if (isNew || !id) {
        addPage(payload)
      } else {
        updatePage(id, payload)
      }

      window.dispatchEvent(new CustomEvent('ai-assistant-message', {
        detail: { text: '✅ 已保存' }
      }))

      navigate('/config/ui')
    } finally {
      setIsSaving(false)
    }
  }, [addPage, debugOptions.mockDelay, highlight, id, isNew, navigate, formData, isSaving, updatePage])

  // 处理来自 AI 面板的保存指令
  useEffect(() => {
    const handler = () => handleSave()
    window.addEventListener('ui-config-save', handler)
    return () => window.removeEventListener('ui-config-save', handler)
  }, [handleSave])

  return (
    <div className="h-full flex flex-col">
      {/* 顶部操作栏 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/config/ui')}
              className="p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                {isNew ? '添加页面' : formData.name || 'UI 配置'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {isNew ? '配置新页面的 AI 上下文' : '编辑页面配置'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIFill}
              disabled={isAIFilling || isAIAnalyzing}
              className="text-[var(--color-primary)]"
            >
              {isAIFilling ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              {isAIFilling ? 'AI 填写中...' : 'AI 辅助填写'}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isAIAnalyzing || isAIFilling}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>

      {/* 配置表单 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* 左侧：页面预览 */}
            <div className="col-span-1 space-y-4">
              <Card className="sticky top-0">
                <CardHeader>
                  <CardTitle>页面截图</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.screenshot ? (
                    <div className="relative group">
                      <img
                        src={formData.screenshot}
                        alt="页面截图"
                        className="w-full rounded-lg border border-[var(--border-default)]"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowImagePreview(true)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, screenshot: null }))}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[9/16] rounded-lg border-2 border-dashed border-[var(--border-default)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition-colors"
                    >
                      <Upload className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                      <span className="text-sm text-[var(--text-secondary)]">上传页面截图</span>
                      <span className="text-xs text-[var(--text-tertiary)] mt-1">支持 PNG, JPG 格式</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* AI 分析按钮 */}
                  {formData.screenshot && (
                    <Button
                      onClick={handleAnalyzeScreenshot}
                      disabled={isAIAnalyzing}
                      className="w-full"
                      variant="outline"
                    >
                      {isAIAnalyzing ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      {isAIAnalyzing ? 'AI 分析中...' : 'AI 分析截图'}
                    </Button>
                  )}

                  {/* AI 分析进度 */}
                  {isAIAnalyzing && analysisTasks.length > 0 && (
                    <ExecutionStage
                      title="分析页面截图"
                      progress={analysisProgress}
                      tasks={analysisTasks}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：配置表单 */}
            <div className="col-span-2 space-y-6">
              {/* 基本信息 */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>基本信息</CardTitle>
                  {(isAIFilling || isAIAnalyzing) && (
                    <span className="text-sm text-[var(--color-ai-thinking)] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      AI 正在处理...
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ConfigField label="页面名称" required aiFilling={isHighlighted('name')}>
                      <ConfigInput
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：首页"
                        aiFilling={isHighlighted('name')}
                        disabled={isAIFilling || isAIAnalyzing}
                      />
                    </ConfigField>
                    <ConfigField label="英文标识" required aiFilling={isHighlighted('englishName')}>
                      <ConfigInput
                        value={formData.englishName}
                        onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
                        placeholder="例如：HomePage"
                        aiFilling={isHighlighted('englishName')}
                        disabled={isAIFilling || isAIAnalyzing}
                      />
                    </ConfigField>
                  </div>
                  <ConfigField label="页面描述" aiFilling={isHighlighted('description')}>
                    <ConfigTextarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="描述页面的主要功能..."
                      rows={2}
                      aiFilling={isHighlighted('description')}
                      disabled={isAIFilling || isAIAnalyzing}
                    />
                  </ConfigField>
                </CardContent>
              </Card>

              {/* 页面能力 */}
              <Card>
                <CardHeader><CardTitle>页面能力</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <ConfigLabel>支持的意图</ConfigLabel>
                    <div className="flex flex-wrap gap-2">
                      {formData.supportedIntents.map((intent, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          {intent}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-[var(--color-error)]"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              supportedIntents: prev.supportedIntents.filter((_, i) => i !== idx)
                            }))}
                          />
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm" disabled={isAIFilling || isAIAnalyzing}>
                        <Plus className="w-3 h-3 mr-1" />添加
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <ConfigLabel>可点击按钮</ConfigLabel>
                    <div className="space-y-2">
                      {formData.buttons.map((btn, idx) => (
                        <div key={idx} className="flex gap-2">
                          <ConfigInput value={btn.label} placeholder="按钮名称" className="flex-1" readOnly />
                          <ConfigInput value={btn.action} placeholder="触发动作" className="flex-1" readOnly />
                          <Button variant="ghost" size="icon" disabled={isAIFilling || isAIAnalyzing}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {formData.buttons.length === 0 && (
                        <div className="text-sm text-[var(--text-tertiary)] py-4 text-center">
                          暂无按钮配置，上传截图后可使用 AI 分析自动识别
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI 上下文 */}
              <Card>
                <CardHeader><CardTitle>AI 上下文</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <ConfigField label="行为规则" aiFilling={isHighlighted('aiRules')}>
                    <ConfigTextarea
                      value={formData.aiRules}
                      onChange={(e) => setFormData(prev => ({ ...prev, aiRules: e.target.value }))}
                      placeholder="定义 AI 在此页面的行为规则..."
                      rows={3}
                      aiFilling={isHighlighted('aiRules')}
                      disabled={isAIFilling || isAIAnalyzing}
                    />
                  </ConfigField>
                  <ConfigField label="页面目标" aiFilling={isHighlighted('aiGoals')}>
                    <ConfigTextarea
                      value={formData.aiGoals}
                      onChange={(e) => setFormData(prev => ({ ...prev, aiGoals: e.target.value }))}
                      placeholder="定义 AI 应该达成的目标..."
                      rows={2}
                      aiFilling={isHighlighted('aiGoals')}
                      disabled={isAIFilling || isAIAnalyzing}
                    />
                  </ConfigField>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>页面截图预览</DialogTitle>
          </DialogHeader>
          {formData.screenshot && (
            <img
              src={formData.screenshot}
              alt="页面截图预览"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UIDetailPage
