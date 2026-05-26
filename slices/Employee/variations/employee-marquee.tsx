import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { Button } from "@/components/button";
import { type IconName, iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { EmployeeProps } from "..";
import { EmployeeCard } from "../employee-card";

type Props = EmployeeProps & { slice: Content.EmployeeSliceMarquee };

const overlineThemeClasses = {
  Ocean: "bg-fill-raised",
  Sunrise: "bg-accent-fill-raised",
};

const buttonThemeClasses = {
  Ocean: "",
  Sunrise:
    "bg-accent text-accent-ink-flip hover:bg-accent/90 focus-visible:outline-accent hover:outline-accent/20 outline-accent/0",
};

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in iconMap;
}

export async function EmployeeMarquee({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, button, section_theme, remove_top_padding } = slice.primary;

  const client = await createClient();
  const employees = await client.getAllByType("employee");

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      removeTopPadding={remove_top_padding}
      sectionTheme={section_theme}
    >
      <Container>
        {(hasIntroContent || (button[0] && isFilled.link(button[0].link))) && (
          <div
            className={cn(
              "flex flex-col gap-4 md:gap-8",
              alignment ? "items-center justify-center" : "items-start justify-between md:flex-row md:items-end",
            )}
          >
            {hasIntroContent && (
              <SectionIntro
                overline={overline}
                overlineClassName={overlineThemeClasses[section_theme]}
                title={title}
                description={description}
                align={alignment ? "center" : "left"}
                sectionTheme={section_theme}
                className={alignment ? undefined : "flex-1"}
              />
            )}
            {button[0] &&
              isFilled.link(button[0].link) &&
              (() => {
                const btn = button[0];
                const LeftIcon = isIconName(btn.icon_left) ? iconMap[btn.icon_left] : null;
                const RightIcon = isIconName(btn.icon_right) ? iconMap[btn.icon_right] : null;
                return (
                  <Button asChild size="lg" className={cn(buttonThemeClasses[section_theme], "shrink-0 lg:mb-1")}>
                    <PrismicNextLink field={btn.link}>
                      {LeftIcon && <LeftIcon />}
                      <span>{btn.link.text}</span>
                      {RightIcon && <RightIcon />}
                    </PrismicNextLink>
                  </Button>
                );
              })()}
          </div>
        )}
        {employees.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-4">
            <div className="flex w-max animate-marquee-x-medium gap-3">
              {employees.map((employee) => (
                <EmployeeCard
                  key={`a-${employee.id}`}
                  employee={employee}
                  sectionTheme={section_theme}
                  className="w-44 md:w-72 lg:w-80"
                />
              ))}
              {employees.map((employee) => (
                <EmployeeCard
                  key={`b-${employee.id}`}
                  employee={employee}
                  sectionTheme={section_theme}
                  className="w-44 md:w-72 lg:w-80"
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
