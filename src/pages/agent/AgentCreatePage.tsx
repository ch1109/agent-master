import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Wand2, Sparkles, Loader2, CheckCircle2, Circle, UserRound } from 'lucide-react'
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
} from '@/data/agentCreationOptions'

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

function Chip({
  label,
  description,
  selected,
  onClick,
  icon,
  size = 'md',
  highlight = false,
}: {
  label: string
  description?: string
  selected?: boolean
  onClick?: () => void
  icon?: React.ReactNode
  size?: 'sm' | 'md'
  highlight?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-xl border transition-all px-3 py-2 bg-white/90 hover:-translate-y-[1px] shadow-[0_8px_28px_rgba(72,98,255,0.06)]',
        selected ? 'border-[var(--color-primary)]/50 bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] text-[var(--color-primary)]' : 'border-[#e3eaf7] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40',
        highlight && 'ring-2 ring-[var(--color-primary)]/50 border-[var(--color-primary)]/60',
        size === 'sm' ? 'py-2 text-sm' : 'py-2.5 text-base'
      )}
    >
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {selected && <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)]" />}
          </div>
          {description && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{description}</p>}
        </div>
      </div>
    </button>
  )
}

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
        'relative overflow-hidden rounded-2xl border border-[#e3eaf7] bg-white/90 shadow-[0_20px_60px_rgba(72,98,255,0.08)] backdrop-blur transition-all',
        highlight && 'ring-2 ring-[var(--color-primary)]/30 border-[var(--color-primary)]/40'
      )}
    >
      <div className="absolute -right-10 -top-16 h-28 w-28 rounded-full bg-gradient-to-br from-[#e0e7ff] to-transparent opacity-70 blur-3xl" aria-hidden />
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="flex items-start gap-2">
          {icon && <div className="mt-0.5 text-[var(--color-primary)]">{icon}</div>}
          <div>
            <p className="text-sm font-semibold text-[#1f2b45]">{title}</p>
            {description && <p className="text-xs text-[#92a3c4] mt-0.5">{description}</p>}
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
              'relative overflow-hidden rounded-2xl border border-[#e3eaf7] bg-white/80 px-4 py-3 text-left shadow-[0_16px_46px_rgba(72,98,255,0.1)] transition-all backdrop-blur',
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
            {isActive && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5aa2ff] via-[#5f7bff] to-[#5a5cff]" aria-hidden />}
            <div className="relative flex items-center gap-2 text-xs text-[#7f8fa9]">
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
              <div className="text-sm font-semibold text-[#1f2b45]">{stageMeta[stage].title}</div>
              <p className="text-xs text-[#8da0c2] mt-0.5 line-clamp-2">{stageMeta[stage].desc}</p>
            </div>
            <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[#ecf1fb]">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#5aa2ff] to-[#5a5cff] transition-all"
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

  const animTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [highlightStage, setHighlightStage] = useState<StageKey | null>(null)
  const [highlightField, setHighlightField] = useState<{ stage: StageKey; key: string } | null>(null)
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fillTimersRef = useRef<NodeJS.Timeout[]>([])

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
      clearFillTimers()
    }
  }, [applyPresetStage1, applyPresetStage2, applyPresetStage3, applyPresetStage4, goStage, setGenerationStep, setGenerating, updateStage1, updateStage2, updateStage3, updateStage4, toggleArrayField])

  const overallProgress = useMemo(() => {
    const vals = Object.values(progress)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [progress])

  const isFieldHighlight = (stage: StageKey, key: string) => highlightField?.stage === stage && highlightField.key === key

  const baseInput =
    'w-full rounded-xl border border-[#e2e8f5] bg-white/90 px-4 py-3 text-[var(--text-primary)] placeholder:text-[#9fb0c8] shadow-[0_14px_40px_rgba(72,98,255,0.08)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] transition'
  const inputClass = (stage: StageKey, key: string) =>
    cn(baseInput, isFieldHighlight(stage, key) && 'ring-2 ring-[var(--color-primary)]/50 border-[var(--color-primary)]/50')
  const textareaClass = (stage: StageKey, key: string) =>
    cn(baseInput, 'min-h-[108px] resize-none leading-relaxed align-top', isFieldHighlight(stage, key) && 'ring-2 ring-[var(--color-primary)]/50 border-[var(--color-primary)]/50')
  const quickOptionClass =
    'inline-flex items-center gap-1 rounded-full border border-[#e3eaf7] bg-white/90 px-3 py-1.5 text-xs text-[#5a6b8c] shadow-[0_6px_20px_rgba(72,98,255,0.05)] transition-all hover:-translate-y-[1px] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)]'

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
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">Agent 名称</p>
            <input
              className={inputClass('stage1', 'agentName')}
              placeholder="例如：小流 / FlowMentor"
              value={stage1.agentName}
              onChange={(e) => updateStage1({ agentName: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">主要职责/定位</p>
            <textarea
              className={textareaClass('stage1', 'mainDuty')}
              placeholder="描述 Agent 的核心职责和定位..."
              value={stage1.mainDuty}
              onChange={(e) => updateStage1({ mainDuty: e.target.value })}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">服务场景</p>
              <input
                className={inputClass('stage1', 'serviceScene')}
                placeholder="将在什么场景下使用"
                value={stage1.serviceScene}
                onChange={(e) => updateStage1({ serviceScene: e.target.value })}
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">目标用户群体</p>
              <input
                className={inputClass('stage1', 'targetUsers')}
                placeholder="谁会使用这个 Agent"
                value={stage1.targetUsers}
                onChange={(e) => updateStage1({ targetUsers: e.target.value })}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">核心能力需求</p>
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
        description="调性、沟通风格与技能标签"
        icon={<Sparkles className="h-5 w-5" />}
        action={
          <button
            type="button"
            onClick={() => applyPresetStage1(true)}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#5aa2ff] via-[#5f7bff] to-[#5a5cff] px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_12px_28px_rgba(72,98,255,0.24)] transition hover:brightness-105"
          >
            <Sparkles className="h-4 w-4" /> AI 自动推荐
          </button>
        }
        highlight={highlightStage === 'stage1'}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">性格特征</p>
            <input
              className={inputClass('stage1', 'personality')}
              placeholder="例如：专业严谨、活泼友好，或是像钢铁侠一样的幽默感..."
              value={stage1.personality}
              onChange={(e) => updateStage1({ personality: e.target.value })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['专业严谨', '活泼友好', '幽默风趣', '温和耐心', '高效直接', '务实高效'].map(item => (
                <button key={item} type="button" onClick={() => updateStage1({ personality: item })} className={quickOptionClass}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">沟通风格</p>
            <input
              className={inputClass('stage1', 'communicationStyle')}
              placeholder="例如：正式、随和、鼓励型、效率优先..."
              value={stage1.communicationStyle}
              onChange={(e) => updateStage1({ communicationStyle: e.target.value })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['正式', '随和', '鼓励型', '效率优先', '引导式'].map(item => (
                <button key={item} type="button" onClick={() => updateStage1({ communicationStyle: item })} className={quickOptionClass}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">专业领域</p>
            <input
              className={inputClass('stage1', 'expertise')}
              placeholder="例如：金融分析，K12教育，医疗咨询..."
              value={stage1.expertise.join('，')}
              onChange={(e) => updateStage1({ expertise: e.target.value.split(/[,，]\s*/).filter(Boolean) })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['自动化', '工作流', '效率工具', '金融', '教育', '医疗', '零售', '技术开发', '产品管理'].map(item => (
                <button key={item} type="button" onClick={() => toggleArrayField('stage1', 'expertise', item)} className={quickOptionClass}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-[#1f2b45]">特殊技能</p>
            <input
              className={inputClass('stage1', 'specialSkills')}
              placeholder="例如：多语言翻译，Python 代码执行，创意文案撰写..."
              value={stage1.specialSkills.join('，')}
              onChange={(e) => updateStage1({ specialSkills: e.target.value.split(/[,，]\s*/).filter(Boolean) })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['流程设计', '节点调试', 'API对接', '多语言', '数据分析', '创意策划'].map(item => (
                <button key={item} type="button" onClick={() => toggleArrayField('stage1', 'specialSkills', item)} className={quickOptionClass}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  const renderStage2 = () => (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="角色设定"
          description="描述形象、特征、服饰等"
          icon={<Wand2 className="h-5 w-5" />}
          action={
            isGenerating ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e3eaf7] bg-white/90 px-3 py-1 text-xs text-[#5a6b8c]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" /> AI 生成中
              </span>
            ) : (
              <button
                type="button"
                onClick={() => applyPresetStage2(true)}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#5aa2ff] via-[#5f7bff] to-[#5a5cff] px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_12px_28px_rgba(72,98,255,0.24)] transition hover:brightness-105"
              >
                <Sparkles className="h-4 w-4" /> AI 快速填充
              </button>
            )
          }
          highlight={highlightStage === 'stage2'}
        >
          <textarea
            className={textareaClass('stage2', 'characterSettings')}
            placeholder="例如：圆润萌系 3D 机器人，暖橙+蓝色光晕，肩部有品牌 Logo，保持倾听姿势"
            value={stage2.characterSettings}
            onChange={(e) => updateStage2({ characterSettings: e.target.value })}
          />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">生图模型</p>
              <select
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
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">图生视频</p>
              <select
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

        <SectionCard title="形象风格" description="视觉风格、角色形态与比例" highlight={highlightStage === 'stage2'}>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">视觉风格</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {visualStyleOptions.map(opt => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    selected={stage2.visualStyle === opt.label}
                    highlight={isFieldHighlight('stage2', 'visualStyle')}
                    onClick={() => updateStage2({ visualStyle: opt.label })}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">角色形态</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {characterFormOptions.map(opt => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    selected={stage2.characterForm === opt.label}
                    highlight={isFieldHighlight('stage2', 'characterForm')}
                    onClick={() => updateStage2({ characterForm: opt.label })}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-[#1f2b45]">体型与比例</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {bodyProportionOptions.map(opt => (
                  <Chip
                    key={opt.id}
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

      <SectionCard title="形象生成" description="AI 生成 4 张候选，先用渐变占位" highlight={highlightStage === 'stage2'}>
        {isGenerating ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#dfe7fb] bg-[#f8faff] px-4 py-3 text-[#5a6b8c]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-medium text-[#1f2b45]">正在生成形象...</p>
              <p className="text-xs text-[#7f8fa9]">步骤 {Math.min(generationStep + 1, 4)}/4 · 正在渲染视觉效果</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {placeholderImages.map(img => {
              const selected = stage2.selectedImageId === img.id
              const isHighlight = isFieldHighlight('stage2', 'selectedImageId')
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-[#e3eaf7] bg-white/90 p-3 text-left shadow-[0_14px_40px_rgba(72,98,255,0.1)] transition-all hover:-translate-y-1',
                    selected && 'border-[var(--color-primary)]/60 ring-2 ring-[var(--color-primary)]/30',
                    isHighlight && 'ring-2 ring-[var(--color-primary)]/50'
                  )}
                >
                  <div className={cn('h-32 w-full rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-[1.02]', img.gradient)} />
                  <p className="mt-2 text-sm font-semibold text-[#1f2b45]">{img.name}</p>
                  <p className="text-xs text-[#7f8fa9]">{img.description}</p>
                  {selected && (
                    <div className="absolute right-3 top-3 rounded-full bg-white p-1.5 shadow">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="动作包配置" description="可多选，支持手动调整" highlight={highlightStage === 'stage2'}>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(actionPackages).map(([category, actions]) => (
            <div key={category} className="space-y-2">
              <p className="text-sm font-semibold text-[#1f2b45]">
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
                    onClick={() => toggleArrayField('stage2', 'selectedActions', item)}
                    className={cn(
                      'rounded-full border border-[#e3eaf7] bg-white px-3 py-1.5 text-sm text-[#1f2b45] shadow-[0_8px_26px_rgba(72,98,255,0.07)] transition-all hover:-translate-y-[1px]',
                      stage2.selectedActions.includes(item) && 'border-[var(--color-primary)]/50 bg-gradient-to-r from-[#f4f7ff] to-[#e8edff] text-[var(--color-primary)]',
                      isFieldHighlight('stage2', 'selectedActions') && 'ring-2 ring-[var(--color-primary)]/50'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderStage3 = () => (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionCard
          title="能力装配"
          description="选择工具与技能包"
          action={
            <button
              type="button"
              onClick={() => applyPresetStage3()}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30 transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              <Sparkles className="h-4 w-4" /> 一键全选推荐
            </button>
          }
          highlight={highlightStage === 'stage3'}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {toolOptions.map(tool => (
              <Chip
                key={tool.id}
                label={tool.label}
                description={tool.description}
                selected={stage3.selectedTools.includes(tool.id)}
                highlight={isFieldHighlight('stage3', 'selectedTools')}
                onClick={() => toggleArrayField('stage3', 'selectedTools', tool.id)}
              />
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="权限设置" description="选择执行权限边界" highlight={highlightStage === 'stage3'}>
        <div className="space-y-2">
          {permissionOptions.map(opt => (
            <Chip
              key={opt.id}
              label={opt.label}
              description={opt.description}
              selected={stage3.permissionLevel === opt.id}
              highlight={isFieldHighlight('stage3', 'permissionLevel')}
              onClick={() => updateStage3({ permissionLevel: opt.id })}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderStage4 = () => (
    <div className="grid gap-4 lg:grid-cols-3">
      <SectionCard
        title="记忆功能"
        description="选择记忆范围与留存策略"
        action={
          <button
            type="button"
            onClick={() => applyPresetStage4()}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30 transition hover:bg-[var(--color-primary)] hover:text-white"
          >
            <Sparkles className="h-4 w-4" /> 推荐配置
          </button>
        }
        highlight={highlightStage === 'stage4'}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {memoryOptions.map(opt => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={stage4.memoryDuration === opt.id}
              highlight={isFieldHighlight('stage4', 'memoryDuration')}
              onClick={() => updateStage4({ memoryDuration: opt.id })}
            />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="自优化功能" description="让 Agent 越用越懂你" highlight={highlightStage === 'stage4'}>
        <div className="grid gap-2 sm:grid-cols-1">
          {optimizationOptions.map(opt => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={stage4.selfOptimization === opt.id}
              highlight={isFieldHighlight('stage4', 'selfOptimization')}
              onClick={() => updateStage4({ selfOptimization: opt.id })}
            />
          ))}
        </div>
      </SectionCard>
      <SectionCard title="应用场景" description="可多选" highlight={highlightStage === 'stage4'}>
        <div className="grid gap-2 sm:grid-cols-2">
          {scenarioOptions.map(opt => (
            <Chip
              key={opt.id}
              label={opt.label}
              selected={stage4.applicationScenarios.includes(opt.id)}
              highlight={isFieldHighlight('stage4', 'applicationScenarios')}
              onClick={() => toggleArrayField('stage4', 'applicationScenarios', opt.id)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-[#f3f7ff] via-white to-[#f7f9ff]">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:max-w-7xl lg:px-10">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7b9d]">Agent Master · 创建向导</p>
              <h1 className="text-2xl font-semibold text-[#1f2b45]">数字员工创建</h1>
              <p className="text-sm text-[#7f8fa9]">参考示例完成画像定义、形象生成、能力装配与记忆进化</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#4f5fff] shadow-[0_14px_36px_rgba(72,98,255,0.18)]">
              <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              <span>整体完成度 {overallProgress}%</span>
            </div>
          </div>
        </div>

        <StageHeader currentStage={currentStage} progress={progress} onStageClick={goStage} />

        <div className="space-y-4">
          {currentStage === 'stage1' && renderStage1()}
          {currentStage === 'stage2' && renderStage2()}
          {currentStage === 'stage3' && renderStage3()}
          {currentStage === 'stage4' && renderStage4()}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e4eaf5] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={prevStage}
            disabled={currentStage === 'stage1'}
            className={cn(
              'inline-flex items-center gap-1 text-sm text-[#5a6b8c] transition hover:text-[var(--color-primary)]',
              currentStage === 'stage1' && 'cursor-not-allowed text-[#c0c8da]'
            )}
          >
            <ChevronLeft className="h-4 w-4" /> 上一步
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7f8fa9]">已完成 {overallProgress}%</span>
            <button
              type="button"
              onClick={nextStage}
              disabled={currentStage === 'stage4'}
              className={cn(
                'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5aa2ff] via-[#5f7bff] to-[#5a5cff] px-5 py-3 text-sm font-medium text-white shadow-[0_16px_36px_rgba(72,98,255,0.35)] transition hover:brightness-105',
                currentStage === 'stage4' && 'cursor-not-allowed opacity-60 hover:brightness-100'
              )}
            >
              下一步 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentCreatePage
