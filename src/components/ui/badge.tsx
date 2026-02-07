import * as React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "mint" | "ink" | "coral" | "tim";
type StatusVariant = "success" | "pending" | "disabled" | "failed";

const variantStyles: Record<BadgeVariant, string> = {
  mint: "bg-mint-400/20 text-ink-900 border border-mint-400/50",
  ink: "bg-ink-900/10 text-ink-900 border border-ink-900/20",
  coral: "bg-coral-400/20 text-ink-900 border border-coral-400/50",
  tim: "bg-gradient-to-r from-emerald-400/20 to-blue-400/20 border border-emerald-200 text-emerald-600 capitalize",
};

const statusDotStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-500",
  pending: "bg-yellow-400",
  disabled: "bg-gray-400",
  failed: "bg-red-500",
};
const statusTextStyles: Record<StatusVariant, string> = {
  success: "text-emerald-500",
  pending: "text-yellow-400",
  disabled: "text-gray-400",
  failed: "text-red-500",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant;
  label?: string;
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

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant;
  label?: string;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, label, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2",
          className,
        )}
        {...props}
      >
        <span className={cn("h-2 w-2 rounded-full", statusDotStyles[status])} />
        <span className={cn("text-xs font-semibold uppercase tracking-wide", statusTextStyles[status])}>
          {label ?? status}
        </span>
      </span>
    );
  },
);

Badge.displayName = "Badge";
StatusBadge.displayName = "StatusBadge";
