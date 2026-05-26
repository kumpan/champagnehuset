import Link from "next/link";
import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; href: string };

const breadcrumbTheme: Record<string, { dark: string; light: string }> = {
  Ocean: {
    dark: "text-ink-dim group-hover:text-brand-ink bg-brand",
    light: "text-brand-ink group-hover:text-brand-ink bg-brand",
  },
  Sunrise: {
    dark: "text-accent-ink-dim group-hover:text-accent-ink bg-accent hover:text-accent-ink-flip",
    light: "text-accent-ink-flip group-hover:text-accent-ink bg-accent hover:text-accent-ink-flip",
  },
  Night: {
    dark: "text-ink-dim group-hover:text-brand-ink bg-brand",
    light: "text-ink-flip group-hover:text-brand-ink bg-brand",
  },
};

export function BreadcrumbNav({
  items,
  className,
  colorMode = "dark",
  sectionTheme = "Ocean",
}: {
  items: BreadcrumbItem[];
  className?: string;
  colorMode?: "light" | "dark";
  sectionTheme?: string;
}) {
  const breadcrumbThemeColors = (breadcrumbTheme[sectionTheme] ?? breadcrumbTheme.Ocean)[colorMode];

  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-1 text-sm md:text-base", className)}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-0.5">
              {i > 0 && <span className={cn(breadcrumbThemeColors, "bg-transparent opacity-50")}>/</span>}
              {isLast ? (
                <span className={cn(breadcrumbThemeColors, "bg-transparent px-2 py-1.5 opacity-50")}>{item.label}</span>
              ) : (
                <Link href={item.href} className="group relative max-w-32 rounded-2 px-2 py-1.5">
                  <div
                    className={cn(
                      "absolute inset-1 rounded-2 opacity-0",
                      "[transition:inset_500ms_var(--ease-spring-bounce),opacity_200ms_ease-in]",
                      "group-hover:inset-0 group-hover:opacity-100",
                      breadcrumbThemeColors,
                    )}
                  />
                  <div
                    className={cn(
                      breadcrumbThemeColors,
                      "relative truncate bg-transparent transition-colors duration-300 ease-in-out",
                    )}
                  >
                    {item.label}
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
