/**
 * Diff 对比组件
 * 使用 react-diff-viewer-continued 显示代码变更
 */
import { useMemo } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import { cn } from '@/lib/utils'

export interface DiffViewerProps {
  /** 旧代码 */
  oldCode: string
  /** 新代码 */
  newCode: string
  /** 旧代码标题 */
  oldTitle?: string
  /** 新代码标题 */
  newTitle?: string
  /** 编程语言（用于未来的语法高亮扩展） */
  language?: string
  /** 是否使用分栏视图 */
  splitView?: boolean
  /** 是否只显示差异部分 */
  showDiffOnly?: boolean
  /** 上下文行数（在差异周围显示的行数） */
  contextLines?: number
  /** 额外的类名 */
  className?: string
}

// 自定义样式 - ChatGPT 风格
const customStyles = {
  variables: {
    light: {
      diffViewerBackground: 'var(--bg-surface)',
      diffViewerColor: 'var(--text-primary)',
      addedBackground: 'rgba(46, 160, 67, 0.1)',
      addedColor: 'var(--text-primary)',
      removedBackground: 'rgba(248, 81, 73, 0.1)',
      removedColor: 'var(--text-primary)',
      wordAddedBackground: 'rgba(46, 160, 67, 0.3)',
      wordRemovedBackground: 'rgba(248, 81, 73, 0.3)',
      addedGutterBackground: 'rgba(46, 160, 67, 0.2)',
      removedGutterBackground: 'rgba(248, 81, 73, 0.2)',
      gutterBackground: 'var(--bg-secondary)',
      gutterColor: 'var(--text-tertiary)',
      gutterBackgroundDark: 'var(--bg-secondary)',
      highlightBackground: 'var(--color-primary-muted)',
      highlightGutterBackground: 'var(--color-primary-muted)',
      codeFoldGutterBackground: 'var(--bg-secondary)',
      codeFoldBackground: 'var(--bg-secondary)',
      emptyLineBackground: 'var(--bg-secondary)',
    },
  },
  line: {
    padding: '4px 8px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.6',
  },
  gutter: {
    padding: '4px 8px',
    minWidth: '40px',
    fontSize: '12px',
  },
  contentText: {
    fontFamily: 'var(--font-mono)',
  },
  titleBlock: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '500',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
  },
}

/**
 * Diff 对比查看器
 * - 支持分栏和内联视图
 * - 支持只显示差异部分
 * - ChatGPT 风格样式
 */
export function DiffViewer({
  oldCode,
  newCode,
  oldTitle = '原始版本',
  newTitle = '修改版本',
  splitView = true,
  showDiffOnly = false,
  contextLines = 3,
  className,
}: DiffViewerProps) {
  // 计算统计信息
  const stats = useMemo(() => {
    const oldLines = oldCode.split('\n')
    const newLines = newCode.split('\n')
    
    // 简单统计
    let additions = 0
    let deletions = 0
    
    // 使用简单的行对比
    const maxLen = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < maxLen; i++) {
      if (i >= oldLines.length) {
        additions++
      } else if (i >= newLines.length) {
        deletions++
      } else if (oldLines[i] !== newLines[i]) {
        additions++
        deletions++
      }
    }
    
    return { additions, deletions }
  }, [oldCode, newCode])

  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border-default)] overflow-hidden',
        className
      )}
    >
      {/* 统计信息 */}
      <div className="flex items-center gap-4 px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
        <span className="text-xs text-[var(--text-tertiary)]">变更统计:</span>
        <span className="text-xs text-green-600">+{stats.additions} 行</span>
        <span className="text-xs text-red-600">-{stats.deletions} 行</span>
      </div>

      {/* Diff 视图 */}
      <ReactDiffViewer
        oldValue={oldCode}
        newValue={newCode}
        splitView={splitView}
        showDiffOnly={showDiffOnly}
        extraLinesSurroundingDiff={contextLines}
        leftTitle={oldTitle}
        rightTitle={newTitle}
        styles={customStyles}
        compareMethod={DiffMethod.WORDS}
        useDarkTheme={false}
      />
    </div>
  )
}

export default DiffViewer

