/**
 * 防抖 Hook
 * 延迟执行值更新，用于搜索输入、表单验证等场景
 */
import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * 值防抖 Hook
 * 
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 300)
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // 执行搜索
 *     performSearch(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 函数防抖 Hook
 * 
 * @param callback 需要防抖的回调函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 * 
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   performSearch(term)
 * }, 300)
 * 
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 保持回调函数引用最新
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])

  return debouncedCallback
}

/**
 * 带立即执行选项的防抖 Hook
 * 
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次
 * @returns 防抖后的值
 */
export function useDebounceWithImmediate<T>(
  value: T,
  delay: number = 300,
  immediate: boolean = false
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (immediate && isFirstRun.current) {
      isFirstRun.current = false
      setDebouncedValue(value)
      return
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay, immediate])

  return debouncedValue
}

export default useDebounce

