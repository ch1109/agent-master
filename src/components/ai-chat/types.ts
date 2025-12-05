/**
 * AI 聊天相关类型定义
 */

// 消息类型
export type MessageType = 
  | 'text'           // 普通文本
  | 'options'        // 选项卡片
  | 'form'           // 表单确认
  | 'progress'       // 进度显示
  | 'code'           // 代码块
  | 'diff'           // 代码对比
  | 'summary'        // 方案总结
  | 'action'         // 操作按钮

// 选项配置
export interface OptionItem {
  id: string
  label: string
  description?: string
  icon?: string
  selected?: boolean
  recommended?: boolean
  features?: string[]
  platforms?: string[]
}

// 表单字段
export interface FormField {
  id: string
  label: string
  type: 'text' | 'select' | 'switch' | 'textarea'
  value: string | boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  required?: boolean
}

// 进度阶段
export interface ProgressStage {
  id: string
  label: string
  status: 'pending' | 'running' | 'completed' | 'error'
  description?: string
}

// 消息内容
export interface MessageContent {
  type: MessageType
  text?: string
  options?: OptionItem[]
  formFields?: FormField[]
  stages?: ProgressStage[]
  code?: string
  language?: string
  oldCode?: string
  newCode?: string
  actions?: ActionButton[]
  summary?: SummarySection[]
}

// 操作按钮
export interface ActionButton {
  id: string
  label: string
  variant: 'primary' | 'secondary' | 'ghost'
  icon?: string
}

// 方案总结区块
export interface SummarySection {
  title: string
  items: { label: string; value: string }[]
}

// 消息
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: MessageContent
  timestamp: Date
  isStreaming?: boolean
}

// 聊天上下文
export interface ChatContext {
  scenario: 'intent' | 'ui' | 'prompt' | 'agent-create' | null
  step: number
  data: Record<string, unknown>
}
