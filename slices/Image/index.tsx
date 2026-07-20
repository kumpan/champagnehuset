import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ImageGrid } from "./variations/image-grid";
import { ImageShowcase } from "./variations/image-showcase";

export type ImageProps = SliceComponentProps<Content.ImageSlice>;

export default function Image(props: ImageProps) {
  switch (props.slice.variation) {
    case "grid":
      return <ImageGrid {...props} slice={props.slice} />;
    case "showcase":
      return <ImageShowcase {...props} slice={props.slice} />;
  }
}
