import { getSlices, type SliceSimulatorParams } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

// Bare screenshot route for scripts/_capture.mjs: renders ONLY the slice(s) for
// the given ?state=, with no SliceSimulator chrome, so captures frame the slice
// itself. Inherits fonts + MotionProvider from ../layout.tsx.
export default async function SliceShotPage({ searchParams }: SliceSimulatorParams) {
  const { state } = await searchParams;
  const slices = getSlices(state);

  return <SliceZone slices={slices} components={components} />;
}
