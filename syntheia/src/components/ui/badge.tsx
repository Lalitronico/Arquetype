import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default - subtle purple
        default:
          "border-transparent bg-[#7C3AED]/10 text-[#7C3AED]",

        // Secondary - gray
        secondary:
          "border-transparent bg-[#FAFAFA] text-[#4A4A5A]",

        // Destructive
        destructive:
          "border-transparent bg-red-100 text-red-700",

        // Outline
        outline:
          "border-[#E5E7EB] text-[#4A4A5A]",

        // Success - green
        success:
          "border-transparent bg-emerald-100 text-emerald-700",

        // Warning - yellow
        warning:
          "border-transparent bg-amber-100 text-amber-700",

        // Info - purple tint
        info:
          "border-transparent bg-[#7C3AED]/5 text-[#6D28D9]",

        // Primary - solid purple
        primary:
          "border-transparent bg-[#7C3AED] text-white",

        // Purple outline
        "purple-outline":
          "border-[#7C3AED]/30 bg-transparent text-[#7C3AED]",

        // Peer reviewed badge (special for SSR section)
        "peer-reviewed":
          "border-[#7C3AED]/20 bg-gradient-to-r from-[#7C3AED]/10 to-[#8B5CF6]/10 text-[#6D28D9] font-medium",

        // For dark backgrounds - light badge
        "dark-light":
          "border-white/20 bg-white/10 text-white",

        // For dark backgrounds - accent
        "dark-accent":
          "border-[#7C3AED]/40 bg-[#7C3AED]/20 text-white",
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
