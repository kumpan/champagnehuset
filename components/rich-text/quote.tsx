import { QuoteIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Quote({ children }: { children: ReactNode }) {
  return (
    <span className="my-6 flex flex-row gap-4 md:gap-8">
      <span className="w-[calc(var(--stroke-width)*1px)] shrink-0 rounded-full bg-brand" />
      <span className="flex flex-col gap-2 py-2 md:gap-2 md:py-3">
        <QuoteIcon className="size-8 text-brand" />
        {children}
      </span>
    </span>
  );
}

export function QuoteLarge({ children }: { children: ReactNode }) {
  return (
    <span className="my-6 flex flex-row gap-4 text-xl md:gap-8">
      <span className="w-[calc(var(--stroke-width)*1px)] shrink-0 rounded-full bg-brand" />
      <span className="flex flex-col gap-2 py-2 md:gap-3 md:py-4">
        <QuoteIcon className="size-10 text-brand" />
        {children}
      </span>
    </span>
  );
}
