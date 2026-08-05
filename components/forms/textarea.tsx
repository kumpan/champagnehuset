import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex max-h-64 min-h-24 w-full min-w-0 outline-0",
        "rounded-1 border border-fill-dark",
        "bg-green-10 text-base",
        "px-4 py-3",
        "placeholder:text-muted-foreground",
        "hover:bg-green-10/80 hover:outline-2 hover:outline-brand/40",
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

export { Textarea };
