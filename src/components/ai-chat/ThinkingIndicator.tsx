import { Bot } from 'lucide-react'

interface ThinkingIndicatorProps {
  text?: string
}

/**
 * AI 思考中指示器
 * 三个点脉冲动画
 */
export function ThinkingIndicator({ text = '思考中' }: ThinkingIndicatorProps) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-ai-thinking)] to-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span 
              className="w-2 h-2 bg-[var(--color-ai-thinking)] rounded-full animate-thinking" 
              style={{ animationDelay: '0ms' }} 
            />
            <span 
              className="w-2 h-2 bg-[var(--color-ai-thinking)] rounded-full animate-thinking" 
              style={{ animationDelay: '200ms' }} 
            />
            <span 
              className="w-2 h-2 bg-[var(--color-ai-thinking)] rounded-full animate-thinking" 
              style={{ animationDelay: '400ms' }} 
            />
          </div>
          <span className="text-sm text-[var(--text-secondary)]">{text}</span>
        </div>
      </div>
    </div>
  )
}

export default ThinkingIndicator

