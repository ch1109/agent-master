/**
 * 字段高亮 Hook
 * 用于 AI 填充配置时的字段高亮效果
 */
import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseHighlightOptions {
  /** 默认高亮持续时间（毫秒） */
  defaultDuration?: number
  /** 高亮变化回调 */
  onHighlightChange?: (fields: string[]) => void
}

export interface UseHighlightReturn {
  /** 当前高亮的字段列表 */
  highlightedFields: string[]
  /** 添加高亮 */
  highlight: (fieldName: string, duration?: number) => void
  /** 高亮多个字段 */
  highlightMultiple: (fieldNames: string[], duration?: number) => void
  /** 清除高亮 */
  clearHighlight: (fieldName?: string) => void
  /** 清除所有高亮 */
  clearAllHighlights: () => void
  /** 检查字段是否高亮 */
  isHighlighted: (fieldName: string) => boolean
}

/**
 * 字段高亮管理 Hook
 * 
 * @example
 * ```tsx
 * const { highlightedFields, highlight, clearHighlight, isHighlighted } = useHighlight()
 * 
 * // 高亮某个字段 1 秒
 * highlight('intentName', 1000)
 * 
 * // 检查字段是否高亮
 * const isNameHighlighted = isHighlighted('intentName')
 * 
 * // 清除特定字段高亮
 * clearHighlight('intentName')
 * ```
 */
export function useHighlight(options: UseHighlightOptions = {}): UseHighlightReturn {
  const { defaultDuration = 1000, onHighlightChange } = options
  
  const [highlightedFields, setHighlightedFields] = useState<string[]>([])
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // 清理定时器
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  // 通知变化
  useEffect(() => {
    onHighlightChange?.(highlightedFields)
  }, [highlightedFields, onHighlightChange])

  // 添加高亮
  const highlight = useCallback((fieldName: string, duration?: number) => {
    const actualDuration = duration ?? defaultDuration

    // 添加到高亮列表
    setHighlightedFields((prev) => {
      if (prev.includes(fieldName)) return prev
      return [...prev, fieldName]
    })

    // 清除之前的定时器
    const existingTimer = timersRef.current.get(fieldName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置自动移除定时器
    if (actualDuration > 0) {
      const timer = setTimeout(() => {
        setHighlightedFields((prev) => prev.filter((f) => f !== fieldName))
        timersRef.current.delete(fieldName)
      }, actualDuration)
      timersRef.current.set(fieldName, timer)
    }
  }, [defaultDuration])

  // 高亮多个字段
  const highlightMultiple = useCallback((fieldNames: string[], duration?: number) => {
    fieldNames.forEach((fieldName) => highlight(fieldName, duration))
  }, [highlight])

  // 清除高亮
  const clearHighlight = useCallback((fieldName?: string) => {
    if (fieldName) {
      // 清除特定字段
      setHighlightedFields((prev) => prev.filter((f) => f !== fieldName))
      const timer = timersRef.current.get(fieldName)
      if (timer) {
        clearTimeout(timer)
        timersRef.current.delete(fieldName)
      }
    } else {
      // 清除所有
      setHighlightedFields([])
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  // 清除所有高亮
  const clearAllHighlights = useCallback(() => {
    clearHighlight()
  }, [clearHighlight])

  // 检查字段是否高亮
  const isHighlighted = useCallback((fieldName: string) => {
    return highlightedFields.includes(fieldName)
  }, [highlightedFields])

  return {
    highlightedFields,
    highlight,
    highlightMultiple,
    clearHighlight,
    clearAllHighlights,
    isHighlighted,
  }
}

export default useHighlight

