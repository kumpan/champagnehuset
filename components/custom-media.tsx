"use client";

import type { ImageFieldImage } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { m, useInView } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type CustomMediaProps = {
  imageField?: ImageFieldImage;
  videoSrc?: string;
  className?: string;
  preload?: boolean;
  indexedDelay?: boolean;
  index?: number;
  thumbnail?: string;
  sectionTheme?: string;
  filter?: string | null;
};

function parseThumbnail(value?: string) {
  if (!value) return [{ name: undefined, visibility: "" }];

  const segments = value.split(/\s+/).map((part) => {
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) return { breakpoint: "base", name: part };
    return {
      breakpoint: part.slice(0, colonIndex),
      name: part.slice(colonIndex + 1),
    };
  });

  return segments.map((seg, i) => {
    const next = segments[i + 1];
    const classes: string[] = [];

    if (seg.breakpoint !== "base") {
      classes.push("hidden", `${seg.breakpoint}:block`);
    }
    if (next) {
      classes.push(`${next.breakpoint}:hidden`);
    }

    return { name: seg.name, visibility: classes.join(" ") };
  });
}

const imageThemeClasses: Record<string, string> = {
  Pumpkin: "bg-fill-raised",
  Viridian: "bg-accent-fill-raised",
};

const blockVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 0 },
};

const imageVariants = {
  hidden: { scale: 1.05 },
  visible: { scale: 1 },
};

const filterDirectionClasses: Record<string, string> = {
  "top-left": "bg-linear-to-br",
  "top-right": "bg-linear-to-bl",
  "bottom-left": "bg-linear-to-tr",
  "bottom-right": "bg-linear-to-tl",
};

export default function CustomMedia({
  imageField,
  videoSrc,
  className,
  preload,
  indexedDelay = false,
  index = 0,
  thumbnail,
  sectionTheme,
  filter,
}: CustomMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const isActuallyVideo =
    videoSrc &&
    (videoSrc.endsWith(".mp4") ||
      videoSrc.endsWith(".webm") ||
      videoSrc.endsWith(".mov") ||
      videoSrc.endsWith(".avi"));

  const getThumbnail = (name?: string) => {
    if (!imageField) return undefined;
    if (!name) return imageField;
    const imageFieldWithThumbs = imageField as ImageFieldImage &
      Record<string, ImageFieldImage>;
    const thumbnailImage = imageFieldWithThumbs[name];
    return thumbnailImage?.url ? thumbnailImage : imageField;
  };

  const thumbnailSegments = parseThumbnail(thumbnail);
  const filterKey = filter?.toLowerCase().replace(/\s+/g, "-") ?? "";
  const filterDirection = filterDirectionClasses[filterKey];
  const hasFilter = filterKey in filterDirectionClasses;

  const delay = indexedDelay ? index * 0.1 : 0.4;
  const revealed = loaded && isInView;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-4 md:rounded-5",
        className,
      )}
      ref={ref}
    >
      <m.div
        variants={blockVariants}
        initial="hidden"
        animate={revealed ? "visible" : "hidden"}
        transition={{ type: "tween", duration: 1, ease: "easeOut", delay }}
        className={cn("absolute inset-0 z-10", imageThemeClasses[sectionTheme])}
        aria-hidden
      />

      <m.div
        variants={imageVariants}
        initial="hidden"
        animate={revealed ? "visible" : "hidden"}
        transition={{ type: "tween", duration: 3, ease: "easeOut", delay }}
        className="relative h-full w-full"
      >
        {imageField &&
          thumbnailSegments.map((seg) => {
            const thumb = getThumbnail(seg.name);
            if (!thumb) return null;
            return (
              <PrismicNextImage
                key={seg.name ?? "original"}
                field={thumb}
                preload={preload || false}
                onLoad={() => setLoaded(true)}
                fill
                className={cn("object-cover", seg.visibility)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                fallbackAlt=""
              />
            );
          })}
        {isActuallyVideo && (
          <video
            className="h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            src={videoSrc}
            onLoadedData={() => setLoaded(true)}
          />
        )}
        {videoSrc && !isActuallyVideo && (
          <Image
            src={videoSrc}
            alt=""
            fill
            className="object-cover"
            onLoad={() => setLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        )}

        {/* Filter */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br from-0% to-60% to-brand/0 mix-blend-overlay",
            filterDirection,
            hasFilter ? "from-brand/60" : "from-brand/0",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br from-0% to-60% to-brand/0",
            filterDirection,
            hasFilter ? "from-brand/10" : "from-brand/0",
          )}
        />
      </m.div>
    </div>
  );
}
