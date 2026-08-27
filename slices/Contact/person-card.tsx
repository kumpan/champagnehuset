import { isFilled } from "@prismicio/client";

import CustomMedia from "@/components/custom-media";
import type { SectionTheme } from "@/components/section-intro";
import { cn } from "@/lib/utils";
import type { EmployeeDocument } from "@/prismicio-types";

/** Contact lines sit on the section background, one step dimmer than the name. */
const contactThemeClasses: Record<SectionTheme, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Bottle: "text-ink-dim",
  Dust: "text-spot-ink-dim",
  Slate: "text-spot-ink-flip",
};

type PersonCardProps = {
  employee: EmployeeDocument;
  sectionTheme: SectionTheme;
  index?: number;
  className?: string;
};

export function PersonCard({ employee, sectionTheme, index = 0, className }: PersonCardProps) {
  const { employee_name, employee_image, employee_title, employee_location, employee_phone, employee_email } =
    employee.data;

  // Title and location are shown as a single line, e.g. "Brand Manager, Stockholm".
  const role = [employee_title, employee_location].filter(Boolean).join(", ");
  const hasContact = role || isFilled.keyText(employee_phone) || isFilled.keyText(employee_email);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <CustomMedia
        imageField={employee_image}
        indexedDelay
        index={index}
        sectionTheme={sectionTheme}
        className="aspect-square w-full rounded-1"
      />

      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl leading-tight lg:text-2xl">{employee_name}</p>

        {hasContact && (
          <div className={cn("flex flex-col text-base leading-[1.45]", contactThemeClasses[sectionTheme])}>
            {role && <p>{role}</p>}
            {isFilled.keyText(employee_phone) && (
              <a href={`tel:${employee_phone.replace(/\s+/g, "")}`} className="truncate underline">
                {employee_phone}
              </a>
            )}
            {isFilled.keyText(employee_email) && (
              <a
                href={`mailto:${employee_email}`}
                className="truncate font-medium underline underline-offset-2 transition-colors duration-200 ease-out hover:text-current/80"
              >
                {employee_email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
