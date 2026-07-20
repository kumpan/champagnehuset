import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";

import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { Container } from "@/components/layout/container";

type Props = SliceComponentProps<Content.FooterSlice>;

export default function Footer({ slice }: Props) {
  const { logo, logo_link, call_to_action_text, call_to_action_link, links, social_media, policies } = slice.primary;

  return (
    <footer
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="bg-fill-dark py-12 text-ink-flip transition-colors duration-500 ease-in-out md:py-20"
    >
      <Container className="flex flex-col gap-10 md:gap-16">
        {/* Call to action */}
        {(isFilled.richText(call_to_action_text) || call_to_action_link.length > 0) && (
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            {isFilled.richText(call_to_action_text) && (
              <CustomRichText field={call_to_action_text} className="max-w-2xl text-balance" />
            )}
            {call_to_action_link.length > 0 && (
              <div className="flex flex-wrap gap-2 md:gap-3">
                {call_to_action_link.map(
                  (link, index) =>
                    isFilled.link(link) && (
                      <Button key={`${index}-${link.text}`} asChild size="lg" variant="secondary">
                        <PrismicNextLink field={link}>
                          <span>{link.text}</span>
                        </PrismicNextLink>
                      </Button>
                    ),
                )}
              </div>
            )}
          </div>
        )}

        {/* Logo, links & social */}
        <div className="flex flex-col gap-8 border-ink-flip/15 border-t pt-10 md:flex-row md:items-start md:justify-between">
          {isFilled.image(logo) &&
            (isFilled.link(logo_link) ? (
              <PrismicNextLink field={logo_link} className="shrink-0">
                <PrismicNextImage field={logo} className="h-10 w-auto" fallbackAlt="" />
              </PrismicNextLink>
            ) : (
              <PrismicNextImage field={logo} className="h-10 w-auto shrink-0" fallbackAlt="" />
            ))}

          {links.length > 0 && (
            <nav aria-label="Footer">
              <ul className="flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-6">
                {links.map(
                  (item, index) =>
                    isFilled.link(item.link) && (
                      <li key={`${index}-${item.link.text}`}>
                        <PrismicNextLink field={item.link} className="transition-opacity duration-300 hover:opacity-70">
                          {item.link.text}
                        </PrismicNextLink>
                      </li>
                    ),
                )}
              </ul>
            </nav>
          )}

          {social_media.length > 0 && (
            <div className="flex gap-3">
              {social_media.map(
                (item, index) =>
                  isFilled.link(item.link) && (
                    <PrismicNextLink
                      key={`${index}-${item.link.text}`}
                      field={item.link}
                      className="flex size-10 items-center justify-center rounded-full bg-ink-flip/10 transition-colors duration-300 hover:bg-ink-flip/20"
                    >
                      {isFilled.image(item.icon) && (
                        <PrismicNextImage field={item.icon} className="size-5" fallbackAlt="" />
                      )}
                    </PrismicNextLink>
                  ),
              )}
            </div>
          )}
        </div>

        {/* Policies */}
        {policies.length > 0 && (
          <div className="flex flex-wrap gap-4 border-ink-flip/15 border-t pt-6 text-ink-flip/70 text-sm">
            {policies.map(
              (link, index) =>
                isFilled.link(link) && (
                  <PrismicNextLink
                    key={`${index}-${link.text}`}
                    field={link}
                    className="transition-opacity duration-300 hover:opacity-70"
                  >
                    {link.text}
                  </PrismicNextLink>
                ),
            )}
          </div>
        )}
      </Container>
    </footer>
  );
}
