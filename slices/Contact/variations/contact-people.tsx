import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { Button } from "@/components/button";
import { type IconName, iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { EmployeeDocument } from "@/prismicio-types";
import type { ContactProps } from "..";
import { PersonCard } from "../person-card";

type Props = ContactProps & { slice: Content.ContactSlicePeople };

const overlineThemeClasses = {
  Bud: "bg-fill-raised",
  Dust: "bg-accent-fill-raised",
};

const buttonThemeClasses = {
  Bud: "",
  Dust: "bg-accent text-accent-ink-flip hover:bg-accent/90 focus-visible:outline-accent hover:outline-accent/20 outline-accent/0",
};

function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in iconMap;
}

export async function ContactPeople({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, alignment, button, section_theme, remove_top_padding, featured_employees } =
    slice.primary;

  const client = await createClient();

  const curated = (
    await Promise.all(
      featured_employees.map((item) =>
        isFilled.contentRelationship(item.employee) ? client.getByID<EmployeeDocument>(item.employee.id) : null,
      ),
    )
  ).filter((employee): employee is EmployeeDocument => employee !== null);

  const employees = curated.length > 0 ? curated : await client.getAllByType("employee");

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
                  <Button asChild size="lg" className={cn(buttonThemeClasses[section_theme], "shrink-0")}>
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
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {employees.map((employee) => (
              <PersonCard key={employee.id} employee={employee} sectionTheme={section_theme} className="w-full" />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
