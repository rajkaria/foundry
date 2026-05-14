import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
}

export function Card({
  className,
  children,
  elevated = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-ink-900 border-hairline p-6",
        elevated ? "elev-2" : "elev-1",
        "transition-[background-color,border-color] duration-[var(--dur-base)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-caption text-platinum-400 mb-3", className)}>
      {children}
    </p>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-title-lg text-platinum-100", className)}>
      {children}
    </h3>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-body text-platinum-300 mt-3", className)}>
      {children}
    </p>
  );
}
