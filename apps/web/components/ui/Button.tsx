import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center font-medium select-none whitespace-nowrap " +
  "transition-[background-color,color,opacity,transform] duration-[var(--dur-quick)] ease-[var(--ease-standard)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 " +
  "disabled:opacity-[0.38] disabled:pointer-events-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "text-ink-950 bg-gradient-to-b from-ember-400 to-ember-500 hover:from-ember-300 hover:to-ember-400 active:from-ember-500 active:to-ember-600 " +
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_10px_28px_-10px_rgba(255,138,26,0.65)] " +
    "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_14px_36px_-10px_rgba(255,138,26,0.85)]",
  secondary:
    "bg-transparent text-platinum-100 border border-hairline hover:bg-ink-800 hover:border-[color-mix(in_oklab,var(--ember-500)_35%,transparent)]",
  ghost: "bg-transparent text-platinum-300 hover:text-platinum-100 hover:bg-ink-800",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-5 text-[15px] rounded-md gap-2",
  lg: "h-12 px-7 text-[16px] rounded-md gap-2.5",
};

interface SharedProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  trailing?: ReactNode;
  leading?: ReactNode;
}

type ButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"button">, "children" | "className">;

export function Button({
  variant = "primary",
  size = "md",
  trailing,
  leading,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}

type LinkButtonProps = SharedProps & {
  href: string;
  external?: boolean;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  trailing,
  leading,
  className,
  children,
  href,
  external = false,
}: LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer noopener">
        {leading}
        {children}
        {trailing}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {leading}
      {children}
      {trailing}
    </Link>
  );
}
