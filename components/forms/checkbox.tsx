import { Check } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const themeClasses = {
  Bud: "border-ink/80 bg-fill outline-brand checked:border-brand checked:bg-brand hover:border-brand hover:outline-brand/30 focus-visible:border-brand focus-visible:outline-brand/30",
  Leaf: "border-ink/80 bg-fill outline-brand checked:border-brand checked:bg-brand hover:border-brand hover:outline-brand/30 focus-visible:border-brand focus-visible:outline-brand/30",
  Brand:
    "border-ink/80 bg-fill outline-brand-fill checked:border-brand-fill checked:bg-brand-fill hover:border-brand-fill hover:outline-brand-fill/30 focus-visible:border-brand-fill focus-visible:outline-brand-fill/30",
  Dust: "border-spot-ink/80 bg-spot-fill-raised outline-spot-fill checked:border-spot-fill checked:bg-spot-fill hover:border-spot-fill hover:outline-spot-fill/30 focus-visible:border-spot-fill focus-visible:outline-spot-fill/30",
  Slate:
    "border-spot-ink-flip/80 bg-spot-fill outline-spot-fill-dark checked:border-spot-fill-dark checked:bg-spot-fill-dark hover:border-spot-fill-dark hover:outline-spot-fill-dark/30 focus-visible:border-spot-fill-dark focus-visible:outline-spot-fill-dark/30",
};

const iconThemeClasses = {
  Bud: "text-ink-flip",
  Leaf: "text-ink-flip",
  Brand: "text-ink-flip",
  Dust: "text-spot-ink-flip",
  Slate: "text-spot-ink-flip",
};

type CheckboxProps = React.ComponentProps<"input"> & {
  sectionTheme?: keyof typeof themeClasses;
};

function Checkbox({ className, sectionTheme = "Bud", ...props }: CheckboxProps) {
  return (
    <span className="relative inline-flex shrink-0">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer size-7 shrink-0 cursor-pointer appearance-none rounded-2 border transition-all duration-200 ease-in-out",
          "outline-0 hover:outline-4 focus-visible:outline-4",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-error aria-invalid:ring-error/20",
          themeClasses[sectionTheme],
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 m-auto size-5 scale-75 opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100",
          iconThemeClasses[sectionTheme],
        )}
      />
    </span>
  );
}

export { Checkbox };
