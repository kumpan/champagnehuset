import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";

import { cn } from "@/lib/utils";
import type { EmployeeDocument } from "@/prismicio-types";

const textThemeClasses = {
  Ocean: "text-ink-flip",
  Sunrise: "text-accent-ink-flip",
};

const fade01ThemeClasses = {
  Ocean: "from-brand/40 to-brand/0",
  Sunrise: "from-accent/40 to-accent/0",
};
const fade02ThemeClasses = {
  Ocean: "from-brand/10 to-brand/0",
  Sunrise: "from-accent/10 to-accent/0",
};
const fade03ThemeClasses = {
  Ocean: "from-fill-dark/90 to-fill-dark/0",
  Sunrise: "from-accent-fill-dark/90 to-accent-fill-dark/0",
};

type EmployeeCardProps = {
  employee: EmployeeDocument;
  sectionTheme: "Ocean" | "Sunrise";
  className?: string;
};

export function EmployeeCard({ employee, sectionTheme, className }: EmployeeCardProps) {
  return (
    <PrismicNextLink
      document={employee}
      className={cn("group relative flex aspect-4/5 shrink-0 flex-col gap-2 overflow-hidden rounded-4", className)}
    >
      <PrismicNextImage
        field={employee.data.employee_image}
        className="inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-103"
        fallbackAlt=""
      />

      {/* Background Fade */}
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 h-12 bg-linear-to-t mix-blend-overlay transition-colors duration-500 ease-out md:h-24 lg:h-40",
          fade01ThemeClasses[sectionTheme],
        )}
      />
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 h-12 bg-linear-to-t transition-colors duration-500 ease-out md:h-24 lg:h-40",
          fade02ThemeClasses[sectionTheme],
        )}
      />
      <div
        className={cn(
          "absolute right-0 bottom-0 left-0 h-20 bg-linear-to-t transition-colors duration-500 ease-out md:h-26 lg:h-32",
          fade03ThemeClasses[sectionTheme],
        )}
      />

      {/* Employee Data */}
      <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center px-4 pb-4 text-center">
        <span
          className={cn("line-clamp-2 font-semibold text-xl leading-tight lg:text-2xl", textThemeClasses[sectionTheme])}
        >
          {employee.data.employee_name}
        </span>
        <span className={cn("hidden md:block", textThemeClasses[sectionTheme])}>{employee.data.employee_title}</span>
      </div>
    </PrismicNextLink>
  );
}
