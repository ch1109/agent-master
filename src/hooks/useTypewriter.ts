import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number // 每字符的延迟时间（毫秒）
  enabled?: boolean
  onComplete?: () => void
}

interface UseTypewriterReturn {
  displayText: string
  isTyping: boolean
  isComplete: boolean
  start: () => void
  reset: () => void
  skip: () => void
}

/**
 * 打字机效果 Hook
 * 逐字符显示文本，模拟AI输出效果
 */
export function useTypewriter({
  text,
  speed = 30,
  enabled = true,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (!enabled) {
      setDisplayText(text)
      setIsComplete(true)
      return
    }

    setIsTyping(true)
    setIsComplete(false)
    indexRef.current = 0
    setDisplayText('')

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1))
        indexRef.current++
        timeoutRef.current = setTimeout(type, speed)
      } else {
        setIsTyping(false)
        setIsComplete(true)
        onComplete?.()
      }
    }

    type()
  }, [text, speed, enabled, onComplete])

  const reset = useCallback(() => {
    clearTimer()
    setDisplayText('')
    setIsTyping(false)
    setIsComplete(false)
    indexRef.current = 0
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    setDisplayText(text)
    setIsTyping(false)
    setIsComplete(true)
    onComplete?.()
  }, [clearTimer, text, onComplete])

  // 自动开始
  useEffect(() => {
    start()
    return clearTimer
  }, [text, start, clearTimer])

  // 清理
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return {
    displayText,
    isTyping,
    isComplete,
    start,
    reset,
    skip,
  }
}

export default useTypewriter

