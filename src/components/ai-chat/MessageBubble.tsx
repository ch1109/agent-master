import { cn } from '@/lib/utils'
import { Bot, User, Check, CheckCircle2, Circle, Loader2, AlertCircle, ChevronRight, Sparkles } from 'lucide-react'
import { Message, OptionItem, ProgressStage, ActionButton } from './types'
import { Button } from '@/components/ui/button'

interface MessageBubbleProps {
  message: Message
  onOptionSelect?: (optionId: string) => void
  onActionClick?: (actionId: string) => void
}

// 解析格式化文本，识别标题、分隔线等
function FormattedText({ text, isStreaming }: { text: string; isStreaming?: boolean }) {
  // 将文本按行分割
  const lines = text.split('\n')

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim()

        // 空行
        if (!trimmedLine) {
          return <div key={index} className="h-2" />
        }

        // 分隔线（━━━ 或 ---）
        if (/^[━─\-=]{3,}$/.test(trimmedLine)) {
          return <div key={index} className="h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent my-3" />
        }

        // emoji 标题（以 emoji 开头）
        const emojiMatch = trimmedLine.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[✅✓☑❌⚠️💡🎯🚀📋📊💬🔍🎉])\s*(.+)/u)
        if (emojiMatch) {
          const [, emoji, content] = emojiMatch
          // 判断是否是主标题（后面紧跟的是描述或选项）
          const isMainTitle = /^\d+\./.test(content) || content.includes('：') || content.includes(':')
          return (
            <div key={index} className={cn(
              "flex items-start gap-2",
              isMainTitle ? "font-medium text-[var(--text-primary)]" : ""
            )}>
              <span className="text-base flex-shrink-0">{emoji}</span>
              <span className={cn(
                isMainTitle ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
              )}>{content}</span>
            </div>
          )
        }

        // 列表项（以 • 或 - 开头）
        if (/^[•\-]\s+/.test(trimmedLine)) {
          return (
            <div key={index} className="flex items-start gap-2 pl-4">
              <span className="text-[var(--color-primary)] text-xs mt-1.5">●</span>
              <span className="text-[var(--text-secondary)]">{trimmedLine.replace(/^[•\-]\s+/, '')}</span>
            </div>
          )
        }

        // 普通文本
        return <div key={index} className="text-[var(--text-secondary)]">{line}</div>
      })}
      {isStreaming && <span className="inline-block w-1 h-4 ml-1 bg-[var(--color-primary)] animate-pulse" />}
    </div>
  )
}

export function MessageBubble({ message, onOptionSelect, onActionClick }: MessageBubbleProps) {
  const { role, content, isStreaming } = message
  const isAssistant = role === 'assistant'

  return (
    <div className={cn("flex gap-3", !isAssistant && "flex-row-reverse")}>
      {/* 头像 */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isAssistant
          ? "bg-gradient-to-br from-[var(--color-ai-thinking)] to-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20"
          : "bg-[var(--bg-secondary)]"
      )}>
        {isAssistant
          ? <Bot className="w-4 h-4 text-white" />
          : <User className="w-4 h-4 text-[var(--text-secondary)]" />
        }
      </div>

      {/* 消息内容 */}
      <div className={cn("max-w-[90%] space-y-3", !isAssistant && "items-end")}>
        {/* 文本内容 */}
        {content.text && (
          <div className={cn(
            "px-4 py-3 text-sm",
            isAssistant
              ? "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl text-[var(--text-primary)] shadow-sm"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl text-[var(--text-primary)] shadow-md"
          )}>
            <FormattedText text={content.text} isStreaming={isStreaming} />
          </div>
        )}

        {/* 选项卡片 */}
        {content.options && content.options.length > 0 && (
          <OptionsCard options={content.options} onSelect={onOptionSelect} />
        )}

        {/* 进度条 */}
        {content.stages && content.stages.length > 0 && (
          <ProgressCard stages={content.stages} />
        )}

        {/* 方案总结 */}
        {content.summary && content.summary.length > 0 && (
          <SummaryCard sections={content.summary} />
        )}

        {/* 操作按钮 */}
        {content.actions && content.actions.length > 0 && (
          <ActionsBar actions={content.actions} onClick={onActionClick} />
        )}
      </div>
    </div>
  )
}

// 从标签中提取 emoji
function extractEmoji(label: string): { emoji: string | null; text: string } {
  const emojiMatch = label.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[📌💬🌏📊🏦🔐🎭🚫🤝1️⃣2️⃣3️⃣4️⃣5️⃣🔥💫💾📄])\s*/u)
  if (emojiMatch) {
    return { emoji: emojiMatch[1], text: label.replace(emojiMatch[0], '') }
  }
  return { emoji: null, text: label }
}

// 选项卡片组件 - 增强版
function OptionsCard({ options, onSelect }: { options: OptionItem[]; onSelect?: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
      <div className="divide-y divide-[var(--border-subtle)]">
        {options.map((option, index) => {
          const { emoji, text } = extractEmoji(option.label)
          return (
            <button
              key={option.id}
              onClick={() => onSelect?.(option.id)}
              className={cn(
                "flex items-start gap-3 p-4 w-full text-left transition-all group",
                option.selected
                  ? "bg-[var(--color-primary-muted)]"
                  : "hover:bg-[var(--bg-hover)]"
              )}
            >
              {/* 选中状态指示器 */}
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                option.selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] scale-110"
                  : "border-[var(--border-strong)] group-hover:border-[var(--color-primary)]"
              )}>
                {option.selected && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {emoji && <span className="text-lg">{emoji}</span>}
                  <span className="text-sm font-medium text-[var(--text-primary)]">{text}</span>
                </div>
                {option.description && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed whitespace-pre-line">
                    {option.description}
                  </div>
                )}
              </div>

              <ChevronRight className={cn(
                "w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5 transition-transform",
                "group-hover:translate-x-0.5 group-hover:text-[var(--text-secondary)]"
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 进度卡片组件 - 增强版
function ProgressCard({ stages }: { stages: ProgressStage[] }) {
  // 计算完成百分比
  const completedCount = stages.filter(s => s.status === 'completed').length
  const runningCount = stages.filter(s => s.status === 'running').length
  const progress = Math.round(((completedCount + runningCount * 0.5) / stages.length) * 100)

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
      {/* 顶部进度条 */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--text-secondary)]">生成进度</span>
          <span className="text-xs font-bold text-[var(--color-primary)]">{progress}%</span>
        </div>
        <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-ai-thinking)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 阶段列表 */}
      <div className="px-4 pb-4 pt-2">
        <div className="relative">
          {/* 连接线 */}
          <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-[var(--border-subtle)]" />

          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-start gap-3 relative">
                {/* 状态图标 */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10 transition-all",
                  stage.status === 'completed' && "bg-[var(--color-success)] text-white shadow-sm shadow-[var(--color-success)]/30",
                  stage.status === 'running' && "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/40",
                  stage.status === 'pending' && "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border-default)]",
                  stage.status === 'error' && "bg-[var(--color-error)] text-white"
                )}>
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : stage.status === 'running' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : stage.status === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className={cn(
                    "text-sm transition-colors",
                    stage.status === 'running' && "text-[var(--color-primary)] font-semibold",
                    stage.status === 'completed' && "text-[var(--text-primary)] font-medium",
                    stage.status === 'pending' && "text-[var(--text-tertiary)]",
                    stage.status === 'error' && "text-[var(--color-error)]"
                  )}>
                    {stage.status === 'completed' ? '✓ ' : ''}{stage.label}
                  </div>
                  {stage.description && stage.status === 'running' && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {stage.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 操作按钮栏 - 增强版
function ActionsBar({ actions, onClick }: { actions: ActionButton[]; onClick?: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant === 'primary' ? 'default' : action.variant === 'secondary' ? 'outline' : 'ghost'}
          size="sm"
          onClick={() => onClick?.(action.id)}
          className={cn(
            "transition-all",
            action.variant === 'primary' && "shadow-md shadow-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/30"
          )}
        >
          {action.variant === 'primary' && <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          {action.label}
        </Button>
      ))}
    </div>
  )
}

// 方案总结卡片 - 增强版
function SummaryCard({ sections }: { sections: { title: string; items: { label: string; value: string }[] }[] }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
      {sections.map((section, idx) => {
        const { emoji, text } = extractEmoji(section.title)
        const isCheckItem = section.items.some(item => item.label === '✓')

        return (
          <div
            key={idx}
            className={cn(
              "px-4 py-3",
              idx !== sections.length - 1 && "border-b border-[var(--border-subtle)]"
            )}
          >
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-2">
              {emoji && <span className="text-base">{emoji}</span>}
              <span className="text-sm font-semibold text-[var(--text-primary)]">{text}</span>
            </div>

            {/* 内容 */}
            {section.items.length > 0 && (
              <div className={cn(
                isCheckItem ? "space-y-1" : "grid gap-1.5"
              )}>
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-sm",
                      isCheckItem
                        ? "flex items-start gap-2 text-[var(--text-secondary)]"
                        : "flex justify-between"
                    )}
                  >
                    {isCheckItem ? (
                      <>
                        <span className="text-[var(--color-success)]">✓</span>
                        <span className="flex-1">{item.value}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[var(--text-secondary)]">{item.label}</span>
                        <span className="text-[var(--text-primary)] font-medium text-right max-w-[60%]">{item.value}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default MessageBubble
