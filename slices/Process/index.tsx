import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ProcessImage } from "./variations/process-image";
import { ProcessLinear } from "./variations/process-linear";
import { ProcessTime } from "./variations/process-time";

export type ProcessProps = SliceComponentProps<Content.ProcessSlice>;

export default function Process(props: ProcessProps) {
  switch (props.slice.variation) {
    case "linear":
      return <ProcessLinear {...props} slice={props.slice} />;
    case "image":
      return <ProcessImage {...props} slice={props.slice} />;
    case "time":
      return <ProcessTime {...props} slice={props.slice} />;
  }
}
