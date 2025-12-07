import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Settings2,
  FileText,
  Layers,
  MessageSquare,
  Activity,
  Bot,
  ChevronDown,
  Sparkles,
  Home,
  Gauge,
  Shield,
  Cpu,
  Sliders,
  AlertCircle,
  Wrench,
} from 'lucide-react'

// 导航菜单项类型
interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

// 导航菜单配置
const navGroups: NavGroup[] = [
  {
    title: '首页',
    items: [
      { id: 'home-agent', label: '虚拟人 Agent 首页', icon: Home, href: '/home/agent' },
    ],
  },
  {
    title: 'Agent 管理',
    items: [
      { id: 'agent-create', label: 'Agent 创建与配置', icon: Bot, href: '/agent/create' },
      { id: 'agent-deploy', label: 'Agent 部署管理', icon: Shield, href: '/agent/deploy' },
      { id: 'agent-monitor', label: 'Agent 监控', icon: Activity, href: '/agent/monitor' },
    ],
  },
  {
    title: '配置管理',
    items: [
      { id: 'intent', label: '意图配置', icon: MessageSquare, href: '/config/intent' },
      { id: 'ui', label: 'UI 配置', icon: Layers, href: '/config/ui' },
      { id: 'dialog', label: '对话流程', icon: FileText, href: '/config/dialog' },
      { id: 'knowledge', label: '知识库', icon: FileText, href: '/config/knowledge' },
    ],
  },
  {
    title: 'Playground',
    items: [
      { id: 'prompt', label: '提示词优化', icon: Sparkles, href: '/playground/prompt' },
      { id: 'prompt-test', label: '提示词测试', icon: Gauge, href: '/playground/prompt/test' },
      { id: 'fewshot-library', label: 'Few-shot 示例库', icon: FileText, href: '/playground/fewshot/library' },
      { id: 'prompt-version', label: '提示词版本管理', icon: Shield, href: '/playground/prompt/version' },
      { id: 'test', label: '测试用例', icon: Settings2, href: '/playground/test' },
      { id: 'badcase', label: 'Badcase 管理', icon: Activity, href: '/playground/badcase' },
    ],
  },
  {
    title: '运行监控',
    items: [
      { id: 'overview', label: '会话总览仪表盘', icon: Gauge, href: '/monitor/overview' },
      { id: 'logs', label: '会话日志查询', icon: FileText, href: '/monitor/logs' },
      { id: 'performance', label: '性能监控', icon: Gauge, href: '/monitor/performance' },
    ],
  },
  {
    title: '系统配置',
    items: [
      { id: 'system-llm', label: 'LLM 模型配置', icon: Sliders, href: '/system/llm' },
      { id: 'system-api', label: 'API 配置', icon: Cpu, href: '/system/api' },
      { id: 'system-alert', label: '告警配置', icon: AlertCircle, href: '/system/alert' },
      { id: 'system-tool', label: '工具配置', icon: Wrench, href: '/system/tool' },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentProject = 'XX银行项目'

  const isActive = (href: string) => location.pathname === href

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)]">
      {/* Logo 区域 */}
      <div className="h-14 px-4 flex items-center border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-[var(--text-primary)]">Agent Master</span>
        </div>
      </div>

      {/* 项目选择器 */}
      <div className="px-3 py-3 border-b border-[var(--border-subtle)]">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[var(--color-primary-muted)] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-[var(--color-primary)]">重</span>
            </div>
            <span className="text-sm text-[var(--text-primary)] truncate">{currentProject}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="px-4 py-2">
              <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                {group.title}
              </span>
            </div>
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        active
                          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? "opacity-100" : "opacity-70")} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 底部区域 */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
          <Settings2 className="w-4 h-4" />
          <span>系统设置</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
