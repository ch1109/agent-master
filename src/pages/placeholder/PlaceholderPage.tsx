import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

/**
 * 功能开发中的占位页面
 */
export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
          {icon || <Construction className="w-8 h-8 text-[var(--text-tertiary)]" />}
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
          {title}
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          {description || '该功能正在开发中，敬请期待...'}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-sm text-[var(--text-tertiary)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse" />
          开发中
        </div>
      </div>
    </div>
  )
}

export default PlaceholderPage

