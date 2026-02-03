import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-900 text-white shadow-glow hover:bg-ink-800 border border-ink-900",
  success: "border border-emerald-500 bg-transparent text-emerald-600 hover:bg-emerald-600 hover:text-white",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:border-ink-400 hover:text-ink-800",
  outline:
    "bg-transparent text-ink-900 border border-ink-300 hover:border-ink-500",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-900/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400/60",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
