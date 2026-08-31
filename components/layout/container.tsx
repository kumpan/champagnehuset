import { cn } from "@/lib/utils";

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("mx-auto 3xl:max-w-400 max-w-360 px-4 md:px-6 lg:px-8", className)}>{children}</div>;
};

export { Container };
