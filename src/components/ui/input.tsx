import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors",
          "placeholder:text-[var(--text-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
Input.displayName = "Input"

export { Input }

