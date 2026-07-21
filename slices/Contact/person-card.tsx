import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

import type { SectionTheme } from "@/components/section-intro";
import { cn } from "@/lib/utils";
import type { EmployeeDocument } from "@/prismicio-types";

/** Contact lines sit on the section background, one step dimmer than the name. */
const contactThemeClasses: Record<SectionTheme, string> = {
  Bud: "text-ink-dim",
  Leaf: "text-ink-dim",
  Brand: "text-ink-flip",
  Dust: "text-spot-ink-dim",
  Slate: "text-spot-ink-flip",
};

type PersonCardProps = {
  employee: EmployeeDocument;
  sectionTheme: SectionTheme;
  className?: string;
};

export function PersonCard({ employee, sectionTheme, className }: PersonCardProps) {
  const { employee_name, employee_image, employee_title, employee_location, employee_phone, employee_email } =
    employee.data;

  // Title and location are shown as a single line, e.g. "Brand Manager, Stockholm".
  const role = [employee_title, employee_location].filter(Boolean).join(", ");
  const hasContact = role || isFilled.keyText(employee_phone) || isFilled.keyText(employee_email);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-1 bg-brand">
        <PrismicNextImage field={employee_image} className="h-full w-full object-cover" fallbackAlt="" />
      </div>

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
              <a href={`mailto:${employee_email}`} className="truncate underline">
                {employee_email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
