"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  name,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      id={id}
      data-slot="switch"
      className={cn(
        "inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs outline-none transition-colors duration-500 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-30",
        checked ? "bg-brand" : "bg-fill-raised",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full ring-0 transition-all duration-300 ease-in-out",
          checked
            ? "translate-x-5.5 bg-fill dark:bg-primary-foreground"
            : "translate-x-0.5 bg-brand dark:bg-foreground",
        )}
      />
    </button>
  );
}

export { Switch };
