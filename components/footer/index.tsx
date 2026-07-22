import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { ReactNode } from "react";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { type IconName, iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { CustomSVG } from "@/components/svg";
import { cn } from "@/lib/utils";
import { FooterCookieButton } from "./cookie-button";

/** Human-readable names for the social platforms shown when a single social link is present. */
const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
};

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in iconMap;
}

/**
 * Content authored before a link field was made repeatable comes back from the API as a single
 * value rather than an array. Normalise both shapes so the footer renders regardless of when the
 * document was last saved.
 */
function toArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

export function Footer({ prismicData }: { prismicData: Content.FooterDocument }) {
  const {
    logo,
    logo_link,
    logo_color,
    call_to_action_text,
    call_to_action_link,
    links,
    social_media,
    company_name,
    policies,
    manage_cookies_label,
  } = prismicData.data;

  const socials = social_media.filter((item) => isFilled.link(item.link));
  const singleSocial = socials.length === 1;
  const ctaLinks = toArray(call_to_action_link).filter((link) => isFilled.link(link));
  const policyLinks = toArray(policies).filter((link) => isFilled.link(link));

  // Logo is an Image field. If an SVG is used, honour the "System Can Override" colour choice
  // by inlining it and letting it inherit currentColor; otherwise render the raster as-is.
  let logoNode: ReactNode = null;
  if (isFilled.image(logo)) {
    const isSvg = typeof logo.url === "string" && logo.url.split("?")[0].endsWith(".svg");
    const inner = isSvg ? (
      <CustomSVG
        src={logo.url}
        processColor={logo_color === "System Can Override the Logo Color"}
        title={logo.alt}
        className="h-16 w-auto text-ink-flip md:h-20"
      />
    ) : (
      <PrismicNextImage field={logo} className="h-16 w-auto md:h-20" fallbackAlt="" />
    );

    logoNode = isFilled.link(logo_link) ? (
      <PrismicNextLink field={logo_link} className="shrink-0 rounded-1">
        {inner}
      </PrismicNextLink>
    ) : (
      inner
    );
  }

  const linkStyles =
    "text-ink-flip/80 underline underline-offset-3 decoration-ink-flip/20 hover:decoration-ink-flip transition-colors duration-300 hover:text-ink-flip";

  return (
    <footer className="bg-brand py-12 text-ink-flip transition-colors duration-500 ease-in-out selection:bg-fill-raised selection:text-ink md:py-16">
      <Container className="flex flex-col gap-12 md:gap-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          {/* Brand block */}
          <div className="flex max-w-md flex-col items-start gap-6">
            {logoNode}

            {isFilled.richText(call_to_action_text) && (
              <CustomRichText field={call_to_action_text} sectionTheme="Brand" className="text-balance" />
            )}

            {(socials.length > 0 || isFilled.keyText(manage_cookies_label)) && (
              <div className="flex flex-col items-start gap-3">
                {socials.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {socials.map((item, index) => {
                      const Icon = isIconName(item.icon) ? iconMap[item.icon] : null;
                      const label =
                        (typeof item.icon === "string" ? socialLabels[item.icon] : undefined) ?? item.link.text ?? "";

                      return singleSocial ? (
                        <Button key={`${index}-${item.icon}`} asChild sectionTheme="Brand">
                          <PrismicNextLink field={item.link}>
                            <span>{label}</span>
                            {Icon && <Icon aria-hidden="true" />}
                          </PrismicNextLink>
                        </Button>
                      ) : (
                        <Button key={`${index}-${item.icon}`} asChild size="icon" sectionTheme="Brand">
                          <PrismicNextLink field={item.link} aria-label={label}>
                            {Icon && <Icon aria-hidden="true" />}
                          </PrismicNextLink>
                        </Button>
                      );
                    })}
                  </div>
                )}

                {isFilled.keyText(manage_cookies_label) && <FooterCookieButton label={manage_cookies_label} />}
              </div>
            )}
          </div>

          {/* Link columns */}
          {links.length > 0 && (
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-16">
              {links.map((group, index) => {
                const groupLinks = toArray(group.link).filter((link) => isFilled.link(link));
                if (!isFilled.keyText(group.title) && groupLinks.length === 0) return null;

                return (
                  <div key={`${index}-${group.title}`}>
                    {isFilled.keyText(group.title) && (
                      <h3 className="mb-4 font-medium text-ink-flip text-lg">{group.title}</h3>
                    )}
                    {groupLinks.length > 0 && (
                      <ul className="flex flex-col gap-2.5">
                        {groupLinks.map((link, linkIndex) => (
                          <li key={`${linkIndex}-${link.text}`}>
                            <PrismicNextLink field={link} className={cn(linkStyles)}>
                              {link.text}
                            </PrismicNextLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* Bottom bar: contact info (CTA links) + policies */}
        {(ctaLinks.length > 0 || policyLinks.length > 0) && (
          <div className="flex flex-col gap-4 border-ink-flip/15 border-t pt-6 text-ink-flip/70 md:flex-row md:items-center md:justify-between">
            {company_name && <p>{company_name}</p>}

            {ctaLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                {ctaLinks.map((link, index) => (
                  <PrismicNextLink key={`${index}-${link.text}`} field={link} className={cn(linkStyles)}>
                    {link.text}
                  </PrismicNextLink>
                ))}
              </div>
            )}

            {policyLinks.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {policyLinks.map((link, index) => (
                  <PrismicNextLink key={`${index}-${link.text}`} field={link} className={cn(linkStyles)}>
                    {link.text}
                  </PrismicNextLink>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </footer>
  );
}
