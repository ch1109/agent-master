import { useState, useCallback, useRef } from 'react'
import { Message, MessageContent, ChatContext } from '@/components/ai-chat/types'
import { generateId, delay } from '@/lib/utils'

interface UseAIChatOptions {
  scenario?: 'intent' | 'ui' | 'prompt' | 'agent-create'
  onMessage?: (message: Message) => void
  onStepChange?: (step: number) => void
}

interface ScriptStep {
  trigger?: string | RegExp | ((input: string) => boolean)
  response: MessageContent | ((input: string, context: ChatContext) => MessageContent)
  delay?: number
  thinkingText?: string
  onExecute?: (context: ChatContext) => void | Promise<void>
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { scenario, onMessage, onStepChange } = options
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingText, setThinkingText] = useState('思考中')
  const [context, setContext] = useState<ChatContext>({
    scenario: scenario || null,
    step: 0,
    data: {},
  })
  
  const scriptRef = useRef<ScriptStep[]>([])

  // 添加消息
  const addMessage = useCallback((role: 'user' | 'assistant', content: MessageContent) => {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, message])
    onMessage?.(message)
    return message
  }, [onMessage])

  // 设置对话脚本
  const setScript = useCallback((script: ScriptStep[]) => {
    scriptRef.current = script
  }, [])

  // 发送用户消息并获取 AI 响应
  const sendMessage = useCallback(async (text: string) => {
    // 添加用户消息
    addMessage('user', { type: 'text', text })
    
    // 查找匹配的脚本步骤
    const script = scriptRef.current
    const currentStep = context.step
    const step = script[currentStep]
    
    if (!step) {
      // 没有脚本，使用默认响应
      setIsThinking(true)
      setThinkingText('思考中')
      await delay(1500)
      setIsThinking(false)
      addMessage('assistant', { 
        type: 'text', 
        text: '收到你的请求，让我来分析一下...' 
      })
      return
    }

    // 检查触发条件
    let shouldTrigger = true
    if (step.trigger) {
      if (typeof step.trigger === 'string') {
        shouldTrigger = text.includes(step.trigger)
      } else if (step.trigger instanceof RegExp) {
        shouldTrigger = step.trigger.test(text)
      } else if (typeof step.trigger === 'function') {
        shouldTrigger = step.trigger(text)
      }
    }

    if (!shouldTrigger) {
      // 触发条件不满足，使用默认响应
      setIsThinking(true)
      await delay(1000)
      setIsThinking(false)
      addMessage('assistant', { 
        type: 'text', 
        text: '请告诉我更多细节，或者换个方式描述你的需求。' 
      })
      return
    }

    // 显示思考状态
    setIsThinking(true)
    setThinkingText(step.thinkingText || '思考中')
    await delay(step.delay || 2000)
    
    // 执行回调
    if (step.onExecute) {
      await step.onExecute(context)
    }

    // 生成响应
    const response = typeof step.response === 'function' 
      ? step.response(text, context)
      : step.response

    setIsThinking(false)
    addMessage('assistant', response)

    // 更新步骤
    const newStep = currentStep + 1
    setContext(prev => ({ ...prev, step: newStep }))
    onStepChange?.(newStep)
  }, [addMessage, context, onStepChange])

  // 处理选项选择
  const handleOptionSelect = useCallback((optionId: string) => {
    setContext(prev => ({
      ...prev,
      data: { ...prev.data, selectedOption: optionId }
    }))
  }, [])

  // 处理操作按钮点击
  const handleActionClick = useCallback(async (actionId: string) => {
    if (actionId === 'confirm' || actionId === 'start') {
      // 触发下一步
      await sendMessage('确认')
    }
  }, [sendMessage])

  // 更新上下文数据
  const updateContext = useCallback((data: Record<string, unknown>) => {
    setContext(prev => ({
      ...prev,
      data: { ...prev.data, ...data }
    }))
  }, [])

  // 重置聊天
  const reset = useCallback(() => {
    setMessages([])
    setContext({
      scenario: scenario || null,
      step: 0,
      data: {},
    })
    setIsThinking(false)
  }, [scenario])

  // 添加初始消息
  const setInitialMessage = useCallback((content: MessageContent) => {
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }])
  }, [])

  return {
    messages,
    isThinking,
    thinkingText,
    context,
    sendMessage,
    addMessage,
    setScript,
    setInitialMessage,
    handleOptionSelect,
    handleActionClick,
    updateContext,
    reset,
  }
}

export default useAIChat
