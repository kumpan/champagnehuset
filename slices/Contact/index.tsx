import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ContactForm } from "./variations/contact-form";
import { ContactPeople } from "./variations/contact-people";
import { ContactRegister } from "./variations/contact-register";

export type ContactProps = SliceComponentProps<Content.ContactSlice>;

export default function Contact(props: ContactProps) {
  switch (props.slice.variation) {
    case "form":
      return <ContactForm {...props} slice={props.slice} />;
    case "people":
      return <ContactPeople {...props} slice={props.slice} />;
    case "register":
      return <ContactRegister {...props} slice={props.slice} />;
  }
}
