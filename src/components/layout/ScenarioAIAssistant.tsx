import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sparkles, MoreHorizontal, RotateCcw, Zap } from 'lucide-react'
import { MessageBubble, ThinkingIndicator, ChatInput } from '@/components/ai-chat'
import { Message, MessageContent } from '@/components/ai-chat/types'
import { generateId, delay } from '@/lib/utils'
import { intentConfigScript } from '@/data/intentMockData'
import { uiConfigScript } from '@/data/uiConfigMockData'
import { promptOptimizeScript } from '@/data/promptMockData'
import { useAIStream } from '@/hooks/useAIStream'
import { useAgentStore } from '@/stores/agentStore'
import { ChatMessage } from '@/services/anthropic'

// 场景到详情页的路由映射
const SCENARIO_DETAIL_ROUTES: Record<string, string> = {
  intent: '/config/intent/new',
  ui: '/config/ui/new',
  prompt: '/playground/prompt/optimize',
}

/**
 * 场景化 AI 助手
 * 根据当前页面自动切换对话场景
 * 支持脚本模式和真实 AI 模式
 */
export function ScenarioAIAssistant() {
  const location = useLocation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingText, setThinkingText] = useState('思考中')
  const [currentStep, setCurrentStep] = useState(0)
  const [inputDisabled, setInputDisabled] = useState(false)
  const [useRealAI, setUseRealAI] = useState(false) // 是否使用真实 AI
  const [hasNavigatedToDetail, setHasNavigatedToDetail] = useState(false) // 是否已导航到详情页
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取调试选项
  const { debugOptions } = useAgentStore()

  // 根据路径判断场景
  const getScenario = useCallback(() => {
    if (location.pathname.includes('/config/intent')) return 'intent' as const
    if (location.pathname.includes('/config/ui')) return 'ui' as const
    if (location.pathname.includes('/playground/prompt')) return 'prompt' as const
    return null
  }, [location.pathname])

  const scenario = getScenario()

  // 真实 AI 流式响应
  const { isStreaming, content: streamContent, streamMessage, reset: resetAIStream } = useAIStream({
    scenario,
    onComplete: (fullContent) => {
      // 更新最后一条消息为完成状态
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.isStreaming
            ? { ...msg, content: { type: 'text', text: fullContent }, isStreaming: false }
            : msg
        )
      )
      setInputDisabled(false)
    },
    onError: (err) => {
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.isStreaming
            ? { ...msg, content: { type: 'text', text: `抱歉，发生了错误：${err.message}` }, isStreaming: false }
            : msg
        )
      )
      setInputDisabled(false)
    },
  })

  // 更新流式内容
  useEffect(() => {
    if (isStreaming && streamContent) {
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.isStreaming
            ? { ...msg, content: { type: 'text', text: streamContent } }
            : msg
        )
      )
    }
  }, [streamContent, isStreaming])

  // 构建消息历史
  const buildHistory = useCallback((): ChatMessage[] => {
    return messages
      .filter(msg => !msg.isStreaming && msg.content.type === 'text' && msg.content.text)
      .map(msg => ({
        role: msg.role,
        content: msg.content.text || '',
      }))
  }, [messages])

  // 初始化消息
  useEffect(() => {
    const initialMessages: Record<string, MessageContent> = {
      intent: {
        type: 'text',
        text: '👋 你好！我是意图配置助手。告诉我你想创建什么样的意图，我来帮你自动生成配置。\n\n例如：「帮我创建一个查询信用卡账单的意图」',
      },
      ui: {
        type: 'text',
        text: '👋 你好！我是 UI 配置助手。上传页面截图，我来帮你识别页面元素并生成配置。',
      },
      prompt: {
        type: 'text',
        text: '👋 你好！我是提示词优化助手。选择要优化的提示词，我来帮你诊断问题并生成优化方案。',
      },
    }

    if (scenario && initialMessages[scenario]) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: initialMessages[scenario],
        timestamp: new Date(),
      }])
      setCurrentStep(0)
    }
  }, [scenario])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking, isStreaming])

  // 处理发送消息 - 真实 AI 模式
  const handleSendRealAI = useCallback(async (text: string) => {
    // 添加用户消息
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'user',
      content: { type: 'text', text },
      timestamp: new Date(),
    }])

    setInputDisabled(true)

    // 创建 AI 消息占位
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'assistant',
      content: { type: 'text', text: '' },
      timestamp: new Date(),
      isStreaming: true,
    }])

    // 调用真实 AI
    try {
      const history = buildHistory()
      await streamMessage(text, history)
    } catch (err) {
      console.error('AI 请求失败:', err)
      setInputDisabled(false)
    }
  }, [buildHistory, streamMessage])

  // 播放单个脚本步骤并检查是否需要自动继续
  const playScriptStep = useCallback(async (stepIndex: number): Promise<boolean> => {
    type ScriptItem = { response: MessageContent; delay?: number; thinkingText?: string; navigateToDetail?: boolean }
    const scripts: Record<string, ScriptItem[]> = {
      intent: intentConfigScript as ScriptItem[],
      ui: uiConfigScript as ScriptItem[],
      prompt: promptOptimizeScript as ScriptItem[],
    }

    const currentScript = scenario ? scripts[scenario] : null
    if (!currentScript || stepIndex >= currentScript.length) return false

    const step = currentScript[stepIndex]

    setIsThinking(true)
    setThinkingText(step.thinkingText || '思考中')
    setInputDisabled(true)

    await delay(step.delay || 2000)

    setIsThinking(false)

    // 添加 AI 响应消息
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'assistant',
      content: step.response,
      timestamp: new Date(),
    }])

    // 更新步骤
    const newStep = stepIndex + 1
    setCurrentStep(newStep)

    // 检查是否需要导航到详情页（在展示方案概览时）
    // 当步骤包含 "开始生成配置" 按钮时，先导航到详情页
    const hasStartAction = step.response.actions?.some(a => a.id === 'start')
    if (hasStartAction && scenario && !hasNavigatedToDetail) {
      const targetRoute = SCENARIO_DETAIL_ROUTES[scenario]
      if (targetRoute && !location.pathname.includes('/new') && !location.pathname.includes('/optimize')) {
        navigate(targetRoute)
        setHasNavigatedToDetail(true)
      }
    }

    // 检查当前步骤是否有交互元素（选项或按钮）
    const hasInteraction = step.response.options?.length || step.response.actions?.length

    // 如果没有交互元素，自动继续下一步
    if (!hasInteraction && newStep < currentScript.length) {
      await delay(800) // 短暂停顿让用户看到消息
      return playScriptStep(newStep) // 递归播放下一步
    }

    setInputDisabled(false)
    return true
  }, [scenario, hasNavigatedToDetail, location.pathname, navigate])

  // 处理发送消息 - 脚本模式
  const handleSendScript = useCallback(async (text: string) => {
    // 添加用户消息
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'user',
      content: { type: 'text', text },
      timestamp: new Date(),
    }])

    // 根据场景选择脚本
    type ScriptItem = { response: MessageContent; delay?: number; thinkingText?: string }
    const scripts: Record<string, ScriptItem[]> = {
      intent: intentConfigScript as ScriptItem[],
      ui: uiConfigScript as ScriptItem[],
      prompt: promptOptimizeScript as ScriptItem[],
    }

    const currentScript = scenario ? scripts[scenario] : null

    // 使用脚本响应
    if (currentScript && currentStep < currentScript.length) {
      await playScriptStep(currentStep)
    } else {
      // 默认响应（当脚本用完时切换到真实 AI）
      if (useRealAI && !debugOptions.useMockResponse) {
        await handleSendRealAI(text)
      } else {
        setIsThinking(true)
        await delay(1500)
        setIsThinking(false)
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: { type: 'text', text: '✅ 脚本演示完成！你可以点击重置按钮开始新的演示，或切换到真实 AI 模式进行对话。' },
          timestamp: new Date(),
        }])
      }
    }
  }, [scenario, currentStep, useRealAI, debugOptions.useMockResponse, handleSendRealAI, playScriptStep])

  // 主发送处理函数
  const handleSend = useCallback(async (text: string) => {
    if (useRealAI && !debugOptions.useMockResponse) {
      await handleSendRealAI(text)
    } else {
      await handleSendScript(text)
    }
  }, [useRealAI, debugOptions.useMockResponse, handleSendRealAI, handleSendScript])

  // 处理选项选择
  const handleOptionSelect = (optionId: string) => {
    // 更新选中状态
    setMessages(prev => prev.map(msg => {
      if (msg.content.options) {
        return {
          ...msg,
          content: {
            ...msg.content,
            options: msg.content.options.map(opt => ({
              ...opt,
              selected: opt.id === optionId ? !opt.selected : opt.selected,
            })),
          },
        }
      }
      return msg
    }))
  }

  // 处理操作按钮
  const handleActionClick = async (actionId: string) => {
    // 添加用户确认消息
    const actionLabels: Record<string, string> = {
      'start': '✅ 开始生成配置',
      'confirm': '✅ 确认配置',
      'enableAll': '✅ 全部开启',
      'test': '🧪 开始测试',
      'edit': '✏️ 编辑配置',
      'new': '➕ 创建新配置',
      'apply': '✅ 应用优化',
      'publish': '🚀 发布新版本',
      'diff': '📋 查看 Diff',
      'detail': '📖 查看详情',
      'retry': '🔄 重新识别',
      'reset': '🔄 重新选择',
      'selectAll': '✅ 全选',
      'aiTest': '🧪 开始AI自测',
      'configUI': '🎨 去配置UI',
      'save': '💾 保存配置',
    }

    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'user',
      content: { type: 'text', text: actionLabels[actionId] || '确认' },
      timestamp: new Date(),
    }])

    // 如果是"开始生成配置"按钮，先触发中间区域填充
    if (actionId === 'start') {
      // 延迟一小段时间后触发填充，让用户看到确认消息
      await delay(300)

      // 根据场景触发对应的填充事件
      if (scenario === 'intent') {
        window.dispatchEvent(new CustomEvent('ai-fill-intent'))
      } else if (scenario === 'ui') {
        window.dispatchEvent(new CustomEvent('ai-fill-ui'))
      } else if (scenario === 'prompt') {
        window.dispatchEvent(new CustomEvent('ai-fill-prompt'))
      }
    }

    // 继续播放下一步脚本
    await playScriptStep(currentStep)
  }

  // 重置对话
  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setMessages([])
    setHasNavigatedToDetail(false) // 重置导航状态
    resetAIStream()
    // 触发重新初始化
    setTimeout(() => {
      const event = new Event('reset')
      window.dispatchEvent(event)
    }, 100)
  }, [resetAIStream])

  // 切换 AI 模式
  const toggleAIMode = useCallback(() => {
    setUseRealAI(prev => !prev)
  }, [])

  // 处理来自业务区域的自动发送指令
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ text?: string }>
      const text = customEvent.detail?.text
      if (!text) return
      handleSend(text)
    }

    window.addEventListener('ai-assistant-send', handler as EventListener)
    return () => {
      window.removeEventListener('ai-assistant-send', handler as EventListener)
    }
  }, [handleSend])

  return (
    <div className="h-full flex flex-col bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)]">
      {/* 头部 */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-ai-thinking)] to-[var(--color-primary)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[var(--text-primary)]">AI 助手</h2>
            <div className="flex items-center gap-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isStreaming ? "bg-[var(--color-ai-thinking)] animate-pulse" : "bg-[var(--color-success)]"
              )} />
              <span className="text-xs text-[var(--text-tertiary)]">
                {isStreaming ? '思考中...' : (
                  scenario === 'intent' ? '意图配置' :
                  scenario === 'ui' ? 'UI 配置' :
                  scenario === 'prompt' ? '提示词优化' : '在线'
                )}
                {useRealAI && !debugOptions.useMockResponse && ' · AI'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* AI 模式切换按钮 */}
          <button
            onClick={toggleAIMode}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              useRealAI
                ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                : "hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]"
            )}
            title={useRealAI ? "真实 AI 模式（点击切换到演示模式）" : "演示模式（点击切换到真实 AI）"}
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            title="重置对话"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
            <MoreHorizontal className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onOptionSelect={handleOptionSelect}
            onActionClick={handleActionClick}
          />
        ))}
        
        {isThinking && <ThinkingIndicator text={thinkingText} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <ChatInput 
        onSend={handleSend} 
        disabled={isThinking || inputDisabled}
        placeholder={
          scenario === 'intent' ? '描述你想创建的意图...' :
          scenario === 'ui' ? '描述页面或上传截图...' :
          scenario === 'prompt' ? '描述要优化的问题...' :
          '输入你的需求...'
        }
        showImageUpload={scenario === 'ui'}
      />
    </div>
  )
}

export default ScenarioAIAssistant
