"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useId, useState } from "react";

import { Checkbox } from "@/components/forms/checkbox";
import type { SectionTheme } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { FilterGroup, FilterGroupId, FilterSelection } from "./search";

const themeClasses: Record<SectionTheme, { panel: string; count: string; option: string; checked: string }> = {
  Bud: { panel: "text-ink", count: "text-ink-dim", option: "hover:bg-fill", checked: "bg-fill" },
  Leaf: { panel: "text-ink", count: "text-ink-dim", option: "hover:bg-fill", checked: "bg-fill" },
  Bottle: { panel: "text-ink", count: "text-ink-dim", option: "hover:bg-fill", checked: "bg-fill" },
  Dust: {
    panel: "text-spot-ink",
    count: "text-spot-ink-dim",
    option: "hover:bg-spot-fill-raised",
    checked: "bg-spot-fill-raised",
  },
  Slate: {
    panel: "text-spot-ink",
    count: "text-spot-ink-dim",
    option: "hover:bg-spot-fill-raised",
    checked: "bg-spot-fill-raised",
  },
};

type FilterPanelProps = {
  groups: FilterGroup[];
  selection: FilterSelection;
  onToggle: (groupId: FilterGroupId, value: string) => void;
  /** Groups expanded on first render. Tillgänglighet by default, to invite filtering. */
  defaultOpen?: FilterGroupId[];
  sectionTheme?: SectionTheme;
};

export function FilterPanel({
  groups,
  selection,
  onToggle,
  defaultOpen = ["availability"],
  sectionTheme = "Bud",
}: FilterPanelProps) {
  const theme = themeClasses[sectionTheme];
  // The panel renders twice (desktop sidebar + mobile tray), so ids must not collide.
  const panelId = useId();
  const [openGroups, setOpenGroups] = useState<FilterGroupId[]>(defaultOpen);

  const toggleGroup = (id: FilterGroupId) =>
    setOpenGroups((prev) => (prev.includes(id) ? prev.filter((open) => open !== id) : [...prev, id]));

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => {
        const isOpen = openGroups.includes(group.id);
        const selectedCount = selection[group.id]?.length ?? 0;

        return (
          <div key={group.id} className={cn("flex flex-col rounded-1 bg-green-10", theme.panel)}>
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 text-left font-medium"
            >
              <span>
                {group.label}
                {selectedCount > 0 && <span className={theme.count}> · {selectedCount}</span>}
              </span>
              <m.span
                initial={false}
                animate={{ rotate: isOpen ? -180 : 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
              >
                <ChevronDown className="size-6 shrink-0" />
              </m.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="flex flex-col gap-1 px-2 pt-2 pb-2">
                    {group.options.map((option, index) => {
                      const isChecked = selection[group.id]?.includes(option.value) ?? false;
                      const optionId = `${panelId}-${group.id}-${index}`;
                      return (
                        <li key={option.value}>
                          <label
                            htmlFor={optionId}
                            className={cn(
                              "flex min-h-10 cursor-pointer items-center gap-2 rounded-1 px-2 transition-colors duration-200 ease-out",
                              theme.option,
                              isChecked && theme.checked,
                            )}
                          >
                            <Checkbox
                              id={optionId}
                              checked={isChecked}
                              onChange={() => onToggle(group.id, option.value)}
                              sectionTheme={sectionTheme}
                            />
                            <span>{option.label}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
