import { type Content, isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";

import { Button } from "@/components/button";
import { type IconName, iconMap } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro, type SectionTheme } from "@/components/section-intro";
import { cn, hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { EmployeeDocument } from "@/prismicio-types";
import type { ContactProps } from "..";
import { PersonCard } from "../person-card";

type Props = ContactProps & { slice: Content.ContactSlicePeople };

const buttonThemeClasses: Record<SectionTheme, string> = {
  Bud: "",
  Leaf: "",
  Brand: "bg-fill hover:bg-fill/90 text-ink outline-fill-raised/70 selection:bg-brand! selection:text-ink-flip",
  Dust: "bg-spot-fill-dark text-spot-ink-flip hover:bg-spot-fill-dark/90 focus-visible:outline-spot-fill-dark hover:outline-accent/20 outline-accent/0",
  Slate:
    "bg-spot-fill-raised hover:bg-spot-fill-raised/90 text-spot-ink outline-spot-fill-raised/70 selection:bg-spot-fill! selection:text-spot-ink-flip",
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
        isFilled.contentRelationship(item.employee)
          ? // A featured link may point to a deleted/unpublished doc — skip it rather than throw.
            client
              .getByID<EmployeeDocument>(item.employee.id)
              .catch(() => null)
          : null,
      ),
    )
  ).filter((employee): employee is EmployeeDocument => employee !== null);

  // getAllByType throws ("No documents were found") when the repo has no employees yet.
  const employees = curated.length > 0 ? curated : await client.getAllByType("employee").catch(() => []);

  // Nothing to show — render nothing rather than an empty People section.
  if (employees.length === 0) return null;

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
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-8">
            {employees.map((employee) => (
              <PersonCard key={employee.id} employee={employee} sectionTheme={section_theme} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
