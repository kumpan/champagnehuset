import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { StatsBackdrop } from "./variations/stats-backdrop";
import { StatsGrid } from "./variations/stats-grid";
import { StatsSplit } from "./variations/stats-split";

export type StatsProps = SliceComponentProps<Content.StatsSlice>;

export default function Stats(props: StatsProps) {
  switch (props.slice.variation) {
    case "split":
      return <StatsSplit {...props} slice={props.slice} />;
    case "grid":
      return <StatsGrid {...props} slice={props.slice} />;
    case "backdrop":
      return <StatsBackdrop {...props} slice={props.slice} />;
  }
}
