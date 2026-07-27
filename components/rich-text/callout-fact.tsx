import { BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Overline } from "@/components/overline";

export function CalloutFact({ children }: { children: ReactNode }) {
  return (
    <span className="my-6 flex flex-col gap-2 rounded-2 bg-fill-raised p-4 text-accent-ink md:gap-4 md:p-8">
      <Overline>
        <BadgeCheck /> Fact
      </Overline>
      <span>{children}</span>
    </span>
  );
}
