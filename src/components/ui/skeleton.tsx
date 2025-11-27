import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * 骨架屏组件
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--bg-secondary)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * 卡片骨架屏
 */
function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
  )
}

/**
 * 列表骨架屏
 */
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 表单骨架屏
 */
function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

/**
 * 聊天骨架屏
 */
function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-16 flex-1 max-w-[70%] rounded-xl" />
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-12 flex-1 max-w-[60%] rounded-xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-20 flex-1 max-w-[80%] rounded-xl" />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, ListSkeleton, FormSkeleton, ChatSkeleton }

