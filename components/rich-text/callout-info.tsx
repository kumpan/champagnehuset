import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Overline } from "@/components/overline";

export function CalloutInfo({ children }: { children: ReactNode }) {
  return (
    <span className="my-6 flex flex-col gap-2 rounded-4 bg-fill-raised p-4 md:gap-4 md:rounded-5 md:p-8">
      <Overline className="bg-fill">
        <Info /> Info
      </Overline>
      <span>{children}</span>
    </span>
  );
}
