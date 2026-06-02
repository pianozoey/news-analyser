import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "mono-label inline-flex h-10 items-center justify-center rounded-sm border border-primary bg-primary px-4 text-[11px] font-medium text-primary-foreground shadow-none transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
