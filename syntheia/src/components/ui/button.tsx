import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary purple button
        default:
          "bg-[#7C3AED] text-white shadow-md hover:bg-[#6D28D9] focus-visible:ring-[#7C3AED]",

        // Destructive
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",

        // Outline - light theme
        outline:
          "border border-[#E5E7EB] bg-white text-[#1A1A2E] shadow-sm hover:bg-[#FAFAFA] hover:border-[#7C3AED] hover:text-[#7C3AED]",

        // Secondary
        secondary:
          "bg-[#FAFAFA] text-[#4A4A5A] shadow-sm hover:bg-[#F8F6F4]",

        // Ghost - light theme
        ghost:
          "text-[#4A4A5A] hover:bg-[#FAFAFA] hover:text-[#7C3AED]",

        // Ghost for dark backgrounds
        "ghost-dark":
          "text-white/80 hover:bg-white/10 hover:text-white",

        // Outline for dark backgrounds
        "outline-dark":
          "border border-white/20 bg-transparent text-white shadow-sm hover:bg-white/10 hover:border-white/40",

        // Link style
        link:
          "text-[#7C3AED] underline-offset-4 hover:underline",

        // Primary gradient button - main CTA
        gradient:
          "bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] text-white font-semibold shadow-lg shadow-[#7C3AED]/25 hover:shadow-xl hover:shadow-[#7C3AED]/30 hover:scale-[1.02] transition-all btn-shimmer",

        // Subtle gradient
        "gradient-subtle":
          "bg-gradient-to-r from-[#7C3AED]/10 via-[#8B5CF6]/10 to-[#6D28D9]/10 text-[#7C3AED] font-semibold hover:from-[#7C3AED]/20 hover:via-[#8B5CF6]/20 hover:to-[#6D28D9]/20 transition-all",

        // White button (for dark backgrounds)
        white:
          "bg-white text-[#1A1A2E] font-semibold shadow-lg hover:bg-[#FAFAFA] hover:shadow-xl transition-all",

        // Outline light (white outline for dark backgrounds)
        "outline-light":
          "border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
