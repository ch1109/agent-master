/**
 * 配置表单标签组件
 * ChatGPT 极简风格的表单标签
 */
import { ReactNode, LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ConfigLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** 是否必填 */
  required?: boolean
  /** 子内容 */
  children: ReactNode
  /** 提示信息 */
  hint?: string
  /** AI 正在填充此字段 */
  aiFilling?: boolean
}

/**
 * 配置表单标签
 * - 小号字体
 * - 次要颜色
 * - 可选的必填标识
 */
export function ConfigLabel({
  required,
  children,
  hint,
  aiFilling,
  className,
  ...props
}: ConfigLabelProps) {
  return (
    <label
      className={cn(
        'block mb-2',
        className
      )}
      {...props}
    >
      <span className={cn(
        'text-sm font-normal',
        aiFilling 
          ? 'text-[var(--color-ai-thinking)]' 
          : 'text-[var(--text-tertiary)]'
      )}>
        {children}
        {required && (
          <span className="text-[var(--color-error)] ml-0.5">*</span>
        )}
      </span>
      {hint && (
        <span className="block text-xs text-[var(--text-placeholder)] mt-1">
          {hint}
        </span>
      )}
    </label>
  )
}

/**
 * 表单字段容器
 * 包含标签和输入框的容器组件
 */
export interface ConfigFieldProps {
  /** 字段标签 */
  label: string
  /** 是否必填 */
  required?: boolean
  /** 提示信息 */
  hint?: string
  /** AI 正在填充此字段 */
  aiFilling?: boolean
  /** 子内容（输入框） */
  children: ReactNode
  /** 额外的类名 */
  className?: string
  /** 标签的 htmlFor */
  htmlFor?: string
}

export function ConfigField({
  label,
  required,
  hint,
  aiFilling,
  children,
  className,
  htmlFor,
}: ConfigFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <ConfigLabel 
        required={required} 
        hint={hint} 
        aiFilling={aiFilling}
        htmlFor={htmlFor}
      >
        {label}
      </ConfigLabel>
      {children}
    </div>
  )
}

export default ConfigLabel

