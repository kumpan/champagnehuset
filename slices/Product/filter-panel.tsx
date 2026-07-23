"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useId, useState } from "react";

import { Checkbox } from "@/components/forms/checkbox";
import { cn } from "@/lib/utils";
import type { FilterGroup, FilterGroupId, FilterSelection } from "./search";

type FilterPanelProps = {
  groups: FilterGroup[];
  selection: FilterSelection;
  onToggle: (groupId: FilterGroupId, value: string) => void;
  /** Groups expanded on first render — Tillgänglighet by default, to invite filtering. */
  defaultOpen?: FilterGroupId[];
};

export function FilterPanel({ groups, selection, onToggle, defaultOpen = ["availability"] }: FilterPanelProps) {
  // The panel renders twice (desktop sidebar + mobile tray) — ids must not collide.
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
          <div key={group.id} className="flex flex-col rounded-1 bg-green-10 text-ink">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 px-4 py-2 text-left font-medium"
            >
              <span>
                {group.label}
                {selectedCount > 0 && <span className="text-ink-dim"> · {selectedCount}</span>}
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
                  <ul className="flex flex-col px-2 pt-2 pb-2 gap-1">
                    {group.options.map((option, index) => {
                      const isChecked = selection[group.id]?.includes(option.value) ?? false;
                      const optionId = `${panelId}-${group.id}-${index}`;
                      return (
                        <li key={option.value}>
                          <label
                            htmlFor={optionId}
                            className={cn(
                              "flex min-h-10 hover:bg-fill rounded-1 px-2 cursor-pointer items-center gap-2 transition-colors duration-200 ease-out",
                              isChecked && "bg-fill hover:bg-fill",
                            )}
                          >
                            <Checkbox
                              id={optionId}
                              checked={isChecked}
                              onChange={() => onToggle(group.id, option.value)}
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
