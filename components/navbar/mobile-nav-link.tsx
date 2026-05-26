"use client";

import type { LinkField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { cn } from "@/lib/utils";

export const MobileNavLink = ({
  children,
  field,
  href,
  onClose,
  className,
}: {
  children: React.ReactNode;
  field?: LinkField;
  href?: string;
  onClose: () => void;
  className?: string;
}) => {
  return (
    <PrismicNextLink
      className={cn(
        "group relative flex h-16 cursor-pointer items-center justify-between gap-3 rounded-1.5 px-5 text-lg",
        className,
      )}
      {...(field ? { field } : { href: href as string })}
      onClick={onClose}
    >
      {children}
    </PrismicNextLink>
  );
};
