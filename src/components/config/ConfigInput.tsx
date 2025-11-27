/**
 * 配置表单输入组件
 * ChatGPT 极简风格的输入框
 */
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ConfigInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** AI 正在填充状态 */
  aiFilling?: boolean
  /** 错误状态 */
  error?: boolean
  /** 错误信息 */
  errorMessage?: string
}

/**
 * 配置输入框
 * - 极简风格
 * - 极淡边框
 * - 支持 AI 填充状态高亮
 */
export const ConfigInput = forwardRef<HTMLInputElement, ConfigInputProps>(
  ({ className, aiFilling, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            // 基础样式
            'w-full px-4 py-3',
            'bg-[var(--bg-surface)]',
            'border rounded-lg',
            'text-base text-[var(--text-primary)]',
            'placeholder:text-[var(--text-placeholder)]',
            'transition-all duration-150',
            'outline-none',
            // 边框样式
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--border-default)]',
            // focus 样式 - 保持克制，不用主色
            !error && 'focus:border-[var(--border-strong)]',
            // AI 填充状态
            aiFilling && [
              'border-[var(--color-ai-thinking)]',
              'bg-[var(--color-ai-thinking)]/5',
              'animate-ai-filling',
            ],
            // 禁用状态
            props.disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)]',
            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

ConfigInput.displayName = 'ConfigInput'

/**
 * 配置文本域
 */
export interface ConfigTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** AI 正在填充状态 */
  aiFilling?: boolean
  /** 错误状态 */
  error?: boolean
  /** 错误信息 */
  errorMessage?: string
}

export const ConfigTextarea = forwardRef<HTMLTextAreaElement, ConfigTextareaProps>(
  ({ className, aiFilling, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            // 基础样式
            'w-full px-4 py-3',
            'bg-[var(--bg-surface)]',
            'border rounded-lg',
            'text-base text-[var(--text-primary)]',
            'placeholder:text-[var(--text-placeholder)]',
            'transition-all duration-150',
            'outline-none resize-none',
            'min-h-[100px]',
            // 边框样式
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--border-default)]',
            // focus 样式
            !error && 'focus:border-[var(--border-strong)]',
            // AI 填充状态
            aiFilling && [
              'border-[var(--color-ai-thinking)]',
              'bg-[var(--color-ai-thinking)]/5',
              'animate-ai-filling',
            ],
            // 禁用状态
            props.disabled && 'opacity-50 cursor-not-allowed bg-[var(--bg-secondary)]',
            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

ConfigTextarea.displayName = 'ConfigTextarea'

export default ConfigInput

