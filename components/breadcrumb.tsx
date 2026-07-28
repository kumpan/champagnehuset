import Link from "next/link";
import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; href: string };

type BreadcrumbThemeColors = { base: string; hover: string };

const breadcrumbTheme: Record<string, { dark: BreadcrumbThemeColors; light: BreadcrumbThemeColors }> = {
  Bud: {
    dark: { base: "text-ink-dim bg-brand", hover: "group-hover:text-brand-ink" },
    light: { base: "text-brand-ink bg-brand", hover: "group-hover:text-brand-ink" },
  },
  Leaf: {
    dark: { base: "text-ink-dim bg-brand", hover: "group-hover:text-brand-ink" },
    light: { base: "text-ink-flip bg-brand", hover: "group-hover:text-brand-ink" },
  },
  Dust: {
    dark: { base: "text-spot-ink-dim bg-spot-fill-dark", hover: "group-hover:text-spot-ink-flip" },
    light: { base: "text-spot-ink-flip bg-spot-fill-dark", hover: "group-hover:text-spot-ink-flip" },
  },
};

export function BreadcrumbNav({
  items,
  className,
  colorMode = "dark",
  sectionTheme = "Bud",
}: {
  items: BreadcrumbItem[];
  className?: string;
  colorMode?: "light" | "dark";
  sectionTheme?: string;
}) {
  const { base, hover } = (breadcrumbTheme[sectionTheme] ?? breadcrumbTheme.Bud)[colorMode];

  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-x-1 gap-y-0 text-sm md:text-base", className)}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-0.5">
              {i > 0 && <span className={cn(base, "bg-transparent opacity-50")}>/</span>}
              {isLast ? (
                <span className={cn(base, "max-w-44 truncate bg-transparent px-2 py-1.5 md:max-w-56")}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="group relative max-w-32 rounded-2 px-2 py-1.5 md:max-w-36">
                  <div
                    className={cn(
                      "absolute inset-1 rounded-2 opacity-0",
                      "[transition:inset_350ms_var(--ease-spring-bounce),opacity_200ms_ease-in]",
                      "group-hover:inset-0 group-hover:opacity-100",
                      base,
                    )}
                  />
                  <div
                    className={cn(
                      base,
                      hover,
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
