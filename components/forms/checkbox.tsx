import { Check } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const themeClasses = {
  Ocean:
    "border-ink/80 bg-fill outline-brand checked:border-brand checked:bg-brand hover:border-brand hover:outline-brand/30 focus-visible:border-brand focus-visible:outline-brand/30",
  Sunrise:
    "border-accent-ink/80 bg-accent-fill outline-accent checked:border-accent checked:bg-accent hover:border-accent hover:outline-accent/30 focus-visible:border-accent focus-visible:outline-accent/30",
};

const iconThemeClasses = {
  Ocean: "text-ink-flip",
  Sunrise: "text-accent-ink-flip",
};

type CheckboxProps = React.ComponentProps<"input"> & {
  sectionTheme?: keyof typeof themeClasses;
};
[];

function Checkbox({ className, sectionTheme = "Ocean", ...props }: CheckboxProps) {
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
