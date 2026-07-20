"use client";
import type { RichTextField } from "@prismicio/client";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { CustomRichText } from "@/components/custom-rich-text";
import { cn } from "@/lib/utils";

type AccordionProps = {
  question: string | null;
  answer: RichTextField;
  sectionTheme: string;
};

const frequentlyAskedThemeStyles: Record<string, string> = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

const frequentlyAskedThemeTextColors: Record<string, string> = {
  Bud: "",
  Dust: "text-tertiary-800 text-accent-ink-dim",
};

const Accordion = ({ question, answer, sectionTheme }: AccordionProps) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={cn("rounded-4 transition-colors duration-800 ease-in-out", frequentlyAskedThemeStyles[sectionTheme])}
    >
      <button
        className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left font-semibold lg:min-h-20 lg:px-7"
        onClick={() => setIsActive(!isActive)}
        type="button"
      >
        <h4 className="font-semibold text-base lg:text-lg">{question}</h4>
        <m.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isActive ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ChevronDown className="size-8 shrink-0" />
        </m.div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.5, 0, 0.1, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 lg:px-7 lg:pb-7">
              <CustomRichText
                field={answer}
                className={cn(
                  frequentlyAskedThemeTextColors[sectionTheme],
                  "transition-colors duration-800 ease-in-out",
                )}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
