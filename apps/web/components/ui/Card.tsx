import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  /** Adds the ember hover-lift — use when the whole card is a link/button. */
  interactive?: boolean;
}

export function Card({
  className,
  children,
  elevated = false,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "surface-forged rounded-lg p-6",
        elevated && "elev-2",
        interactive && "hover-lift cursor-pointer",
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
    <p className={cn("text-caption text-platinum-400 mb-3", className)}>{children}</p>
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
    <h3 className={cn("text-title-lg text-platinum-100", className)}>{children}</h3>
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
    <p className={cn("text-body text-platinum-300 mt-3", className)}>{children}</p>
  );
}
