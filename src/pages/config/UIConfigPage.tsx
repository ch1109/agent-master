import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, Image, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useUIConfigStore } from '@/stores/uiConfigStore'

/**
 * UI配置列表页
 */
export function UIConfigPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const { pages, lastSavedPageId, deletePage } = useUIConfigStore()
  const [highlightPageId, setHighlightPageId] = useState<string | null>(null)

  const filteredPages = useMemo(() => (
    pages.filter(page =>
      page.name.includes(searchValue) || page.englishName.toLowerCase().includes(searchValue.toLowerCase())
    )
  ), [pages, searchValue])

  useEffect(() => {
    if (!lastSavedPageId) return
    setHighlightPageId(lastSavedPageId)
    const timer = setTimeout(() => setHighlightPageId(null), 1000)
    return () => clearTimeout(timer)
  }, [lastSavedPageId])

  useEffect(() => {
    const handler = () => setMenuOpenId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handlePageClick = (pageId: string) => {
    setSelectedPage(pageId)
  }

  const handlePageDoubleClick = (pageId: string) => {
    navigate(`/config/ui/${pageId}`)
  }

  const handleNewPage = () => {
    navigate('/config/ui/new')
  }

  const handleDelete = (pageId: string) => {
    deletePage(pageId)
    if (selectedPage === pageId) setSelectedPage(null)
    setMenuOpenId(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 页面头部 */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">UI 配置</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              配置页面信息，让 AI 理解页面能力
            </p>
          </div>
          <Button onClick={handleNewPage}>
            <Plus className="w-4 h-4" />
            添加页面
          </Button>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索页面..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">全部状态</Button>
        </div>
      </div>

      {/* 页面列表 - 卡片网格布局 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page, index) => (
            <div
              key={page.id}
              onClick={() => handlePageClick(page.id)}
              onDoubleClick={() => handlePageDoubleClick(page.id)}
              className={cn(
                "group relative p-4 rounded-lg border transition-all cursor-pointer",
                "animate-in fade-in slide-in-from-bottom-2",
                selectedPage === page.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                  : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]",
                highlightPageId === page.id && "ring-2 ring-[var(--color-success)] ring-offset-1 ring-offset-[var(--bg-base)]"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePageDoubleClick(page.id)
              }}
            >
              {/* 页面预览缩略图 */}
              <div className="aspect-video rounded-md bg-[var(--bg-secondary)] mb-3 flex items-center justify-center border border-[var(--border-subtle)] overflow-hidden">
                {page.thumbnail || page.screenshot ? (
                  <img
                    src={page.thumbnail || page.screenshot}
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-8 h-8 text-[var(--text-disabled)]" />
                )}
              </div>
              
              {/* 页面信息 */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{page.name}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{page.englishName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {highlightPageId === page.id && (
                    <Badge variant="outline">刚保存</Badge>
                  )}
                  <Badge variant={page.status === 'configured' ? 'success' : 'warning'}>
                  {page.status === 'configured' ? '已配置' : '待配置'}
                  </Badge>
                </div>
              </div>
              
              {/* 底部信息 */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-tertiary)]">
                  更新于 {page.updatedAt}
                </span>
                <div className="relative">
                  <button
                    className="p-1 rounded-md hover:bg-[var(--bg-hover)] transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenId(prev => prev === page.id ? null : page.id)
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                  {menuOpenId === page.id && (
                    <div
                      className="absolute right-0 z-10 mt-2 w-32 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full px-3 py-2 text-sm text-left text-[var(--color-error)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
                        onClick={() => handleDelete(page.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        删除页面
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UIConfigPage
