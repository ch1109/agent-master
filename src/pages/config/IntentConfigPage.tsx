import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { mockIntents } from '@/data/intentMockData'

/**
 * 意图配置列表页
 */
export function IntentConfigPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)

  const filteredIntents = mockIntents.filter(intent =>
    intent.name.includes(searchValue)
  )

  const handleIntentClick = (intentId: string) => {
    setSelectedIntent(intentId)
  }

  const handleIntentDoubleClick = (intentId: string) => {
    navigate(`/config/intent/${intentId}`)
  }

  const handleNewIntent = () => {
    navigate('/config/intent/new')
  }

  return (
    <div className="h-full flex flex-col">
      {/* 页面头部 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">意图配置</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              管理 Agent 的意图识别和响应配置
            </p>
          </div>
          <Button onClick={handleNewIntent}>
            <Plus className="w-4 h-4" />
            新建意图
          </Button>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索意图..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">全部类型</Button>
          <Button variant="outline" size="sm">全部状态</Button>
        </div>
      </div>

      {/* 意图列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {filteredIntents.map((intent, index) => (
            <div
              key={intent.id}
              onClick={() => handleIntentClick(intent.id)}
              onDoubleClick={() => handleIntentDoubleClick(intent.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer",
                "animate-in fade-in slide-in-from-bottom-2",
                selectedIntent === intent.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                  : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{intent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{intent.type}</Badge>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      更新于 {intent.updatedAt}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={intent.status === 'active' ? 'success' : 'secondary'}>
                  {intent.status === 'active' ? '已启用' : '草稿'}
                </Badge>
                <button className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-[var(--text-tertiary)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntentConfigPage

