/**
 * AI 流式响应 Hook
 * 处理与 Anthropic API 的流式交互
 */
import { useState, useCallback, useRef } from 'react'
import { streamMessage, ChatMessage, buildSystemPrompt } from '@/services/anthropic'

export interface UseAIStreamOptions {
  /** 场景类型 */
  scenario?: 'intent' | 'ui' | 'prompt' | null
  /** 额外的系统上下文 */
  additionalContext?: string
  /** 流式开始时的回调 */
  onStart?: () => void
  /** 每个 token 到达时的回调 */
  onToken?: (token: string) => void
  /** 流式完成时的回调 */
  onComplete?: (content: string) => void
  /** 发生错误时的回调 */
  onError?: (error: Error) => void
}

export interface UseAIStreamReturn {
  /** 当前是否正在流式传输 */
  isStreaming: boolean
  /** 累积的内容 */
  content: string
  /** 错误信息 */
  error: Error | null
  /** 发送消息并获取流式响应 */
  streamMessage: (userMessage: string, history?: ChatMessage[]) => Promise<void>
  /** 使用完整的消息历史发送 */
  streamWithHistory: (messages: ChatMessage[]) => Promise<void>
  /** 取消当前流 */
  cancel: () => void
  /** 重置状态 */
  reset: () => void
}

/**
 * AI 流式响应 Hook
 */
export function useAIStream(options: UseAIStreamOptions = {}): UseAIStreamReturn {
  const { scenario, additionalContext, onStart, onToken, onComplete, onError } = options

  const [isStreaming, setIsStreaming] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState<Error | null>(null)
  
  // 用于取消流的标志
  const cancelledRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * 使用消息历史发送流式请求
   */
  const streamWithHistory = useCallback(async (messages: ChatMessage[]) => {
    // 重置状态
    cancelledRef.current = false
    setIsStreaming(true)
    setContent('')
    setError(null)

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController()

    try {
      onStart?.()

      await streamMessage(
        messages,
        {
          onStart: () => {
            // 已在外部处理
          },
          onToken: (token: string) => {
            if (cancelledRef.current) return
            setContent(prev => prev + token)
            onToken?.(token)
          },
          onComplete: (fullContent: string) => {
            if (cancelledRef.current) return
            setIsStreaming(false)
            onComplete?.(fullContent)
          },
          onError: (err: Error) => {
            if (cancelledRef.current) return
            setError(err)
            setIsStreaming(false)
            onError?.(err)
          },
        },
        {
          // 可以添加额外的配置
        }
      )
    } catch (err) {
      if (cancelledRef.current) return
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsStreaming(false)
      onError?.(error)
    }
  }, [onStart, onToken, onComplete, onError])

  /**
   * 发送单条消息并获取流式响应
   */
  const streamMessageFn = useCallback(async (
    userMessage: string,
    history: ChatMessage[] = []
  ) => {
    // 构建系统提示词
    const systemPrompt = buildSystemPrompt({ scenario, additionalContext })
    
    // 构建消息列表
    const messages: ChatMessage[] = [
      // 如果有历史消息，添加到列表中
      ...history,
      // 添加当前用户消息
      { role: 'user', content: userMessage },
    ]

    // 如果有系统提示词，将其作为第一条 assistant 消息的上下文
    // 注意：Anthropic API 不支持 system 角色，需要在消息中包含
    if (systemPrompt && messages.length === 1) {
      // 对于第一条消息，添加系统上下文
      messages[0] = {
        role: 'user',
        content: `[系统上下文]\n${systemPrompt}\n\n[用户消息]\n${userMessage}`,
      }
    }

    await streamWithHistory(messages)
  }, [scenario, additionalContext, streamWithHistory])

  /**
   * 取消当前流
   */
  const cancel = useCallback(() => {
    cancelledRef.current = true
    abortControllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    cancelledRef.current = false
    setIsStreaming(false)
    setContent('')
    setError(null)
  }, [])

  return {
    isStreaming,
    content,
    error,
    streamMessage: streamMessageFn,
    streamWithHistory,
    cancel,
    reset,
  }
}

export default useAIStream

