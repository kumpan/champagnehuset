import { type Content, isFilled } from "@prismicio/client";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionIntro } from "@/components/section-intro";
import { hasSectionIntroContent } from "@/lib/utils";
import { createClient } from "@/prismicio";
import type { EmployeeDocument } from "@/prismicio-types";
import type { ContactProps } from "..";
import { PersonCard } from "../person-card";

type Props = ContactProps & { slice: Content.ContactSlicePeople };

export async function ContactPeople({ slice }: Props) {
  const hasIntroContent = hasSectionIntroContent(slice);
  const { overline, title, description, button, section_theme, remove_top_padding, featured_employees } = slice.primary;

  const client = await createClient();

  const curated = (
    await Promise.all(
      featured_employees.map((item) =>
        isFilled.contentRelationship(item.employee)
          ? // If a featured link points to a deleted/unpublished doc, skip it rather than throw
            client
              .getByID<EmployeeDocument>(item.employee.id)
              .catch(() => null)
          : null,
      ),
    )
  ).filter((employee): employee is EmployeeDocument => employee !== null);

  // getAllByType throws ("No documents were found") when the repo has no employees yet.
  const employees = curated.length > 0 ? curated : await client.getAllByType("employee").catch(() => []);

  // Nothing to show, so render nothing rather than an empty People section.
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
          <SectionIntro
            overline={overline}
            title={title}
            description={description}
            buttons={button}
            align="split"
            sectionTheme={section_theme}
          />
        )}
        {employees.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-8">
            {employees.map((employee, index) => (
              <PersonCard key={employee.id} employee={employee} sectionTheme={section_theme} index={index} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
