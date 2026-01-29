import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        info:
          "border-transparent bg-[#f5eef5] text-[#584458] dark:bg-[#584458]/20 dark:text-[#d4b4d4]",
        primary:
          "border-transparent bg-[#705670] text-white",
        // Dark theme specific variants - Enhanced neon
        "dark-accent":
          "border-[#d946ef]/40 bg-[#d946ef]/10 text-[#d4b4d4] shadow-[0_0_15px_rgba(217,70,239,0.2)]",
        "dark-outline":
          "border-[#C8A2C8]/40 bg-transparent text-[#C8A2C8]",
        "dark-glow":
          "border-[#d946ef]/50 bg-[#d946ef]/15 text-[#d4b4d4] shadow-[0_0_20px_rgba(217,70,239,0.3)]",
        "dark-success":
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
        "dark-popular":
          "border-transparent bg-gradient-to-r from-[#d946ef] to-[#a855f7] text-white font-bold shadow-[0_0_15px_rgba(217,70,239,0.4)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
