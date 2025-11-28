import { useState, useEffect, useRef } from 'react'

export interface UseStreamingTextOptions {
  /** 完整文本 */
  text: string
  /** 是否启用流式效果 */
  enabled?: boolean
  /** 每秒渲染的token数 (默认30) */
  tokensPerSecond?: number
  /** 完成时的回调 */
  onComplete?: () => void
}

/**
 * 流式文本渲染 Hook
 * 模拟打字机效果,按照指定速度逐字符显示文本
 */
export function useStreamingText(options: UseStreamingTextOptions) {
  const { text, enabled = true, tokensPerSecond = 40, onComplete } = options

  const [displayedText, setDisplayedText] = useState(text)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const indexRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  const hasStartedRef = useRef(false)

  // 保持 onComplete 引用最新
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    // 如果禁用流式效果,直接显示全部文本
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      setIsStreaming(false)
      hasStartedRef.current = false
      onCompleteRef.current?.()
      return
    }

    // 如果文本为空,重置状态
    if (!text) {
      setDisplayedText('')
      setIsStreaming(false)
      setIsComplete(false)
      indexRef.current = 0
      hasStartedRef.current = false
      return
    }

    // 清除之前的计时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // 重置状态并开始流式渲染
    setDisplayedText('')
    setIsStreaming(true)
    setIsComplete(false)
    indexRef.current = 0
    hasStartedRef.current = true

    // 计算每个字符的延迟时间(毫秒)
    // 30 tokens/秒 = 1000ms / 30 ≈ 33ms 每个token
    const delayPerChar = 1000 / tokensPerSecond

    // 创建新的流式渲染计时器
    timerRef.current = setInterval(() => {
      indexRef.current += 1

      if (indexRef.current >= text.length) {
        // 渲染完成
        setDisplayedText(text)
        setIsStreaming(false)
        setIsComplete(true)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        onCompleteRef.current?.()
      } else {
        // 继续渲染
        setDisplayedText(text.slice(0, indexRef.current))
      }
    }, delayPerChar)

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [text, enabled, tokensPerSecond])

  return {
    /** 当前显示的文本 */
    displayedText,
    /** 是否正在流式渲染 */
    isStreaming,
    /** 是否渲染完成 */
    isComplete,
  }
}

export default useStreamingText
