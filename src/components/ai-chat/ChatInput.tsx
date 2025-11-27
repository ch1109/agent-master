import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, Paperclip, Image } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  onImageUpload?: (file: File) => void
  disabled?: boolean
  placeholder?: string
  showImageUpload?: boolean
}

/**
 * 聊天输入框组件
 */
export function ChatInput({ 
  onSend, 
  onImageUpload, 
  disabled = false, 
  placeholder = '输入你的需求...',
  showImageUpload = false
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return
    onSend(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
    e.target.value = ''
  }

  return (
    <div className="p-4 border-t border-[var(--border-subtle)]">
      <div className={cn(
        "flex items-end gap-2 p-2 bg-[var(--bg-surface)] border rounded-xl transition-colors",
        disabled 
          ? "border-[var(--border-subtle)] opacity-60" 
          : "border-[var(--border-default)] focus-within:border-[var(--color-primary)]"
      )}>
        {/* 附件按钮 */}
        <button 
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4 text-[var(--text-tertiary)]" />
        </button>

        {/* 图片上传按钮 */}
        {showImageUpload && (
          <>
            <button 
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
              onClick={handleImageClick}
              disabled={disabled}
            >
              <Image className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}

        {/* 输入框 */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] py-2 disabled:cursor-not-allowed"
        />

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || disabled}
          className={cn(
            "p-2 rounded-lg transition-colors",
            inputValue.trim() && !disabled
              ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
              : "bg-[var(--bg-hover)] text-[var(--text-disabled)]"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-2 text-xs text-center text-[var(--text-tertiary)]">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  )
}

export default ChatInput

