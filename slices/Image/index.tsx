import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ImageShowcase } from "./variations/image-showcase";

export type ImageProps = SliceComponentProps<Content.ImageSlice>;

export default function Image(props: ImageProps) {
  switch (props.slice.variation) {
    case "showcase":
      return <ImageShowcase {...props} slice={props.slice} />;
  }
}
