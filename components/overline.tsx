import type * as React from "react";
import { Slot } from "@/lib/slot";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 flex text-base [&>svg]:size-4.5 transition-colors duration-200 ease-in-out" +
  "whitespace-nowrap px-4" +
  "text-ink" +
  "[&>svg]:pointer-events-none [&>svg]:mb-[0.0rem]";

export function Overline({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  asChild?: boolean;
}) {
  const classes = cn(baseClasses, className);
  const Comp = asChild ? Slot : "span";

  return (
    <Comp data-slot="overline" className={cn(classes, "")} {...(props as object)}>
      {children}
    </Comp>
  );
}
