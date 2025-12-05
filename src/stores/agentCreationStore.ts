import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StageKey = 'stage1' | 'stage2' | 'stage3' | 'stage4'

export interface Stage1Profile {
  agentName: string
  mainDuty: string
  serviceScene: string
  targetUsers: string
  coreCapabilities: string
  personality: string
  communicationStyle: string
  expertise: string[]
  specialSkills: string[]
}

export interface Stage2Appearance {
  characterSettings: string
  visualStyle: string
  characterForm: string
  bodyProportion: string
  selectedImageId: string | null
  selectedActions: string[]
  imageModel: string
  videoModel: string
}

export interface Stage3Capability {
  selectedTools: string[]
  permissionLevel: string
}

export interface Stage4Memory {
  memoryDuration: string
  selfOptimization: string
  applicationScenarios: string[]
}

interface ProgressState {
  stage1: number
  stage2: number
  stage3: number
  stage4: number
}

interface AgentCreationState {
  currentStage: StageKey
  stage1: Stage1Profile
  stage2: Stage2Appearance
  stage3: Stage3Capability
  stage4: Stage4Memory
  progress: ProgressState
  generationStep: number
  isGenerating: boolean
  goStage: (stage: StageKey) => void
  nextStage: () => void
  prevStage: () => void
  updateStage1: (payload: Partial<Stage1Profile>) => void
  updateStage2: (payload: Partial<Stage2Appearance>) => void
  updateStage3: (payload: Partial<Stage3Capability>) => void
  updateStage4: (payload: Partial<Stage4Memory>) => void
  toggleArrayField: (stage: StageKey, key: keyof Stage1Profile | keyof Stage2Appearance | keyof Stage3Capability | keyof Stage4Memory, value: string) => void
  setSelectedImage: (id: string) => void
  setGenerationStep: (step: number) => void
  setGenerating: (flag: boolean) => void
  applyPresetStage1: (withName?: boolean) => void
  applyPresetStage2: (full?: boolean) => void
  applyPresetStage3: (permission?: string) => void
  applyPresetStage4: () => void
  resetAll: () => void
}

const initialStage1: Stage1Profile = {
  agentName: '',
  mainDuty: '',
  serviceScene: '',
  targetUsers: '',
  coreCapabilities: '',
  personality: '',
  communicationStyle: '',
  expertise: [],
  specialSkills: [],
}

const initialStage2: Stage2Appearance = {
  characterSettings: '',
  visualStyle: '',
  characterForm: '',
  bodyProportion: '',
  selectedImageId: null,
  selectedActions: [],
  imageModel: '即梦 4.0',
  videoModel: 'Wan 2.2',
}

const initialStage3: Stage3Capability = {
  selectedTools: [],
  permissionLevel: '',
}

const initialStage4: Stage4Memory = {
  memoryDuration: '',
  selfOptimization: '',
  applicationScenarios: [],
}

const initialProgress: ProgressState = {
  stage1: 0,
  stage2: 0,
  stage3: 0,
  stage4: 0,
}

const stageOrder: StageKey[] = ['stage1', 'stage2', 'stage3', 'stage4']

function computeStage1Progress(data: Stage1Profile) {
  const required = ['agentName', 'mainDuty', 'serviceScene', 'targetUsers', 'coreCapabilities'] as (keyof Stage1Profile)[]
  const done = required.filter(k => {
    const val = data[k]
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val && String(val).trim())
  }).length
  return Math.round((done / required.length) * 100)
}

function computeStage2Progress(data: Stage2Appearance) {
  const required: (keyof Stage2Appearance)[] = ['characterSettings', 'visualStyle', 'characterForm', 'bodyProportion', 'selectedImageId']
  const done = required.filter(k => {
    const val = data[k]
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val && String(val).trim())
  }).length
  return Math.round((done / required.length) * 100)
}

function computeStage3Progress(data: Stage3Capability) {
  const required: (keyof Stage3Capability)[] = ['selectedTools', 'permissionLevel']
  const done = required.filter(k => {
    const val = data[k]
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val && String(val).trim())
  }).length
  return Math.round((done / required.length) * 100)
}

function computeStage4Progress(data: Stage4Memory) {
  const required: (keyof Stage4Memory)[] = ['memoryDuration', 'selfOptimization', 'applicationScenarios']
  const done = required.filter(k => {
    const val = data[k]
    if (Array.isArray(val)) return val.length > 0
    return Boolean(val && String(val).trim())
  }).length
  return Math.round((done / required.length) * 100)
}

export const useAgentCreationStore = create<AgentCreationState>()(
  devtools((set, get) => ({
    currentStage: 'stage1',
    stage1: initialStage1,
    stage2: initialStage2,
    stage3: initialStage3,
    stage4: initialStage4,
    progress: initialProgress,
    generationStep: 0,
    isGenerating: false,

    goStage: (stage) => set({ currentStage: stage }),
    nextStage: () => set((state) => {
      const idx = stageOrder.indexOf(state.currentStage)
      return idx < stageOrder.length - 1 ? { currentStage: stageOrder[idx + 1] } : state
    }),
    prevStage: () => set((state) => {
      const idx = stageOrder.indexOf(state.currentStage)
      return idx > 0 ? { currentStage: stageOrder[idx - 1] } : state
    }),

    updateStage1: (payload) => set((state) => {
      const stage1 = { ...state.stage1, ...payload }
      return {
        stage1,
        progress: { ...state.progress, stage1: computeStage1Progress(stage1) },
      }
    }),

    updateStage2: (payload) => set((state) => {
      const stage2 = { ...state.stage2, ...payload }
      return {
        stage2,
        progress: { ...state.progress, stage2: computeStage2Progress(stage2) },
      }
    }),

    updateStage3: (payload) => set((state) => {
      const stage3 = { ...state.stage3, ...payload }
      return {
        stage3,
        progress: { ...state.progress, stage3: computeStage3Progress(stage3) },
      }
    }),

    updateStage4: (payload) => set((state) => {
      const stage4 = { ...state.stage4, ...payload }
      return {
        stage4,
        progress: { ...state.progress, stage4: computeStage4Progress(stage4) },
      }
    }),

    toggleArrayField: (stage, key, value) => set((state) => {
      if (stage === 'stage1') {
        const arr = (state.stage1 as any)[key] as string[]
        const next = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
        const stage1 = { ...state.stage1, [key]: next }
        return { stage1, progress: { ...state.progress, stage1: computeStage1Progress(stage1) } }
      }
      if (stage === 'stage2') {
        const arr = (state.stage2 as any)[key] as string[]
        const next = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
        const stage2 = { ...state.stage2, [key]: next }
        return { stage2, progress: { ...state.progress, stage2: computeStage2Progress(stage2) } }
      }
      if (stage === 'stage3') {
        const arr = (state.stage3 as any)[key] as string[]
        const next = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
        const stage3 = { ...state.stage3, [key]: next }
        return { stage3, progress: { ...state.progress, stage3: computeStage3Progress(stage3) } }
      }
      if (stage === 'stage4') {
        const arr = (state.stage4 as any)[key] as string[]
        const next = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value]
        const stage4 = { ...state.stage4, [key]: next }
        return { stage4, progress: { ...state.progress, stage4: computeStage4Progress(stage4) } }
      }
      return state
    }),

    setSelectedImage: (id) => set((state) => {
      const stage2 = { ...state.stage2, selectedImageId: id }
      return { stage2, progress: { ...state.progress, stage2: computeStage2Progress(stage2) } }
    }),

    setGenerationStep: (step) => set({ generationStep: step }),
    setGenerating: (flag) => set({ isGenerating: flag }),

    applyPresetStage1: (withName = false) => set((state) => {
      const stage1: Stage1Profile = {
        agentName: withName ? '小流' : state.stage1.agentName,
        mainDuty: '全能型工作流搭建导师，面向有编程基础的产品开发者，用真实案例驱动教学',
        serviceScene: '工作流自动化学习与产品集成',
        targetUsers: '有编程基础的产品开发者',
        coreCapabilities: '工作流基础概念到高阶实战；n8n/Dify/Coze 可视化编排教学；LangChain/Agent 编排教学；根据场景灵活推荐最优工具',
        personality: '务实高效',
        communicationStyle: '效率优先',
        expertise: ['自动化', '工作流', '效率工具'],
        specialSkills: ['流程设计', '节点调试', 'API对接'],
      }
      return {
        stage1,
        progress: { ...state.progress, stage1: computeStage1Progress(stage1) },
      }
    }),

    applyPresetStage2: (full = false) => set((state) => {
      const stage2: Stage2Appearance = {
        ...state.stage2,
        characterSettings: '可爱 3D 机器人，圆润萌系，暖橙配科技蓝光晕，肩部有品牌 Logo，保持倾听姿势',
        visualStyle: '3D 渲染',
        characterForm: '机械科技',
        bodyProportion: 'Q 版/二头身',
        selectedImageId: state.stage2.selectedImageId || 'preset_4',
        selectedActions: full
          ? ['打字', '书写', '思考', '阅读', '站立', '悬浮', '睡眠', '跑跳', '飞行', '舞蹈', '挥手', '点头', '庆祝', '拥抱']
          : ['思考', '阅读', '悬浮', '挥手', '点头'],
        imageModel: '即梦 4.0',
        videoModel: 'Wan 2.2',
      }
      return {
        stage2,
        progress: { ...state.progress, stage2: computeStage2Progress(stage2) },
      }
    }),

    applyPresetStage3: (permission = 'L2') => set((state) => {
      const stage3: Stage3Capability = {
        selectedTools: ['web_search', 'code_execution', 'document_generation', 'flow_chart', 'image_processing', 'file_processing', 'api_testing'],
        permissionLevel: permission,
      }
      return {
        stage3,
        progress: { ...state.progress, stage3: computeStage3Progress(stage3) },
      }
    }),

    applyPresetStage4: () => set((state) => {
      const stage4: Stage4Memory = {
        memoryDuration: 'permanent',
        selfOptimization: 'auto',
        applicationScenarios: ['platform_mascot', 'feishu_integration'],
      }
      return {
        stage4,
        progress: { ...state.progress, stage4: computeStage4Progress(stage4) },
      }
    }),

    resetAll: () => ({
      currentStage: 'stage1',
      stage1: initialStage1,
      stage2: initialStage2,
      stage3: initialStage3,
      stage4: initialStage4,
      progress: initialProgress,
      generationStep: 0,
      isGenerating: false,
    }),
  }))
)

export default useAgentCreationStore
