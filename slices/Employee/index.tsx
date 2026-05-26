import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { EmployeeList } from "./variations/employee-list";
import { EmployeeMarquee } from "./variations/employee-marquee";

export type EmployeeProps = SliceComponentProps<Content.EmployeeSlice>;

export default function Employee(props: EmployeeProps) {
  switch (props.slice.variation) {
    case "marquee":
      return <EmployeeMarquee {...props} slice={props.slice} />;
    case "list":
      return <EmployeeList {...props} slice={props.slice} />;
  }
}
