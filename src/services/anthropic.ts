/**
 * Anthropic API 服务层
 * 封装与 Claude API 的交互
 */
import Anthropic from '@anthropic-ai/sdk'

// API 配置
export interface AnthropicConfig {
  apiKey?: string
  model?: string
  maxTokens?: number
  dangerouslyAllowBrowser?: boolean
}

// 消息类型
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// 流式响应回调
export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullContent: string) => void
  onError?: (error: Error) => void
}

// 默认配置
const DEFAULT_CONFIG: Required<AnthropicConfig> = {
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  dangerouslyAllowBrowser: true,
}

// 单例客户端
let client: Anthropic | null = null

/**
 * 获取 Anthropic 客户端实例
 */
export function getClient(config?: AnthropicConfig): Anthropic {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  if (!finalConfig.apiKey) {
    throw new Error('Anthropic API Key 未配置。请在 .env 文件中设置 VITE_ANTHROPIC_API_KEY')
  }

  if (!client) {
    client = new Anthropic({
      apiKey: finalConfig.apiKey,
      dangerouslyAllowBrowser: finalConfig.dangerouslyAllowBrowser,
    })
  }

  return client
}

/**
 * 重置客户端（用于更换 API Key）
 */
export function resetClient(): void {
  client = null
}

/**
 * 发送非流式消息
 */
export async function sendMessage(
  messages: ChatMessage[],
  config?: AnthropicConfig
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const anthropic = getClient(config)

  try {
    const response = await anthropic.messages.create({
      model: finalConfig.model,
      max_tokens: finalConfig.maxTokens,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    // 提取文本内容
    const textContent = response.content.find(block => block.type === 'text')
    return textContent?.type === 'text' ? textContent.text : ''
  } catch (error) {
    console.error('Anthropic API 错误:', error)
    throw error
  }
}

/**
 * 发送流式消息
 */
export async function streamMessage(
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  config?: AnthropicConfig
): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const anthropic = getClient(config)

  callbacks.onStart?.()
  let fullContent = ''

  try {
    const stream = await anthropic.messages.stream({
      model: finalConfig.model,
      max_tokens: finalConfig.maxTokens,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const token = event.delta.text
        fullContent += token
        callbacks.onToken?.(token)
      }
    }

    callbacks.onComplete?.(fullContent)
  } catch (error) {
    console.error('Anthropic 流式 API 错误:', error)
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}

/**
 * 构建系统提示词
 */
export function buildSystemPrompt(context: {
  scenario?: 'intent' | 'ui' | 'prompt' | null
  additionalContext?: string
}): string {
  const basePrompt = `你是 Agent Master 的 AI 助手，一个专门帮助用户配置和管理 AI Agent 的智能助手。

你的职责包括：
- 帮助用户配置意图（Intent）
- 帮助用户配置 UI 页面信息
- 优化和改进提示词（Prompt）
- 提供专业的 AI 配置建议

请用中文回复，保持专业、友好的语气。回复要简洁明了，避免过长的解释。`

  const scenarioPrompts: Record<string, string> = {
    intent: `\n\n当前场景：意图配置
你正在帮助用户配置 AI Agent 的意图。请关注：
- 意图的名称和描述是否清晰
- 触发条件是否合理
- 响应类型是否匹配用户需求`,
    ui: `\n\n当前场景：UI 配置
你正在帮助用户配置页面信息，让 AI 理解页面能力。请关注：
- 页面的主要功能和元素
- 支持的操作和交互
- AI 在该页面应该如何辅助用户`,
    prompt: `\n\n当前场景：提示词优化
你正在帮助用户优化 AI 提示词。请关注：
- 提示词的清晰度和完整性
- 是否有歧义或遗漏
- 如何让 AI 更好地理解和执行任务`,
  }

  let finalPrompt = basePrompt
  if (context.scenario && scenarioPrompts[context.scenario]) {
    finalPrompt += scenarioPrompts[context.scenario]
  }
  if (context.additionalContext) {
    finalPrompt += `\n\n额外上下文：${context.additionalContext}`
  }

  return finalPrompt
}

// 导出类型
export type { Anthropic }

