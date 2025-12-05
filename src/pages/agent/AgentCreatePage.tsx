import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  UserRound,
  Image as ImageIcon,
  Brain,
  Shield,
  Image,
  Cpu,
  Rocket,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgentCreationStore } from '@/stores/agentCreationStore'
import {
  visualStyleOptions,
  characterFormOptions,
  bodyProportionOptions,
  actionPackages,
  toolOptions,
  permissionOptions,
  memoryOptions,
  optimizationOptions,
  scenarioOptions,
  placeholderImages,
  generationModels,
  memoryExamples,
  optimizationCapabilities,
} from '@/data/agentCreationOptions'
import {
  StyleOptionCard,
  ToolCard,
  PermissionCard,
  MemoryCompareCard,
  ScenarioCard,
  MemoryOptionCard,
  OptimizationCapabilities,
} from '@/components/agent-create'

type StageKey = 'stage1' | 'stage2' | 'stage3' | 'stage4'

const stageMeta: Record<StageKey, { title: string; desc: string }> = {
  stage1: { title: '画像定义', desc: '收集职责、场景、用户、能力与调性' },
  stage2: { title: '形象生成', desc: '形象设定、视觉风格、动作与模型' },
  stage3: { title: '能力装配', desc: '工具与权限配置' },
  stage4: { title: '记忆与进化', desc: '记忆、自优化与应用场景' },
}

// 放慢自动填充节奏（原速的 3 倍）
const FILL_SPEED = 3
const DELAY_STAGE1 = 420 * FILL_SPEED
const DELAY_STAGE2 = 420 * FILL_SPEED
const DELAY_STAGE3 = 320 * FILL_SPEED
const DELAY_STAGE4 = 400 * FILL_SPEED
const DELAY_STAGE_SWITCH = 600 * FILL_SPEED
const DELAY_PULSE = 120 * FILL_SPEED
const DELAY_PERMISSION = 500 * FILL_SPEED

function SectionCard({
  title,
  description,
  children,
  action,
  highlight,
  icon,
}: {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  highlight?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all',
        highlight && 'ring-2 ring-[var(--color-primary)]/30 border-[var(--color-primary)]/40'
      )}
    >
      <div className="absolute -right-10 -top-16 h-28 w-28 rounded-full bg-gradient-to-br from-[#dbeafe] to-transparent opacity-70 blur-3xl" aria-hidden />
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="flex items-start gap-2">
          {icon && <div className="mt-0.5 text-[var(--color-primary)]">{icon}</div>}
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
            {description && <p className="text-xs text-[#94a3b8] mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </div>
  )
}

function StageHeader({
  currentStage,
  progress,
  onStageClick,
}: {
  currentStage: StageKey
  progress: Record<StageKey, number>
  onStageClick: (key: StageKey) => void
}) {
  const stages = ['stage1', 'stage2', 'stage3', 'stage4'] as StageKey[]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stages.map((stage, idx) => {
        const isActive = currentStage === stage
        const pct = progress[stage]
        const status = pct === 100 ? '已完成' : isActive ? '进行中' : '待开始'
        return (
          <button
            key={stage}
            type="button"
            onClick={() => onStageClick(stage)}
            className={cn(
              'relative overflow-hidden rounded-2xl border border-[#e3eaf7] bg-white/75 px-4 py-3 text-left shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-all backdrop-blur',
              isActive ? 'ring-2 ring-[var(--color-primary)]/35 border-[var(--color-primary)]/40' : 'hover:-translate-y-[2px]'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br from-white via-[#f4f7ff] to-[#e8f1ff] transition-opacity duration-300',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
              aria-hidden
            />
            {isActive && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed]" aria-hidden />}
            <div className="relative flex items-center gap-2 text-xs text-[#64748b]">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border border-[#e3eaf7] bg-white/90 px-2 py-0.5',
                  isActive && 'border-[var(--color-primary)]/40 text-[var(--color-primary)]'
                )}
              >
                {pct === 100 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                {status}
              </span>
              <span className="ml-auto text-[11px] text-[#9aa6bf]">步骤 {idx + 1}/4</span>
            </div>
            <div className="relative mt-2">
              <div className="text-sm font-semibold text-[#0f172a]">{stageMeta[stage].title}</div>
              <p className="text-xs text-[#94a3b8] mt-0.5 line-clamp-2">{stageMeta[stage].desc}</p>
            </div>
            <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[#ecf1fb]">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function AgentCreatePage() {
  const {
    currentStage,
    stage1,
    stage2,
    stage3,
    stage4,
    progress,
    generationStep,
    isGenerating,
    goStage,
    nextStage,
    prevStage,
    updateStage1,
    updateStage2,
    updateStage3,
    updateStage4,
    toggleArrayField,
    setSelectedImage,
    setGenerationStep,
    setGenerating,
    applyPresetStage1,
    applyPresetStage2,
    applyPresetStage3,
    applyPresetStage4,
  } = useAgentCreationStore()

  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const animTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [highlightStage, setHighlightStage] = useState<StageKey | null>(null)
  const [highlightField, setHighlightField] = useState<{ stage: StageKey; key: string } | null>(null)
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fillTimersRef = useRef<NodeJS.Timeout[]>([])
  const genProgressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const genCompleteTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [appearanceStep, setAppearanceStep] = useState<'config' | 'generate'>('config')
  const [actionsUnlocked, setActionsUnlocked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const pulseHighlight = (stage: StageKey) => {
    setHighlightStage(stage)
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    highlightTimerRef.current = setTimeout(() => setHighlightStage(null), 1200)
  }

  const pulseField = (stage: StageKey, key: string) => {
    setHighlightField({ stage, key })
    setTimeout(() => setHighlightField(null), 900)
  }

  const schedule = (fn: () => void, delay: number) => {
    const timer = setTimeout(fn, delay)
    fillTimersRef.current.push(timer)
  }

  const clearFillTimers = () => {
    fillTimersRef.current.forEach(t => clearTimeout(t))
    fillTimersRef.current = []
  }

  // 监听脚本事件自动填充
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ event: string; step: number }>).detail
      if (!detail) return
      switch (detail.event) {
        case 'fill-stage1':
          clearFillTimers()
          goStage('stage1')
          {
            const steps = [
              () => { updateStage1({ mainDuty: '全能型工作流搭建导师，面向有编程基础的产品开发者，用真实案例驱动教学' }); pulseField('stage1', 'mainDuty') },
              () => { updateStage1({ serviceScene: '工作流自动化学习与产品集成' }); pulseField('stage1', 'serviceScene') },
              () => { updateStage1({ targetUsers: '有编程基础的产品开发者' }); pulseField('stage1', 'targetUsers') },
              () => { updateStage1({ coreCapabilities: '工作流基础概念到高阶实战；n8n/Dify/Coze 可视化编排教学；LangChain/Agent 编排教学；根据场景灵活推荐最优工具' }); pulseField('stage1', 'coreCapabilities') },
              () => { updateStage1({ personality: '务实高效', communicationStyle: '效率优先', expertise: ['自动化', '工作流', '效率工具'], specialSkills: ['流程设计', '节点调试', 'API对接'] }); pulseField('stage1', 'personality') },
            ]
            steps.forEach((fn, idx) => schedule(fn, idx * DELAY_STAGE1))
            schedule(() => pulseHighlight('stage1'), steps.length * DELAY_STAGE1 + DELAY_PULSE)
          }
          break;
        case 'stage1-complete':
          clearFillTimers()
          schedule(() => { updateStage1({ agentName: '小流' }); pulseField('stage1', 'agentName') }, 0)
          schedule(() => { goStage('stage2'); pulseHighlight('stage2') }, DELAY_STAGE_SWITCH)
          break;
        case 'fill-stage2-config-and-generate':
          // 用户回复后，自动填充形象配置并生成
          clearFillTimers()
          goStage('stage2')
          setAppearanceStep('config')
          {
            const steps = [
              () => {
                updateStage2({
                  characterSettings: '名字叫「小流」，一个Q版体型的3D机器人。全身采用圆润萌系设计，像棉花糖一样柔软，拥有一个可显示表情的矩形屏幕头部，眼神充满智慧和友善。头顶有两根短天线，象征信号连接。身体呈暖橙色，搭配科技蓝光晕，胸前有品牌标识位。整体散发着科技感与亲和力并存的气质。'
                })
                pulseField('stage2', 'characterSettings')
              },
              () => { updateStage2({ visualStyle: '3D 渲染' }); pulseField('stage2', 'visualStyle') },
              () => { updateStage2({ characterForm: '机械科技' }); pulseField('stage2', 'characterForm') },
              () => { updateStage2({ bodyProportion: 'Q 版/二头身' }); pulseField('stage2', 'bodyProportion') },
              () => {
                // 填充完成，自动切换到生成页面并启动生成
                setAppearanceStep('generate')
                setActionsUnlocked(false)
                updateStage2({ selectedImageId: null })
                setGenerationStep(0)
                setGenerating(true)
                if (genProgressTimerRef.current) clearInterval(genProgressTimerRef.current)
                if (genCompleteTimerRef.current) clearTimeout(genCompleteTimerRef.current)
                let stepCounter = 0
                genProgressTimerRef.current = setInterval(() => {
                  stepCounter = Math.min(stepCounter + 1, 3)
                  setGenerationStep(stepCounter)
                }, 2000)
                genCompleteTimerRef.current = setTimeout(() => {
                  setGenerating(false)
                  if (genProgressTimerRef.current) clearInterval(genProgressTimerRef.current)
                }, 8000)
              },
            ]
            steps.forEach((fn, idx) => schedule(fn, idx * DELAY_STAGE2))
            schedule(() => pulseHighlight('stage2'), steps.length * DELAY_STAGE2 + DELAY_PULSE)
          }
          break;
        case 'fill-stage2-prepare': {
          goStage('stage2')
          setGenerating(true)
          setGenerationStep(0)
          if (animTimerRef.current) clearInterval(animTimerRef.current)
          let stepCounter = 0
          const timer = setInterval(() => {
            const next = stepCounter + 1
            if (next >= 4) {
              clearInterval(timer)
              setGenerating(false)
            }
            setGenerationStep(next)
            stepCounter = next
          }, 800)
          animTimerRef.current = timer
          break;
        }
        case 'fill-stage2-complete':
          goStage('stage2')
          setGenerating(false)
          if (animTimerRef.current) clearInterval(animTimerRef.current)
          clearFillTimers()
          {
            const steps = [
              () => { updateStage2({ selectedImageId: 'preset_4' }); pulseField('stage2', 'selectedImageId') },
              () => { updateStage2({ visualStyle: '3D 渲染', characterForm: '机械科技', bodyProportion: 'Q 版/二头身', characterSettings: '可爱 3D 机器人，圆润萌系，暖橙配科技蓝光晕，肩部有品牌 Logo，保持倾听姿势' }); pulseField('stage2', 'characterSettings') },
              () => { updateStage2({ selectedActions: ['打字', '书写', '思考', '阅读', '站立', '悬浮', '睡眠', '跑跳', '飞行', '舞蹈', '挥手', '点头', '庆祝', '拥抱'] }); pulseField('stage2', 'selectedActions') },
            ]
            steps.forEach((fn, idx) => schedule(fn, idx * DELAY_STAGE2))
            schedule(() => pulseHighlight('stage2'), steps.length * DELAY_STAGE2 + DELAY_PULSE)
            // 填充完成后自动跳转到 stage3
            schedule(() => { goStage('stage3'); pulseHighlight('stage3') }, steps.length * DELAY_STAGE2 + DELAY_PULSE + DELAY_STAGE_SWITCH)
          }
          break;
        case 'fill-stage3-tools':
          clearFillTimers()
          goStage('stage3')
          {
            const tools = ['web_search', 'code_execution', 'document_generation', 'flow_chart', 'image_processing', 'file_processing', 'api_testing']
            tools.forEach((tool, idx) => schedule(() => {
              toggleArrayField('stage3', 'selectedTools', tool)
              pulseField('stage3', 'selectedTools')
            }, idx * DELAY_STAGE3))
            schedule(() => pulseHighlight('stage3'), tools.length * DELAY_STAGE3 + DELAY_PULSE)
          }
          break;
        case 'fill-stage3-permission':
          clearFillTimers()
          goStage('stage3')
          schedule(() => { updateStage3({ permissionLevel: 'L2' }); pulseField('stage3', 'permissionLevel') }, 0)
          schedule(() => pulseHighlight('stage3'), DELAY_PERMISSION)
          // 填充完成后自动跳转到 stage4
          schedule(() => { goStage('stage4'); pulseHighlight('stage4') }, DELAY_PERMISSION + DELAY_STAGE_SWITCH)
          break;
        case 'fill-stage4':
          clearFillTimers()
          goStage('stage4')
          {
            const steps = [
              () => { updateStage4({ memoryDuration: 'permanent' }); pulseField('stage4', 'memoryDuration') },
              () => { updateStage4({ selfOptimization: 'auto' }); pulseField('stage4', 'selfOptimization') },
              () => { updateStage4({ applicationScenarios: ['platform_mascot', 'feishu_integration'] }); pulseField('stage4', 'applicationScenarios') },
            ]
            steps.forEach((fn, idx) => schedule(fn, idx * DELAY_STAGE4))
            schedule(() => pulseHighlight('stage4'), steps.length * DELAY_STAGE4 + DELAY_PULSE)
            // 填充完成后2秒自动跳转到创建成功页面
            schedule(() => setShowSuccess(true), steps.length * DELAY_STAGE4 + DELAY_PULSE + 2000)
          }
          break;
        default:
          break;
      }
    }
    window.addEventListener('agent-creation-script', handler as EventListener)
    return () => {
      window.removeEventListener('agent-creation-script', handler as EventListener)
      if (animTimerRef.current) clearInterval(animTimerRef.current)
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      if (genProgressTimerRef.current) clearInterval(genProgressTimerRef.current)
      if (genCompleteTimerRef.current) clearTimeout(genCompleteTimerRef.current)
      clearFillTimers()
    }
  }, [applyPresetStage1, applyPresetStage2, applyPresetStage3, applyPresetStage4, goStage, setGenerationStep, setGenerating, setAppearanceStep, setActionsUnlocked, updateStage1, updateStage2, updateStage3, updateStage4, toggleArrayField])

  const overallProgress = useMemo(() => {
    const vals = Object.values(progress)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [progress])

  const isFieldHighlight = (stage: StageKey, key: string) => highlightField?.stage === stage && highlightField.key === key

  const baseInput =
    'w-full rounded-xl border border-[#e2e8f5] bg-white/80 px-4 py-3 text-[#0f172a] placeholder:text-[#94a3b8] shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] transition'
  const inputClass = (stage: StageKey, key: string) =>
    cn(baseInput, isFieldHighlight(stage, key) && 'ring-2 ring-[var(--color-primary)]/50 border-[var(--color-primary)]/50')
  const textareaClass = (stage: StageKey, key: string) =>
    cn(baseInput, 'min-h-[108px] resize-none leading-relaxed align-top', isFieldHighlight(stage, key) && 'ring-2 ring-[var(--color-primary)]/50 border-[var(--color-primary)]/50')

  const handleLogoFile = (file: File) => {
    if (!file) return
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      window.alert('Logo 图片建议控制在 4MB 内')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateStage2({ logoUrl: typeof reader.result === 'string' ? reader.result : '' })
    }
    reader.readAsDataURL(file)
  }

  const handleLogoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleLogoFile(file)
    }
  }

  const handleClearLogo = () => {
    updateStage2({ logoUrl: '' })
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const startImageGeneration = () => {
    setAppearanceStep('generate')
    setActionsUnlocked(false)
    updateStage2({ selectedImageId: null })
    setGenerationStep(0)
    setGenerating(true)
    if (genProgressTimerRef.current) clearInterval(genProgressTimerRef.current)
    if (genCompleteTimerRef.current) clearTimeout(genCompleteTimerRef.current)
    let stepCounter = 0
    genProgressTimerRef.current = setInterval(() => {
      stepCounter = Math.min(stepCounter + 1, 3)
      setGenerationStep(stepCounter)
    }, 2000)
    genCompleteTimerRef.current = setTimeout(() => {
      setGenerating(false)
      if (genProgressTimerRef.current) clearInterval(genProgressTimerRef.current)
    }, 8000)
  }

  const handleSelectImage = (id: string) => {
    setSelectedImage(id)
    setActionsUnlocked(true)
  }

  const renderStage1 = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard
        title="核心骨架"
        description="职责、场景、用户与能力的基础信息"
        icon={<UserRound className="h-5 w-5" />}
        highlight={highlightStage === 'stage1'}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">Agent 名称</p>
            <input
              className={inputClass('stage1', 'agentName')}
              placeholder="例如售后客服 agent、报告自动总结 agent"
              value={stage1.agentName}
              onChange={(e) => updateStage1({ agentName: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">主要职责/定位</p>
            <textarea
              className={textareaClass('stage1', 'mainDuty')}
              placeholder="描述 Agent 的核心职责和定位..."
              value={stage1.mainDuty}
              onChange={(e) => updateStage1({ mainDuty: e.target.value })}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-[#0f172a]">服务场景</p>
              <input
                className={inputClass('stage1', 'serviceScene')}
                placeholder="将在什么场景下使用"
                value={stage1.serviceScene}
                onChange={(e) => updateStage1({ serviceScene: e.target.value })}
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-[#0f172a]">目标用户群体</p>
              <input
                className={inputClass('stage1', 'targetUsers')}
                placeholder="谁会使用这个 Agent"
                value={stage1.targetUsers}
                onChange={(e) => updateStage1({ targetUsers: e.target.value })}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">核心能力需求</p>
            <textarea
              className={textareaClass('stage1', 'coreCapabilities')}
              placeholder="需要具备哪些核心能力..."
              value={stage1.coreCapabilities}
              onChange={(e) => updateStage1({ coreCapabilities: e.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="灵魂注入"
        description="调性、沟通风格与技能"
        icon={<Sparkles className="h-5 w-5" />}
        action={
          <button
            type="button"
            onClick={() => applyPresetStage1(true)}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] transition hover:brightness-105"
          >
            <Sparkles className="h-4 w-4" /> AI 自动推荐
          </button>
        }
        highlight={highlightStage === 'stage1'}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">性格特征</p>
            <input
              className={inputClass('stage1', 'personality')}
              placeholder="例如：专业严谨、活泼友好，或是像钢铁侠一样的幽默感..."
              value={stage1.personality}
              onChange={(e) => updateStage1({ personality: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">沟通风格</p>
            <input
              className={inputClass('stage1', 'communicationStyle')}
              placeholder="例如：正式、随和、鼓励型、效率优先..."
              value={stage1.communicationStyle}
              onChange={(e) => updateStage1({ communicationStyle: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">专业领域</p>
            <input
              className={inputClass('stage1', 'expertise')}
              placeholder="例如：金融分析，K12教育，医疗咨询..."
              value={stage1.expertise.join('，')}
              onChange={(e) => updateStage1({ expertise: e.target.value.split(/[,，]\s*/).filter(Boolean) })}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#0f172a]">特殊技能</p>
            <input
              className={inputClass('stage1', 'specialSkills')}
              placeholder="例如：多语言翻译，Python 代码执行，创意文案撰写..."
              value={stage1.specialSkills.join('，')}
              onChange={(e) => updateStage1({ specialSkills: e.target.value.split(/[,，]\s*/).filter(Boolean) })}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )

  const selectedPreview = useMemo(() => placeholderImages.find((img) => img.id === stage2.selectedImageId) || placeholderImages[0], [stage2.selectedImageId])

  const renderStage2 = () => (
    <div className="space-y-4">
      {appearanceStep === 'config' && (
        <div className="space-y-4">
          <SectionCard
            title="角色设定"
            description="形象提示与灵感标签"
            icon={<Wand2 className="h-5 w-5" />}
            action={
              <button
                type="button"
                onClick={startImageGeneration}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] transition hover:brightness-105"
              >
                <Sparkles className="h-4 w-4" /> 立即生成
              </button>
            }
            highlight={highlightStage === 'stage2'}
          >
            <div className="grid gap-3 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-3">
                <textarea
                  className={textareaClass('stage2', 'characterSettings')}
                  placeholder="名字叫「团子」，一只Q版体型的布偶猫。全身毛发像棉花糖一样蓬松洁白，拥有巨大的深海蓝色眼睛，眼神总是充满了无辜和关切。脖子上系着一个巨大的黄色铃铛，背着一个迷你的红色邮差包。它总是保持着歪头倾听的姿势，偶尔会伸出毛茸茸的爪子做抚摸状。"
                  value={stage2.characterSettings}
                  onChange={(e) => updateStage2({ characterSettings: e.target.value })}
                />
              </div>

              <div className="rounded-2xl border border-dashed border-[#dfe7fb] bg-[#f8faff] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-inner">
                    {stage2.logoUrl ? (
                      <img src={stage2.logoUrl} alt="Logo 预览" className="h-12 w-12 rounded-lg object-contain" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#eef2ff] to-[#e0ecff] text-[var(--color-primary)]">
                        <Upload className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0f172a]">品牌 Logo（可选）</p>
                    <p className="text-xs text-[#64748b]">支持 PNG/SVG，建议 1:1，背景透明更佳</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] shadow-[0_10px_20px_rgba(37,99,235,0.08)] transition hover:-translate-y-[1px]"
                    >
                      <Upload className="h-4 w-4" /> 上传
                    </button>
                    {stage2.logoUrl && (
                      <button
                        type="button"
                        onClick={handleClearLogo}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[#94a3b8] transition hover:text-[#0f172a]"
                      >
                        <X className="h-4 w-4" /> 移除
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="风格 / 形态 / 比例" description="快速选择视觉基调与角色形态" highlight={highlightStage === 'stage2'}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#0f172a] flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0f4ff] to-[#e8edff] text-xs">🎨</span>
                  视觉风格
                </p>
                <div className="flex flex-col gap-2">
                  {visualStyleOptions.map(opt => (
                    <StyleOptionCard
                      key={opt.id}
                      icon={opt.icon}
                      label={opt.label}
                      description={opt.description}
                      selected={stage2.visualStyle === opt.label}
                      highlight={isFieldHighlight('stage2', 'visualStyle')}
                      onClick={() => updateStage2({ visualStyle: opt.label })}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#0f172a] flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0f4ff] to-[#e8edff] text-xs">🎭</span>
                  角色形态
                </p>
                <div className="flex flex-col gap-2">
                  {characterFormOptions.map(opt => (
                    <StyleOptionCard
                      key={opt.id}
                      icon={opt.icon}
                      label={opt.label}
                      description={opt.description}
                      selected={stage2.characterForm === opt.label}
                      highlight={isFieldHighlight('stage2', 'characterForm')}
                      onClick={() => updateStage2({ characterForm: opt.label })}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#0f172a] flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#f0f4ff] to-[#e8edff] text-xs">📐</span>
                  比例体型
                </p>
                <div className="flex flex-col gap-2">
                  {bodyProportionOptions.map(opt => (
                    <StyleOptionCard
                      key={opt.id}
                      icon={opt.icon}
                      label={opt.label}
                      description={opt.description}
                      selected={stage2.bodyProportion === opt.label}
                      highlight={isFieldHighlight('stage2', 'bodyProportion')}
                      onClick={() => updateStage2({ bodyProportion: opt.label })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {appearanceStep === 'generate' && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <SectionCard
              title="生成进度与预览"
              description="8 秒内完成图像生成，随后选择候选形象"
              icon={<ImageIcon className="h-5 w-5" />}
              action={
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-[#0f172a] shadow-sm backdrop-blur">步骤 {Math.min(generationStep + 1, 4)}/4</span>
                  {isGenerating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs text-[#0f172a] shadow-sm backdrop-blur">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" /> 正在生成
                    </span>
                  )}
                </div>
              }
              highlight={highlightStage === 'stage2'}
            >
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/50 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                  <div className={cn('h-60 w-full bg-gradient-to-br', selectedPreview.gradient)} />
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#0f172a] shadow-sm">当前选中</span>
                      {stage2.visualStyle && <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-[#2563eb] shadow-sm">风格 · {stage2.visualStyle}</span>}
                      {stage2.characterForm && <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-[#7c3aed] shadow-sm">形态 · {stage2.characterForm}</span>}
                      {stage2.logoUrl && <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#0f172a] shadow-sm">Logo 已上传</span>}
                    </div>
                    <div className="rounded-xl bg-white/70 px-3 py-2 text-xs text-[#475569] backdrop-blur">
                      <p className="font-semibold text-[#0f172a]">设定摘要</p>
                      <p className="line-clamp-2">{stage2.characterSettings || '描述形象特征、服饰与姿态，示例：圆润萌系机器人，暖橙与科技蓝光晕。'}</p>
                    </div>
                  </div>
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                        <p className="text-sm text-[#0f172a]">图像生成中 · 约 8 秒</p>
                        <p className="text-xs text-[#64748b]">请稍候，我们正在渲染你的形象</p>
                      </div>
                    </div>
                  )}
                </div>

                {!isGenerating ? (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {placeholderImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelectImage(img.id)}
                        className={cn(
                          'group relative overflow-hidden rounded-xl border border-[#e3eaf7] bg-white/80 p-2 text-left shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-[1px] backdrop-blur',
                          stage2.selectedImageId === img.id && 'border-[var(--color-primary)]/60 ring-2 ring-[var(--color-primary)]/30'
                        )}
                      >
                        <div className={cn('h-20 w-full rounded-lg bg-gradient-to-br', img.gradient)} />
                        <p className="mt-1 text-xs font-semibold text-[#0f172a]">{img.name}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {placeholderImages.map((img) => (
                      <div
                        key={img.id}
                        className="rounded-xl border border-dashed border-[#dfe7fb] bg-[#f8faff] p-3 text-center text-xs text-[#94a3b8]"
                      >
                        渐变占位图
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="xl:col-span-2 space-y-4">
              <SectionCard
                title="模型与参数"
                description="选择生图模型与图生视频模型"
                icon={<Image className="h-5 w-5" />}
                highlight={highlightStage === 'stage2'}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium text-[#0f172a]">生图模型</p>
                    <select
                      title="选择生图模型"
                      className={cn(baseInput, 'cursor-pointer')}
                      value={stage2.imageModel}
                      onChange={(e) => updateStage2({ imageModel: e.target.value })}
                    >
                      {generationModels.image.map(model => (
                        <option key={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-[#0f172a]">图生视频</p>
                    <select
                      title="选择图生视频模型"
                      className={cn(baseInput, 'cursor-pointer')}
                      value={stage2.videoModel}
                      onChange={(e) => updateStage2({ videoModel: e.target.value })}
                    >
                      {generationModels.video.map(model => (
                        <option key={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="动作包配置" description="选择形象动作，生成动作效果" highlight={highlightStage === 'stage2'}>
                <div className={cn('space-y-3', !actionsUnlocked && 'opacity-60')}>
                  {!actionsUnlocked && (
                    <div className="rounded-xl border border-dashed border-[#dfe7fb] bg-[#f8faff] px-4 py-3 text-sm text-[#64748b]">
                      请选择一个形象后解锁动作配置
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(actionPackages).map(([category, actions]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-sm font-semibold text-[#0f172a]">
                          {category === 'work' && '工作状态'}
                          {category === 'idle' && '待机状态'}
                          {category === 'active' && '活跃动作'}
                          {category === 'interact' && '互动动作'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {actions.map(item => (
                            <button
                              key={item}
                              type="button"
                              disabled={!actionsUnlocked}
                              onClick={() => toggleArrayField('stage2', 'selectedActions', item)}
                              className={cn(
                                'rounded-full border border-[#e3eaf7] bg-white px-3 py-1.5 text-sm text-[#0f172a] shadow-[0_8px_26px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-[1px]',
                                stage2.selectedActions.includes(item) && 'border-[var(--color-primary)]/50 bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] text-[var(--color-primary)]',
                                isFieldHighlight('stage2', 'selectedActions') && 'ring-2 ring-[var(--color-primary)]/50',
                                !actionsUnlocked && 'cursor-not-allowed'
                              )}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {actionsUnlocked && (
                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                      已选择形象，生成动作效果中...
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStage3 = () => (
    <div className="space-y-4">
      {/* 装备栏预览 */}
      <div className="rounded-2xl border border-[#e3eaf7] bg-gradient-to-r from-white/90 to-[#f8faff]/90 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-[#0f172a]">已装备能力</span>
            <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]">
              {stage3.selectedTools.length}/7
            </span>
          </div>
          <div className="flex items-center gap-2">
            {stage3.permissionLevel && (
              <span className="rounded-full bg-gradient-to-r from-[#2563eb]/10 to-[#7c3aed]/10 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                {permissionOptions.find(p => p.id === stage3.permissionLevel)?.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {stage3.selectedTools.length === 0 ? (
            <span className="text-sm text-[#94a3b8]">暂未装备任何能力，请从下方选择</span>
          ) : (
            stage3.selectedTools.map(toolId => {
              const tool = toolOptions.find(t => t.id === toolId)
              return tool ? (
                <span
                  key={toolId}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] px-3 py-1.5 text-sm text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                >
                  <span>{tool.icon}</span>
                  {tool.label}
                </span>
              ) : null
            })
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard
            title="技能仓库"
            description="精选工具与技能包，已按场景推荐"
            icon={<Sparkles className="h-5 w-5" />}
            action={
              <button
                type="button"
                onClick={() => applyPresetStage3()}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_12px_28px_rgba(37,99,235,0.2)] transition hover:brightness-105"
              >
                <Sparkles className="h-4 w-4" /> 一键全选推荐
              </button>
            }
            highlight={highlightStage === 'stage3'}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {toolOptions.map(tool => (
                <ToolCard
                  key={tool.id}
                  icon={tool.icon}
                  label={tool.label}
                  description={tool.description}
                  selected={stage3.selectedTools.includes(tool.id)}
                  highlight={isFieldHighlight('stage3', 'selectedTools')}
                  recommended={tool.recommended}
                  onClick={() => toggleArrayField('stage3', 'selectedTools', tool.id)}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="权限设置"
          description="选择执行权限边界"
          icon={<Shield className="h-5 w-5" />}
          highlight={highlightStage === 'stage3'}
        >
          <div className="space-y-3">
            {permissionOptions.map(opt => (
              <PermissionCard
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                features={opt.features}
                selected={stage3.permissionLevel === opt.id}
                highlight={isFieldHighlight('stage3', 'permissionLevel')}
                recommended={opt.recommended}
                onClick={() => updateStage3({ permissionLevel: opt.id })}
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )

  const renderStage4 = () => (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 记忆功能 */}
        <SectionCard
          title="记忆功能"
          description="让 Agent 记住用户偏好和历史交互"
          icon={<Brain className="h-5 w-5" />}
          highlight={highlightStage === 'stage4'}
        >
          <div className="space-y-4">
            {/* 记忆效果对比 */}
            <MemoryCompareCard
              withoutMemory={memoryExamples.withoutMemory}
              withMemory={memoryExamples.withMemory}
            />
            {/* 记忆时长选项 */}
            <div className="grid gap-2 sm:grid-cols-2">
              {memoryOptions.map(opt => (
                <MemoryOptionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.description}
                  selected={stage4.memoryDuration === opt.id}
                  highlight={isFieldHighlight('stage4', 'memoryDuration')}
                  recommended={opt.recommended}
                  onClick={() => updateStage4({ memoryDuration: opt.id })}
                />
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 自优化功能 */}
        <SectionCard
          title="自优化功能"
          description="让 Agent 越用越懂你"
          icon={<Sparkles className="h-5 w-5" />}
          highlight={highlightStage === 'stage4'}
        >
          <div className="space-y-4">
            {/* 优化能力列表 */}
            <OptimizationCapabilities capabilities={optimizationCapabilities} />
            {/* 优化模式选项 */}
            <div className="space-y-2">
              {optimizationOptions.map(opt => (
                <MemoryOptionCard
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.description}
                  selected={stage4.selfOptimization === opt.id}
                  highlight={isFieldHighlight('stage4', 'selfOptimization')}
                  recommended={opt.recommended}
                  onClick={() => updateStage4({ selfOptimization: opt.id })}
                />
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* 应用场景 */}
      <SectionCard
        title="应用场景"
        description="选择 Agent 的部署方式（可多选）"
        icon={<Rocket className="h-5 w-5" />}
        highlight={highlightStage === 'stage4'}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {scenarioOptions.map(opt => (
            <ScenarioCard
              key={opt.id}
              icon={opt.icon}
              label={opt.label}
              description={opt.description}
              platforms={opt.platforms}
              selected={stage4.applicationScenarios.includes(opt.id)}
              highlight={isFieldHighlight('stage4', 'applicationScenarios')}
              onClick={() => toggleArrayField('stage4', 'applicationScenarios', opt.id)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderSuccess = () => {
    const selectedImage = placeholderImages.find(img => img.id === stage2.selectedImageId) || placeholderImages[0]
    const selectedPermission = permissionOptions.find(p => p.id === stage3.permissionLevel)
    const selectedMemory = memoryOptions.find(m => m.id === stage4.memoryDuration)
    const selectedOptimization = optimizationOptions.find(o => o.id === stage4.selfOptimization)
    const selectedScenarios = scenarioOptions.filter(s => stage4.applicationScenarios.includes(s.id))

    return (
      <div className="space-y-6">
        {/* 成功标题 */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#0f172a]">创建成功！</h2>
          <p className="mt-2 text-sm text-[#64748b]">你的数字员工已准备就绪</p>
        </div>

        {/* 主要展示区域 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：形象展示 */}
          <SectionCard
            title={`${stage1.agentName || 'Agent'} 的形象`}
            description="你选择的专属形象"
            icon={<ImageIcon className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className={cn('relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br shadow-xl', selectedImage.gradient)}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-lg font-semibold">{selectedImage.name}</p>
                    <p className="mt-1 text-sm opacity-90">{selectedImage.description}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-[#f8faff] p-4">
                <p className="text-sm font-semibold text-[#0f172a] mb-2">形象描述</p>
                <p className="text-sm text-[#64748b] leading-relaxed">{stage2.characterSettings || '暂无描述'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stage2.visualStyle && <span className="rounded-full bg-white px-3 py-1 text-xs text-[#2563eb]">风格 · {stage2.visualStyle}</span>}
                  {stage2.characterForm && <span className="rounded-full bg-white px-3 py-1 text-xs text-[#7c3aed]">形态 · {stage2.characterForm}</span>}
                  {stage2.bodyProportion && <span className="rounded-full bg-white px-3 py-1 text-xs text-[#059669]">比例 · {stage2.bodyProportion}</span>}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 右侧：画像与配置 */}
          <div className="space-y-4">
            <SectionCard
              title="Agent 画像"
              description="核心定位与能力"
              icon={<UserRound className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#64748b] mb-1">名称</p>
                  <p className="text-base font-semibold text-[#0f172a]">{stage1.agentName || '未命名'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#64748b] mb-1">主要职责</p>
                  <p className="text-sm text-[#475569] leading-relaxed">{stage1.mainDuty || '暂无'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#64748b] mb-1">服务场景</p>
                    <p className="text-sm text-[#475569]">{stage1.serviceScene || '暂无'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#64748b] mb-1">目标用户</p>
                    <p className="text-sm text-[#475569]">{stage1.targetUsers || '暂无'}</p>
                  </div>
                </div>
                {stage1.personality && (
                  <div className="flex gap-2">
                    <span className="rounded-full bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] px-3 py-1 text-xs text-[#2563eb]">性格 · {stage1.personality}</span>
                    {stage1.communicationStyle && <span className="rounded-full bg-gradient-to-r from-[#fef3f2] to-[#fee2e2] px-3 py-1 text-xs text-[#dc2626]">风格 · {stage1.communicationStyle}</span>}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="配置明细"
              description="能力、权限与记忆设置"
              icon={<Brain className="h-5 w-5" />}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-[#64748b] mb-1.5">已装备能力 ({stage3.selectedTools.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stage3.selectedTools.map(toolId => {
                      const tool = toolOptions.find(t => t.id === toolId)
                      return tool ? (
                        <span key={toolId} className="inline-flex items-center gap-1 rounded-full bg-white border border-[#e3eaf7] px-2.5 py-1 text-xs text-[#475569]">
                          <span>{tool.icon}</span>
                          {tool.label}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
                {selectedPermission && (
                  <div>
                    <p className="text-xs font-medium text-[#64748b] mb-1">权限等级</p>
                    <p className="text-sm text-[#0f172a]">{selectedPermission.icon} {selectedPermission.label}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {selectedMemory && (
                    <div>
                      <p className="text-xs font-medium text-[#64748b] mb-1">记忆时长</p>
                      <p className="text-sm text-[#475569]">{selectedMemory.label}</p>
                    </div>
                  )}
                  {selectedOptimization && (
                    <div>
                      <p className="text-xs font-medium text-[#64748b] mb-1">自优化</p>
                      <p className="text-sm text-[#475569]">{selectedOptimization.label}</p>
                    </div>
                  )}
                </div>
                {selectedScenarios.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#64748b] mb-1.5">应用场景</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedScenarios.map(s => (
                        <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] px-2.5 py-1 text-xs text-[#2563eb]">
                          {s.icon} {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* 操作按钮区 */}
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-6 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition hover:brightness-110"
          >
            <Sparkles className="h-5 w-5" />
            开始聊天
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#2563eb] bg-white px-6 py-4 text-base font-semibold text-[#2563eb] shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:bg-[#f8faff]"
          >
            <Wand2 className="h-5 w-5" />
            优化 Agent
          </button>
          <button
            type="button"
            onClick={() => {
              const config = {
                metadata: {
                  agentName: stage1.agentName,
                  createdAt: new Date().toISOString(),
                  version: '1.0.0'
                },
                profile: stage1,
                appearance: stage2,
                capabilities: stage3,
                memory: stage4
              }
              const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${stage1.agentName || 'agent'}-config.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#e3eaf7] bg-white px-6 py-4 text-base font-semibold text-[#64748b] shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:border-[#cbd5e1] hover:text-[#475569]"
          >
            <Rocket className="h-5 w-5" />
            导出配置
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-auto bg-gradient-to-b from-[#f8fafc] via-[#f8fbff] to-[#eef2ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,#dbeafe,transparent_55%)] blur-3xl opacity-70" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,#e0e7ff,transparent_55%)] blur-3xl opacity-60" />
        <div className="absolute left-1/2 bottom-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,#c7d2fe,transparent_55%)] blur-3xl opacity-40" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 px-6 py-8 lg:max-w-7xl lg:px-10">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7b9d]">Agent Master · 创建向导</p>
              <h1 className="text-2xl font-semibold text-[#0f172a]">{showSuccess ? '创建完成' : '数字员工创建'}</h1>
              <p className="text-sm text-[#64748b]">{showSuccess ? '你的数字员工已成功创建并准备就绪' : '参考示例完成画像定义、形象生成、能力装配与记忆进化'}</p>
            </div>
            {!showSuccess && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#2563eb] shadow-[0_12px_28px_rgba(37,99,235,0.2)]">
                <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                <span>整体完成度 {overallProgress}%</span>
              </div>
            )}
          </div>
        </div>

        {!showSuccess && <StageHeader currentStage={currentStage} progress={progress} onStageClick={goStage} />}

        <div className="space-y-4">
          {!showSuccess && currentStage === 'stage1' && renderStage1()}
          {!showSuccess && currentStage === 'stage2' && renderStage2()}
          {!showSuccess && currentStage === 'stage3' && renderStage3()}
          {!showSuccess && currentStage === 'stage4' && renderStage4()}
          {showSuccess && renderSuccess()}
        </div>

        {!showSuccess && (
          <div className="flex flex-col gap-3 border-t border-[#e4eaf5] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={prevStage}
              disabled={currentStage === 'stage1'}
              className={cn(
                'inline-flex items-center gap-1 text-sm text-[#64748b] transition hover:text-[var(--color-primary)]',
                currentStage === 'stage1' && 'cursor-not-allowed text-[#c0c8da]'
              )}
            >
              <ChevronLeft className="h-4 w-4" /> 上一步
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#64748b]">已完成 {overallProgress}%</span>
              {currentStage === 'stage4' && overallProgress === 100 ? (
                <button
                  type="button"
                  onClick={() => setShowSuccess(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_32px_rgba(16,185,129,0.28)] transition hover:brightness-105"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  完成创建
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStage}
                  disabled={currentStage === 'stage4'}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_32px_rgba(37,99,235,0.28)] transition hover:brightness-105',
                    currentStage === 'stage4' && 'cursor-not-allowed opacity-60 hover:brightness-100'
                  )}
                >
                  下一步 <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="flex justify-center border-t border-[#e4eaf5] pt-4">
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="inline-flex items-center gap-1 text-sm text-[#64748b] transition hover:text-[var(--color-primary)]"
            >
              <ChevronLeft className="h-4 w-4" /> 返回编辑
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentCreatePage
