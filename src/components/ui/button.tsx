import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-saffron text-navy hover:bg-[#e57f1a]",
        navy: "bg-navy text-white hover:bg-navy-2",
        outline: "border border-navy/25 bg-white text-navy hover:border-navy hover:bg-navy/[0.03]",
        ghost: "text-navy hover:bg-navy/[0.06]",
        light: "bg-white text-navy hover:bg-paper",
        danger: "bg-danger text-white hover:bg-[#8f1c13]",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-5 text-[0.95rem]",
        lg: "min-h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
