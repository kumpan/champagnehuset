import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full min-w-0 outline-0",
        "rounded-1 border border-fill-dark",
        "bg-green-10 text-base",
        "px-4 py-1",
        "placeholder:text-muted-foreground",
        "hover:bg-green-10/80",
        "focus-visible:border-brand focus-visible:bg-green-10/90 focus-visible:outline-2 focus-visible:outline-brand/50 focus-visible:outline-offset-2",
        "aria-invalid:border-error aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-200 ease-in-out",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
