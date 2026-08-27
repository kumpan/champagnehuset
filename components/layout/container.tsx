import { cn } from "@/lib/utils";

const BREAKPOINTS = [
  { label: "base", range: "flex xxs:hidden", theme: "bg-neutral-300 text-neutral-700" },
  { label: "xxs", range: "hidden xxs:max-xs:flex", theme: "bg-stone-300 text-stone-700" },
  { label: "xs", range: "hidden xs:max-sm:flex", theme: "bg-slate-300 text-slate-700" },
  { label: "sm", range: "hidden sm:max-md:flex", theme: "bg-amber-300 text-amber-700" },
  { label: "md", range: "hidden md:max-lg:flex", theme: "bg-orange-300 text-orange-700" },
  { label: "lg", range: "hidden lg:max-xl:flex", theme: "bg-red-300 text-red-700" },
  { label: "xl", range: "hidden xl:max-2xl:flex", theme: "bg-green-300 text-green-700" },
  { label: "2xl", range: "hidden 2xl:max-3xl:flex", theme: "bg-teal-300 text-teal-700" },
  { label: "3xl", range: "hidden 3xl:max-4xl:flex", theme: "bg-blue-300 text-blue-700" },
  { label: "4xl", range: "hidden 4xl:flex", theme: "bg-purple-300 text-purple-700" },
];

const ResponsiveIndicator = () =>
  BREAKPOINTS.map(({ label, range, theme }) => (
    <div
      key={label}
      className={cn(
        "fixed right-4 bottom-4 z-50 size-10 animate-wiggle-grow items-center justify-center rounded-3 text-sm",
        range,
        theme,
      )}
    >
      {label}
    </div>
  ));

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("mx-auto 3xl:max-w-400 max-w-360 px-4 md:px-6 lg:px-8", className)}>
      {process.env.NODE_ENV !== "production" && <ResponsiveIndicator />}
      {children}
    </div>
  );
};

export { Container };
