/**
 * Agent 配置状态管理
 * 管理意图、能力、UI偏好和调试选项
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 意图配置类型
export interface IntentConfig {
  id: string
  name: string
  type: string
  description: string
  triggerType: 'semantic' | 'keyword' | 'regex'
  keywords: string[]
  examples: string[]
  responseType: 'capability' | 'navigation' | 'chat'
  prompt: string
  priority: number
  requireConfirm: boolean
  status: 'draft' | 'active'
}

// 能力配置类型
export interface Capability {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  config?: Record<string, unknown>
}

// UI偏好设置类型
export interface UIPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en-US'
  aiPanelWidth: number
  showThinkingProcess: boolean
  enableTypewriterEffect: boolean
  typewriterSpeed: number
}

// 调试选项类型
export interface DebugOptions {
  enabled: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  showRequestDetails: boolean
  showResponseDetails: boolean
  mockDelay: number
  useMockResponse: boolean
}

// 完整的 Agent 配置状态
interface AgentState {
  // 当前编辑的意图
  currentIntent: IntentConfig | null
  // 所有意图列表
  intents: IntentConfig[]
  // 能力列表
  capabilities: Capability[]
  // UI偏好设置
  uiPreferences: UIPreferences
  // 调试选项
  debugOptions: DebugOptions
  // 是否有未保存的更改
  hasUnsavedChanges: boolean
  
  // Actions
  setCurrentIntent: (intent: IntentConfig | null) => void
  updateCurrentIntent: (updates: Partial<IntentConfig>) => void
  addIntent: (intent: IntentConfig) => void
  updateIntent: (id: string, updates: Partial<IntentConfig>) => void
  deleteIntent: (id: string) => void
  
  updateCapability: (id: string, enabled: boolean) => void
  updateCapabilityConfig: (id: string, config: Record<string, unknown>) => void
  
  updateUIPreferences: (updates: Partial<UIPreferences>) => void
  updateDebugOptions: (updates: Partial<DebugOptions>) => void
  
  resetConfig: () => void
  markSaved: () => void
}

// 默认值
const defaultCapabilities: Capability[] = [
  { id: 'search', name: '搜索', description: '在知识库中搜索信息', icon: 'Search', enabled: true },
  { id: 'browse', name: '浏览', description: '浏览和导航页面', icon: 'Globe', enabled: true },
  { id: 'code', name: '代码', description: '生成和分析代码', icon: 'Code', enabled: false },
  { id: 'image', name: '图像', description: '分析和生成图像', icon: 'Image', enabled: false },
]

const defaultUIPreferences: UIPreferences = {
  theme: 'light',
  language: 'zh-CN',
  aiPanelWidth: 400,
  showThinkingProcess: true,
  enableTypewriterEffect: true,
  typewriterSpeed: 30,
}

const defaultDebugOptions: DebugOptions = {
  enabled: false,
  logLevel: 'info',
  showRequestDetails: false,
  showResponseDetails: false,
  mockDelay: 1000,
  useMockResponse: true, // 默认使用模拟响应
}

// 创建 Store
export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      currentIntent: null,
      intents: [],
      capabilities: defaultCapabilities,
      uiPreferences: defaultUIPreferences,
      debugOptions: defaultDebugOptions,
      hasUnsavedChanges: false,

      setCurrentIntent: (intent) => set({ currentIntent: intent }),

      updateCurrentIntent: (updates) => set((state) => ({
        currentIntent: state.currentIntent 
          ? { ...state.currentIntent, ...updates }
          : null,
        hasUnsavedChanges: true,
      })),

      addIntent: (intent) => set((state) => ({
        intents: [...state.intents, intent],
        hasUnsavedChanges: true,
      })),

      updateIntent: (id, updates) => set((state) => ({
        intents: state.intents.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
        hasUnsavedChanges: true,
      })),

      deleteIntent: (id) => set((state) => ({
        intents: state.intents.filter((i) => i.id !== id),
        hasUnsavedChanges: true,
      })),

      updateCapability: (id, enabled) => set((state) => ({
        capabilities: state.capabilities.map((c) =>
          c.id === id ? { ...c, enabled } : c
        ),
        hasUnsavedChanges: true,
      })),

      updateCapabilityConfig: (id, config) => set((state) => ({
        capabilities: state.capabilities.map((c) =>
          c.id === id ? { ...c, config } : c
        ),
        hasUnsavedChanges: true,
      })),

      updateUIPreferences: (updates) => set((state) => ({
        uiPreferences: { ...state.uiPreferences, ...updates },
      })),

      updateDebugOptions: (updates) => set((state) => ({
        debugOptions: { ...state.debugOptions, ...updates },
      })),

      resetConfig: () => set({
        currentIntent: null,
        capabilities: defaultCapabilities,
        uiPreferences: defaultUIPreferences,
        debugOptions: defaultDebugOptions,
        hasUnsavedChanges: false,
      }),

      markSaved: () => set({ hasUnsavedChanges: false }),
    }),
    {
      name: 'agent-master-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        intents: state.intents,
        capabilities: state.capabilities,
        uiPreferences: state.uiPreferences,
        debugOptions: state.debugOptions,
      }),
    }
  )
)

export default useAgentStore

