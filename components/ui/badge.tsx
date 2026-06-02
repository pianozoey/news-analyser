import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "mono-label inline-flex items-center rounded-sm border border-primary/70 bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground",
        className
      )}
      {...props}
    />
  );
}
