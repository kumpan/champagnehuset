"use client";
import type { RichTextField } from "@prismicio/client";
import { ChevronDown } from "lucide-react";
import { m } from "motion/react";
import { useId, useState } from "react";
import { CustomRichText } from "@/components/custom-rich-text";
import { cn } from "@/lib/utils";

type AccordionProps = {
  question: string | null;
  answer: RichTextField;
  sectionTheme: string;
};

const frequentlyAskedThemeTextColors: Record<string, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Brand: "text-ink-flip",
  Dust: "text-spot-ink-dim",
  Slate: "text-spot-ink-flip",
};

const Accordion = ({ question, answer, sectionTheme }: AccordionProps) => {
  const [isActive, setIsActive] = useState(false);
  const panelId = useId();

  return (
    <div className="not-last:border-b border-b-current/30">
      <button
        aria-controls={panelId}
        aria-expanded={isActive}
        className="flex min-h-20 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-semibold lg:min-h-22"
        onClick={() => setIsActive(!isActive)}
        type="button"
      >
        <h4 className="text-pretty font-semibold text-base md:text-lg lg:text-xl">{question}</h4>
        <m.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isActive ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ChevronDown className="size-7 shrink-0 md:size-8" />
        </m.div>
      </button>

      <m.div
        id={panelId}
        inert={!isActive}
        initial={false}
        animate={isActive ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.5, 0, 0.1, 1] }}
        className="overflow-hidden"
      >
        <CustomRichText
          field={answer}
          className={cn(
            frequentlyAskedThemeTextColors[sectionTheme],
            "easeOut pb-7 font-medium transition-colors duration-500",
          )}
        />
      </m.div>
    </div>
  );
};

export default Accordion;
