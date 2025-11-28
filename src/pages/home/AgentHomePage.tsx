import { useState, useRef, useEffect } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  Bot,
  CalendarClock,
  ChevronRight,
  Cpu,
  Gauge,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const resourceStats = [
  {
    key: 'cpu',
    label: 'CPU Load',
    value: 56,
    hint: '轻负载，响应正常',
    icon: Cpu,
    barClass: '[&>div>div]:bg-[#6a8bff]',
  },
  {
    key: 'memory',
    label: 'Memory',
    value: 81,
    hint: '缓存命中率 92%',
    icon: Gauge,
    barClass: '[&>div>div]:bg-[#8b7bff]',
  },
  {
    key: 'token',
    label: 'Token Usage',
    value: 28,
    hint: '长上下文占用已控制',
    icon: Sparkles,
    barClass: '[&>div>div]:bg-[#4cb9ff]',
  },
]

const pendingTasks = [
  { title: '服务 Agent 周报撰写', tag: '内容输出', time: '9:20 AM' },
  { title: '客服知识库更新', tag: '知识库', time: '9:05 AM' },
  { title: '客服技能树更新', tag: '技能树', time: '昨天' },
]

const anomalies = [
  { title: '支付接口阻断 (Badcase)', channel: 'API_GATEWAY', time: '10:42 AM' },
]

const suggestions = [
  '前沿意图优先级提升 + 15%，避开高峰时段的抢占',
  '知识库更精准：新增 12 个产业案例卡片，建议触达银行业务组',
]

const quickActions = [
  { label: '生成日报', icon: Bot },
  { label: '系统体检', icon: ShieldCheck },
  { label: '调整算力', icon: Gauge },
  { label: '查看 Badcase', icon: AlertCircle },
]

const virtualVideoSrc = new URL('../../../虚拟人视频.webm', import.meta.url).href

export function AgentHomePage() {
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = (userMessage: string): string => {
    // 简单的模拟 AI 回复逻辑
    if (userMessage.includes('CPU') || userMessage.includes('cpu') || userMessage.includes('负载')) {
      return '当前 CPU 负载为 56%，处于轻负载状态，系统响应正常。建议继续保持监控。'
    }
    if (userMessage.includes('内存') || userMessage.includes('Memory') || userMessage.includes('memory')) {
      return '当前内存使用率为 81%，缓存命中率达到 92%。内存使用在正常范围内，性能表现良好。'
    }
    if (userMessage.includes('Token') || userMessage.includes('token')) {
      return '当前 Token 使用率为 28%，长上下文占用已得到有效控制，资源利用率合理。'
    }
    if (userMessage.includes('待办') || userMessage.includes('任务')) {
      return '今日有 3 个待办任务：1. 服务 Agent 周报撰写 (9:20 AM)；2. 客服知识库更新 (9:05 AM)；3. 客服技能树更新 (昨天)。需要我帮您处理哪一项？'
    }
    if (userMessage.includes('异常') || userMessage.includes('Badcase') || userMessage.includes('错误')) {
      return '检测到 1 条异常：支付接口阻断 (Badcase)，发生在 10:42 AM，来源 API_GATEWAY。建议立即检查支付网关配置和日志。'
    }
    if (userMessage.includes('日报') || userMessage.includes('报告')) {
      return '好的，我正在为您生成今日工作日报。报告将包含系统运行状态、待办任务进度、异常处理记录等内容，预计 2 分钟内完成。'
    }
    if (userMessage.includes('体检') || userMessage.includes('检查')) {
      return '系统体检已启动，正在检查各项指标：CPU、内存、网络、数据库连接、API 响应时间等。预计 1 分钟内完成全面扫描。'
    }
    return `收到您的消息："${userMessage}"。我是您的 AI 业务管家，可以帮您监控系统状态、处理待办任务、分析异常日志。请问有什么可以帮您的吗？`
  }

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim()
    if (!textToSend) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // 模拟 AI 思考和回复
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateAIResponse(textToSend),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, aiResponse])
    setIsTyping(false)
  }

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording)
    // TODO: 语音识别逻辑
    console.log(isRecording ? '停止录音' : '开始录音')
  }

  const handleQuickAction = (label: string) => {
    let message = ''
    switch (label) {
      case '生成日报':
        message = '请帮我生成今日工作日报'
        break
      case '系统体检':
        message = '请进行系统全面体检'
        break
      case '调整算力':
        message = '当前算力使用情况如何？是否需要调整？'
        break
      case '查看 Badcase':
        message = '请显示当前所有异常和 Badcase'
        break
      default:
        message = label
    }
    handleSend(message)
  }

  const handleCardClick = (cardType: string) => {
    let message = ''
    switch (cardType) {
      case 'cpu':
        message = '请详细说明当前 CPU 负载情况'
        break
      case 'memory':
        message = '请分析当前内存使用状态'
        break
      case 'token':
        message = '请说明 Token 使用情况'
        break
      case 'tasks':
        message = '请列出所有待办任务的详细信息'
        break
      case 'anomaly':
        message = '请详细说明支付接口阻断异常的情况'
        break
      default:
        return
    }
    handleSend(message)
  }

  return (
    <div className="relative h-full overflow-y-auto bg-gradient-to-br from-[#f7f9ff] via-white to-[#f3f5ff]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-24 h-56 w-56 rounded-full bg-[#e5ebff] blur-3xl" />
        <div className="absolute right-16 top-10 h-64 w-64 rounded-full bg-[#efe8ff] blur-3xl" />
        <div className="absolute bottom-12 left-1/3 h-52 w-52 rounded-full bg-[#e7f5ff] blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-[1800px] flex-col gap-4 px-5 py-5">
        <div className="grid gap-4 xl:grid-cols-[580px,1fr]">
          {/* 左侧信息列，支持两列排布 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-[var(--border-subtle)] shadow-sm lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#6b7280]">资源监控</p>
                  <CardTitle className="text-base">Runtime Monitor</CardTitle>
                </div>
                <Badge className="border border-emerald-100 bg-emerald-50 px-2.5 text-[11px] font-semibold uppercase text-emerald-600">
                  Normal
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {resourceStats.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.key}
                      className="space-y-2 cursor-pointer rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
                      onClick={() => handleCardClick(item.key)}
                    >
                      <div className="flex items-center justify-between gap-3 p-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--color-primary)]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{item.hint}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{item.value}%</span>
                        </div>
                      </div>
                      <Progress value={item.value} className={item.barClass} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card
              className="border-[var(--border-subtle)] shadow-sm cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleCardClick('tasks')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#6b7280]">待办任务</p>
                  <CardTitle className="text-base">今日优先</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-error)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-error)]" />
                  +2 since yesterday
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.title} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[var(--color-primary)]">
                        <CalendarClock className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{task.title}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{task.time}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="px-2.5 py-1 text-[11px]">{task.tag}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card
              className="border border-[#ffd9d6] bg-[#fff7f6] shadow-sm cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleCardClick('anomaly')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#f97363]">异常监控</p>
                  <CardTitle className="text-base text-[var(--text-primary)]">需要关注</CardTitle>
                </div>
                <Badge variant="error" className="px-2.5 py-1 text-[11px]">1</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-xl border border-[#ffd9d6] bg-white px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffe9e6] text-[var(--color-error)]">
                        <AlertCircle className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{item.time} · {item.channel}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-[#5f5fff] via-[#6c74ff] to-[#8a5bff] p-[1px] shadow-md lg:col-span-2">
              <div className="relative h-full rounded-[1rem] bg-gradient-to-br from-[#5f5fff] via-[#6c74ff] to-[#8a5bff] px-4 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] opacity-70">Automations</p>
                    <p className="text-lg font-semibold">Agent 一键处理</p>
                    <p className="mt-1 text-sm text-white/70">自动化流程编排与任务回溯</p>
                  </div>
                  <Zap className="h-6 w-6 text-white/80" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  {['日志', '配置', '更多'].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                      <BadgeCheck className="h-4 w-4" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Card className="border-[var(--border-subtle)] shadow-sm">
              <CardHeader className="pb-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[#6b7280]">系统建议</p>
                <CardTitle className="text-base">智能调整</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                    <p className="text-sm text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[var(--border-subtle)] shadow-sm">
              <CardHeader className="pb-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[#6b7280]">任务管理</p>
                <CardTitle className="text-base">派单与托管</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">延迟任务统一，代办自动催办</p>
                  <p className="text-xs text-[var(--text-tertiary)]">保持 SLA，异常自动挂起并标注</p>
                </div>
                <Button variant="secondary" size="sm" className="gap-1">
                  查看详情
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧主工作区 */}
          <Card className="relative flex flex-col overflow-hidden border-[var(--border-subtle)] bg-white/95 shadow-lg">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-12 top-4 h-24 rounded-full bg-gradient-to-b from-[#e6ecff] to-transparent blur-xl" />
              <div className="absolute inset-y-8 left-1/3 h-[70%] w-1/2 -translate-x-1/4 rounded-full bg-gradient-to-br from-[#eef2ff] via-transparent to-[#f5f3ff]" />
            </div>

            <CardHeader className="relative flex flex-row items-start justify-between gap-4 border-b border-[var(--border-subtle)] shrink-0">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6b7280]">虚拟人 Agent</p>
                <CardTitle className="text-xl font-semibold">业务中台助手</CardTitle>
                <p className="text-xs text-[var(--text-secondary)]">Session ID: #8291-XA · 安全连接</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600">在线</Badge>
            </CardHeader>

            <CardContent className="relative flex flex-1 flex-col gap-6 p-8 overflow-hidden">
              <div className="flex flex-1 gap-6 overflow-hidden">
                {/* 左侧虚拟人区域 */}
                <div className={`flex shrink-0 flex-col items-center justify-center transition-all duration-500 ${
                  messages.length === 0 ? 'w-full' : 'w-[420px]'
                }`}>
                  <div className="relative flex h-full w-full items-center justify-center">
                    <video
                      className={`transition-all duration-500 object-contain ${
                        messages.length === 0 ? 'h-[630px] w-auto' : 'h-[630px] w-auto'
                      }`}
                      src={virtualVideoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      poster=""
                      controls={false}
                    />
                  </div>
                </div>

                {/* 右侧内容区域 */}
                <div className={`flex flex-1 flex-col transition-all duration-500 ${
                  messages.length === 0 ? 'items-center justify-center' : 'overflow-y-auto'
                }`}>
                  {messages.length === 0 ? (
                    <div className="w-full max-w-2xl space-y-4 text-center">
                      <p className="text-sm text-[var(--text-secondary)]">
                        您好，我是您的 AI 业务管家，今日系统运行平稳，有 3 个待办任务和 1 条异常日志需要关注。
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {quickActions.map((action) => {
                          const Icon = action.icon
                          return (
                            <Button
                              key={action.label}
                              variant="outline"
                              size="sm"
                              className="gap-2 rounded-full"
                              onClick={() => handleQuickAction(action.label)}
                            >
                              <Icon className="h-4 w-4" />
                              {action.label}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 pr-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3 justify-start">
                          <div className="rounded-2xl border border-[var(--border-subtle)] bg-white px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-tertiary)] [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-tertiary)] [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-tertiary)]" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 shrink-0">
                <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white px-3 py-2.5 shadow-sm">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0 rounded-full"
                    aria-label="附件"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-9 w-9 shrink-0 rounded-full transition-colors ${
                      isRecording
                        ? 'animate-pulse text-red-500'
                        : ''
                    }`}
                    aria-label={isRecording ? '停止录音' : '语音输入'}
                    onClick={handleVoiceToggle}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Input
                    className="flex-1 border-0 bg-transparent px-2 py-1 text-sm placeholder:text-[var(--text-placeholder)] focus-visible:ring-0"
                    placeholder="输入今与 Agent 协作..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                    onClick={() => handleSend()}
                    disabled={!inputText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgentHomePage
