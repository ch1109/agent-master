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
    title: '配置管理',
    items: [
      { id: 'intent', label: '意图配置', icon: MessageSquare, href: '/config/intent' },
      { id: 'ui', label: 'UI 配置', icon: Layers, href: '/config/ui' },
      { id: 'dialog', label: '对话流程', icon: FileText, href: '/config/dialog', badge: '开发中' },
      { id: 'knowledge', label: '知识库', icon: FileText, href: '/config/knowledge', badge: '开发中' },
    ],
  },
  {
    title: 'Playground',
    items: [
      { id: 'prompt', label: '提示词优化', icon: Sparkles, href: '/playground/prompt' },
      { id: 'test', label: '测试用例', icon: Settings2, href: '/playground/test', badge: '开发中' },
      { id: 'badcase', label: 'Badcase 管理', icon: Activity, href: '/playground/badcase', badge: '开发中' },
    ],
  },
  {
    title: '运行监控',
    items: [
      { id: 'dashboard', label: '会话监控', icon: Activity, href: '/monitor/dashboard', badge: '开发中' },
      { id: 'logs', label: '日志查询', icon: FileText, href: '/monitor/logs', badge: '开发中' },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentProject = '重庆银行智能助手'

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

