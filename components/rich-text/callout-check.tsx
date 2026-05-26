import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function CalloutCheck({ children }: { children: ReactNode }) {
  return (
    <span className="mt-0 mb-1 flex w-fit max-w-full flex-row items-center gap-2 rounded-4 bg-fill-raised p-1 pr-4 text-ink">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-3 bg-fill">
        <Check className="size-7" />
      </span>
      <span className="mt-0.5 line-clamp-2">{children}</span>
    </span>
  );
}
