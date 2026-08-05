"use client";

import type { Language, LinkField } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { Menu, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import type { IconName } from "@/components/icons";
import { iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import type { NavbarDocument } from "@/prismicio-types";
import { AnimatedCTAText, type CtaLinkItem } from "./animated-cta-button";
import { DesktopNavItem } from "./desktop-nav-item";
import { LanguageSwitcher } from "./language-switcher";
import { MobileDropdown, MobileNavItemDirect, MobileNavItemSplit, MobileNavItemToggle } from "./mobile-nav";

export function Navbar({
  prismicData,
  locales,
  masterLocale,
  desktopLogo,
  mobileLogo,
}: {
  prismicData: NavbarDocument;
  locales: Language[];
  masterLocale: string;
  desktopLogo?: ReactNode;
  mobileLogo?: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<number | null>(null);
  const { cta_links, language_switcher } = prismicData.data;

  useEffect(() => {
    if (!mobileMenuOpen) setOpenMobileSection(null);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-fill md:bg-fill-dark/80 xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="fixed top-0 right-0 left-0 z-50 overflow-visible pt-2 lg:pt-3">
        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.div
              id="mobile-menu"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{
                opacity: { duration: 0.25, ease: "easeInOut" },
                scale: { type: "spring", stiffness: 200, damping: 20 },
              }}
              className="absolute top-20 right-4 left-4 z-50 mt-2 origin-top rounded-1 bg-fill-raised md:top-20 md:right-6 md:left-auto md:min-w-96 md:origin-top-right lg:top-23 lg:right-8 xl:hidden"
            >
              <ul className="flex flex-col gap-2 overflow-hidden md:p-2">
                {prismicData.data.links.map((linkItem, index) => {
                  const links = linkItem.link as LinkField[];
                  const mainLink = links[0];
                  const dropdownLinks = links.slice(1).filter((l) => isFilled.link(l));
                  const hasDropdown = dropdownLinks.length > 0;
                  const label = mainLink?.text;
                  const isClickable = isFilled.link(mainLink);
                  const isOpen = openMobileSection === index;

                  if (!label) return null;

                  const onToggle = () => setOpenMobileSection(isOpen ? null : index);
                  const onClose = () => setMobileMenuOpen(false);

                  return (
                    <m.li
                      key={label}
                      initial={{ opacity: 0, y: "-4rem" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "-4rem" }}
                      transition={{
                        delay: index * 0.03 + 0.1,
                        type: "spring",
                        stiffness: 150,
                        damping: 18,
                      }}
                    >
                      {!hasDropdown && isClickable && (
                        <MobileNavItemDirect label={label} link={mainLink} onClose={onClose} />
                      )}
                      {hasDropdown && isClickable && (
                        <MobileNavItemSplit
                          label={label}
                          link={mainLink}
                          isOpen={isOpen}
                          onToggle={onToggle}
                          onClose={onClose}
                        />
                      )}
                      {hasDropdown && !isClickable && (
                        <MobileNavItemToggle label={label} isOpen={isOpen} onToggle={onToggle} />
                      )}
                      {hasDropdown && (
                        <AnimatePresence>
                          {isOpen && <MobileDropdown links={dropdownLinks} onClose={onClose} />}
                        </AnimatePresence>
                      )}
                    </m.li>
                  );
                })}
              </ul>
            </m.div>
          )}
        </AnimatePresence>

        <Container>
          <nav className="flex items-center justify-between rounded-2 border border-border bg-fill py-1 pr-1 pl-3 md:py-2 md:pr-2 md:pl-4 lg:bg-primary/85 lg:pl-4">
            {/* Logo */}
            <PrismicNextLink
              field={
                isFilled.link(prismicData.data.logo_link) ? prismicData.data.logo_link : { link_type: "Web", url: "/" }
              }
              className="h-12 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 lg:focus-visible:outline-primary-foreground"
              aria-label="Go to home page"
            >
              {desktopLogo}
              {mobileLogo}
            </PrismicNextLink>

            {/* Desktop Links & buttons */}
            <div className="flex flex-row gap-2">
              {/* Desktop Navigation Links */}
              <ul className="hidden items-center gap-0 xl:flex">
                {prismicData.data.links.map((linkItem) => (
                  <DesktopNavItem key={(linkItem.link as LinkField[])[0]?.text} linkItem={linkItem} />
                ))}
              </ul>

              <div className="flex items-center gap-1">
                {language_switcher && locales.length > 1 && (
                  <LanguageSwitcher locales={locales} masterLocale={masterLocale} />
                )}

                {/* CTA Buttons */}
                <div className="flex items-center gap-1 lg:gap-2">
                  {cta_links?.map((item: CtaLinkItem, index: number) => {
                    const { cta_link: link, icon, show_on_mobile, alternate_text } = item;
                    if (!isFilled.link(link)) return null;

                    const IconComponent =
                      icon && typeof icon === "string" && icon in iconMap ? iconMap[icon as IconName] : null;

                    return (
                      <Button
                        key={link.url || `cta-${index}`}
                        asChild
                        className={cn(show_on_mobile ? "hidden" : "xs:flex hidden")}
                      >
                        <PrismicNextLink field={link}>
                          {IconComponent && <IconComponent aria-hidden="true" />}
                          <AnimatedCTAText primary={link.text ?? ""} alternate={alternate_text} />
                        </PrismicNextLink>
                      </Button>
                    );
                  })}
                </div>

                {/* Mobile Menu */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex size-12 cursor-pointer items-center justify-center rounded-1 bg-brand p-2 text-brand-ink lg:text-primary xl:hidden"
                  aria-label="Toggle mobile menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  <AnimatePresence mode="popLayout">
                    {mobileMenuOpen ? (
                      <m.div
                        key="close"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{
                          opacity: { duration: 0.3, ease: "easeInOut" },
                          rotate: { type: "spring", stiffness: 300, damping: 18 },
                          scale: { type: "spring", stiffness: 300, damping: 15 },
                        }}
                      >
                        <X aria-hidden="true" />
                      </m.div>
                    ) : (
                      <m.div
                        key="menu"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{
                          opacity: { duration: 0.3, ease: "easeInOut" },
                          rotate: { type: "spring", stiffness: 300, damping: 18 },
                          scale: { type: "spring", stiffness: 300, damping: 15 },
                        }}
                      >
                        <Menu aria-hidden="true" />
                      </m.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </nav>
        </Container>
      </header>
    </>
  );
}
