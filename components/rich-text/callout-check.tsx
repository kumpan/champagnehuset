import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function CalloutCheck({ children }: { children: ReactNode }) {
  return (
    <span className="mt-0 mb-1 flex w-fit max-w-full flex-row items-center gap-1.5">
      <Check className="size-6 shrink-0" />
      <span>{children}</span>
    </span>
  );
}
