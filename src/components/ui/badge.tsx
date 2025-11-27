import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary-muted)] text-[var(--color-primary)]",
        secondary: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
        success: "bg-[var(--color-success-muted)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-muted)] text-[var(--color-warning)]",
        error: "bg-[var(--color-error-muted)] text-[var(--color-error)]",
        outline: "border border-[var(--border-default)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

