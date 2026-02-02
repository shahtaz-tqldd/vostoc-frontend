import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "mint" | "ink" | "coral" | "tim";

const variantStyles: Record<BadgeVariant, string> = {
  mint: "bg-mint-400/20 text-ink-900 border border-mint-400/50",
  ink: "bg-ink-900/10 text-ink-900 border border-ink-900/20",
  coral: "bg-coral-400/20 text-ink-900 border border-coral-400/50",
  tim: "bg-gradient-to-r from-emerald-400/20 to-orange-200/20 border border-emerald-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "ink", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = "Badge";
