import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, Paperclip, Image, X } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string, imageFile?: File) => void
  disabled?: boolean
  placeholder?: string
  showImageUpload?: boolean
}

/**
 * 聊天输入框组件
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = '输入你的需求...',
  showImageUpload = false
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
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

    // 发送消息，同时传递图片文件（如果有）
    onSend(inputValue.trim(), uploadedFile || undefined)
    setInputValue('')

    // 发送后清除图片预览
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
      setUploadedImage(null)
      setUploadedFile(null)
    }
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
    if (file) {
      // 创建图片预览 URL
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
      setUploadedFile(file)

      // 不在这里立即调用 onImageUpload，而是等到用户点击发送时
    }
    e.target.value = ''
  }

  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
    }
    setUploadedImage(null)
    setUploadedFile(null)
  }

  // 清理函数
  useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage)
      }
    }
  }, [uploadedImage])

  return (
    <div className="p-4 border-t border-[var(--border-subtle)]">
      {/* 图片预览区域 */}
      {uploadedImage && (
        <div className="mb-2 relative inline-block">
          <div className="relative rounded-lg overflow-hidden border border-[var(--border-default)]">
            <img
              src={uploadedImage}
              alt="上传的图片"
              className="max-h-32 object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

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

