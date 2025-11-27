/**
 * 代码编辑器组件
 * 使用 Shiki 进行语法高亮
 */
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { codeToHtml } from 'shiki'
import { Copy, Check } from 'lucide-react'

export interface CodeEditorProps {
  /** 代码内容 */
  code: string
  /** 编程语言 */
  language?: string
  /** 主题 */
  theme?: 'github-light' | 'github-dark' | 'nord' | 'one-dark-pro'
  /** 是否显示行号 */
  showLineNumbers?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 代码变化回调 */
  onChange?: (code: string) => void
  /** 额外的类名 */
  className?: string
  /** 最大高度 */
  maxHeight?: string | number
}

/**
 * 代码编辑器
 * - 语法高亮（Shiki）
 * - 行号显示
 * - 复制功能
 * - 只读/可编辑模式
 */
export function CodeEditor({
  code,
  language = 'typescript',
  theme = 'github-light',
  showLineNumbers = true,
  readOnly = true,
  onChange,
  className,
  maxHeight = '400px',
}: CodeEditorProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 使用 Shiki 进行代码高亮
  useEffect(() => {
    let cancelled = false

    async function highlight() {
      setIsLoading(true)
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: theme,
        })
        if (!cancelled) {
          setHighlightedHtml(html)
        }
      } catch (error) {
        console.error('代码高亮失败:', error)
        // 回退到普通文本显示
        if (!cancelled) {
          setHighlightedHtml(`<pre><code>${escapeHtml(code)}</code></pre>`)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    highlight()

    return () => {
      cancelled = true
    }
  }, [code, language, theme])

  // 复制代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  // 计算行号
  const lineCount = code.split('\n').length

  return (
    <div
      className={cn(
        'relative rounded-lg border border-[var(--border-default)]',
        'bg-[var(--bg-surface)] overflow-hidden',
        className
      )}
    >
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <span className="text-xs text-[var(--text-tertiary)] font-mono">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
          title={copied ? '已复制' : '复制代码'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-[var(--color-success)]" />
          ) : (
            <Copy className="w-4 h-4 text-[var(--text-tertiary)]" />
          )}
        </button>
      </div>

      {/* 代码区域 */}
      <div
        className="flex overflow-auto"
        style={{ maxHeight }}
      >
        {/* 行号 */}
        {showLineNumbers && (
          <div className="flex-shrink-0 py-3 px-3 text-right border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] select-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-xs font-mono text-[var(--text-placeholder)] leading-6"
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* 代码内容 */}
        <div className="flex-1 relative min-w-0">
          {isLoading ? (
            <div className="p-3 text-[var(--text-tertiary)]">加载中...</div>
          ) : readOnly ? (
            <div
              className="p-3 font-mono text-sm leading-6 [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              className="w-full h-full p-3 font-mono text-sm leading-6 bg-transparent border-none outline-none resize-none"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// HTML 转义
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default CodeEditor

