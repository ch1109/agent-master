import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors",
          "placeholder:text-[var(--text-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          error 
            ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
            : "border-[var(--border-default)] focus:border-[var(--color-primary)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

