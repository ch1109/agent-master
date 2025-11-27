import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'
import {
  Sparkles,
  Send,
  Paperclip,
  MoreHorizontal,
  Bot,
  User,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { useAIStream } from '@/hooks/useAIStream'
import { useAgentStore } from '@/stores/agentStore'
import { ChatMessage } from '@/services/anthropic'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

/**
 * AI 聊天助手面板
 * 集成真实的 Anthropic API 流式响应
 */
export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 Agent Master 的 AI 助手。我可以帮你配置意图、生成提示词、优化 AI 行为。请告诉我你想做什么？',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 获取调试选项
  const { debugOptions } = useAgentStore()

  // 使用 AI 流式响应 Hook
  const { isStreaming, content, error, streamMessage, reset: resetStream } = useAIStream({
    onStart: () => {
      // 创建一个新的 AI 消息占位
      const newMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }
      setMessages(prev => [...prev, newMessage])
    },
    onToken: () => {
      // Token 通过 content 状态自动更新
    },
    onComplete: (fullContent) => {
      // 更新最后一条消息，移除 streaming 标记
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        )
      )
    },
    onError: (err) => {
      // 更新最后一条消息显示错误
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, content: `抱歉，发生了错误：${err.message}`, isStreaming: false }
            : msg
        )
      )
    },
  })

  // 更新流式内容到最后一条消息
  useEffect(() => {
    if (isStreaming && content) {
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.isStreaming
            ? { ...msg, content }
            : msg
        )
      )
    }
  }, [content, isStreaming])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, content])

  // 构建消息历史
  const buildHistory = useCallback((): ChatMessage[] => {
    return messages
      .filter(msg => !msg.isStreaming)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return

    const userMessage = inputValue.trim()

    // 添加用户消息
    const newMessage: Message = {
      id: generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')

    // 如果使用模拟响应（调试模式）
    if (debugOptions.useMockResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: '【模拟响应】收到你的请求，让我来分析一下...',
          timestamp: new Date(),
        }])
      }, debugOptions.mockDelay)
      return
    }

    // 使用真实 AI 响应
    try {
      const history = buildHistory()
      await streamMessage(userMessage, history)
    } catch (err) {
      console.error('发送消息失败:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 重置对话
  const handleReset = () => {
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: '你好！我是 Agent Master 的 AI 助手。我可以帮你配置意图、生成提示词、优化 AI 行为。请告诉我你想做什么？',
      timestamp: new Date(),
    }])
    resetStream()
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)]">
      {/* 头部 */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-ai-thinking)] to-[var(--color-primary)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[var(--text-primary)]">AI 助手</h2>
            <div className="flex items-center gap-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isStreaming ? "bg-[var(--color-ai-thinking)] animate-pulse" : "bg-[var(--color-success)]"
              )} />
              <span className="text-xs text-[var(--text-tertiary)]">
                {isStreaming ? '正在思考...' : (debugOptions.useMockResponse ? '模拟模式' : '在线')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
            title="重置对话"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
            <MoreHorizontal className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>连接失败：{error.message}</span>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "flex-row-reverse" : ""
            )}
          >
            {/* 头像 */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              message.role === 'assistant'
                ? "bg-gradient-to-br from-[var(--color-ai-thinking)] to-[var(--color-primary)]"
                : "bg-[var(--bg-secondary)]"
            )}>
              {message.role === 'assistant'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-[var(--text-secondary)]" />
              }
            </div>

            {/* 消息内容 */}
            <div className={cn(
              "max-w-[85%] px-4 py-3 text-sm whitespace-pre-wrap",
              message.role === 'assistant'
                ? "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl text-[var(--text-primary)]"
                : "bg-[var(--color-primary)] rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl text-white"
            )}>
              {message.content || (message.isStreaming && (
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-[var(--color-ai-thinking)] rounded-full animate-thinking" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--color-ai-thinking)] rounded-full animate-thinking" style={{ animationDelay: '200ms' }} />
                  <span className="w-2 h-2 bg-[var(--color-ai-thinking)] rounded-full animate-thinking" style={{ animationDelay: '400ms' }} />
                </span>
              ))}
              {/* 流式输入时显示光标 */}
              {message.isStreaming && message.content && (
                <span className="inline-block w-0.5 h-4 bg-[var(--color-primary)] animate-typing ml-0.5" />
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className={cn(
          "flex items-end gap-2 p-2 bg-[var(--bg-surface)] border rounded-xl transition-colors",
          isStreaming
            ? "border-[var(--color-ai-thinking)] opacity-70"
            : "border-[var(--border-default)] focus-within:border-[var(--color-primary)]"
        )}>
          <button
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            disabled={isStreaming}
          >
            <Paperclip className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "AI 正在回复..." : "输入你的需求..."}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] py-2 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className={cn(
              "p-2 rounded-lg transition-colors",
              inputValue.trim() && !isStreaming
                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                : "bg-[var(--bg-hover)] text-[var(--text-disabled)]"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-center text-[var(--text-tertiary)]">
          按 Enter 发送，Shift + Enter 换行
          {debugOptions.useMockResponse && (
            <span className="ml-2 text-yellow-600">· 模拟模式已启用</span>
          )}
        </p>
      </div>
    </div>
  )
}

export default AIAssistant

